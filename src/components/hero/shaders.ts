const noise = /* glsl */ `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`

// A shallow depth relief: enough for the face to sit in space as the camera drifts,
// not so much that the cheeks stretch when the view moves.
export const portraitVert = /* glsl */ `
  uniform sampler2D dAway;
  uniform sampler2D dEye;
  uniform float uGaze;
  uniform float uDepth;
  varying vec2 vUv;
  varying float vDepth;
  void main(){
    vUv = uv;
    float w = smoothstep(0.0, 2.0, uGaze);
    float d = mix(texture2D(dAway, uv).r, texture2D(dEye, uv).r, w);
    vDepth = d;
    vec3 p = position;
    p.z += d * uDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

// Uniform-driven branches (glitch, intro, fire) are coherent across the whole draw,
// so an idle frame only pays for one texture fetch and a little grain.
export const portraitFrag = /* glsl */ `
  precision highp float;
  uniform sampler2D tAway;
  uniform sampler2D tMid;
  uniform sampler2D tEye;
  uniform sampler2D dEye;
  uniform sampler2D tVeins;   // r: vein core, g: glow under the skin, b: distance from the root
  uniform sampler2D tEyesRed; // the glowing irises, cropped from the android frame
  uniform float uGaze;        // 0 away → 1 mid → 2 eye contact
  uniform float uGlitch;      // turn energy
  uniform float uIntro;       // boot-up wipe
  uniform float uFire;        // hover heat
  uniform float uSpread;      // 0 just woke → 1 the fire owns his whole face
  uniform vec2  uMouse;       // pointer in plane uv
  uniform float uAspect;      // plane width / height
  uniform vec2  uTexel;       // one vein-map pixel in uv
  uniform float uTime;
  varying vec2 vUv;
  varying float vDepth;
  ${noise}

  const vec2 EYE_L = vec2(0.4316, 0.6980);
  const vec2 EYE_R = vec2(0.6416, 0.6641);
  const vec4 EYE_RECT = vec4(0.35156, 0.60938, 0.72266, 0.73958); // x0, y0, x1, y1 of tEyesRed

  // Each step of the turn is a short, steep cut hidden inside the glitch.
  vec3 human(vec2 uv){
    if (uGaze <= 0.0) return texture2D(tAway, uv).rgb;
    if (uGaze >= 2.0) return texture2D(tEye, uv).rgb;
    vec3 m = texture2D(tMid, uv).rgb;
    return uGaze < 1.0 ? mix(texture2D(tAway, uv).rgb, m, smoothstep(0.3, 0.7, uGaze))
                       : mix(m, texture2D(tEye, uv).rgb, smoothstep(1.3, 1.7, uGaze));
  }

  float subjectAt(vec2 uv){ return smoothstep(0.08, 0.2, texture2D(dEye, uv).r); }

  void main(){
    vec2 uv = vUv;
    float t = uTime;
    vec3 col;

    if (uGlitch > 0.001) {
      // slice glitch + RGB split, only while he turns
      float slice = floor(uv.y * 48.0);
      float tick = floor(t * 24.0);
      float g = step(0.7, hash(vec2(slice, tick))) * uGlitch;
      uv.x += (hash(vec2(slice + 3.1, tick)) - 0.5) * 0.05 * g;
      float ca = 0.01 * uGlitch;
      col = vec3(human(uv + vec2(ca, 0.0)).r, human(uv).g, human(uv - vec2(ca, 0.0)).b);
    } else {
      col = human(uv);
    }

    float flameA = 0.0;
    float awake = uFire * smoothstep(1.6, 2.0, uGaze);
    if (awake > 0.001) {
      // ---- the burn reveal: a ragged hole that follows the cursor and widens as he heats up ----
      vec2 d = (vUv - uMouse) * vec2(uAspect, 1.0);
      float edgeN = fbm(vec2(atan(d.y, d.x) * 2.2, t * 1.6) + vUv * 3.0);
      float R = mix(0.22, 1.3, uSpread * uSpread) * (0.82 + 0.36 * edgeN) * awake;
      float r = length(d) / max(R, 1e-4);
      float mask = 1.0 - smoothstep(0.35, 1.0, r);

      // ---- veins: they crawl out from his eyes and neck, then fire pulses through them ----
      vec3 V = texture2D(tVeins, vUv).rgb;
      float grow = 0.18 + 0.95 * uSpread + 0.25 * mask;          // how far along each vein the fire has reached
      float lit = (1.0 - smoothstep(grow - 0.06, grow, V.b)) * mask;
      float tip = (1.0 - smoothstep(0.0, 0.05, abs(V.b - grow))) * mask; // white-hot crawling front
      float flow = 0.5 + 0.5 * sin(V.b * 38.0 - t * 5.0);
      float core = V.r * lit;
      float glow = V.g * (1.0 - smoothstep(grow - 0.1, grow + 0.08, V.b)) * mask;

      // raised under the skin: lit from above, shaded below
      float up = texture2D(tVeins, vUv + vec2(0.0, uTexel.y * 2.0)).r;
      float dn = texture2D(tVeins, vUv - vec2(0.0, uTexel.y * 2.0)).r;
      float relief = (dn - up) * lit;

      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      // blood heats up: the skin flushes red around the veins (multiply keeps pores and stubble)
      col *= mix(vec3(1.0), vec3(1.18, 0.5, 0.36), glow * 0.9);
      col *= 1.0 + relief * 0.9;
      // the vein itself: molten, but shaded by the face's own light so it sits inside the skin
      vec3 molten = mix(vec3(0.85, 0.1, 0.02), vec3(1.0, 0.55, 0.16), flow * core);
      col = mix(col, molten * (0.65 + 1.1 * lum + 0.7 * flow), min(1.0, core * 1.15));
      col += vec3(1.0, 0.3, 0.06) * glow * (0.18 + 0.16 * flow); // light bleeding out through the skin
      col += vec3(1.0, 0.82, 0.55) * tip * V.r * 1.6;

      // ---- flames licking off his head and shoulders ----
      float subj = subjectAt(vUv);
      if (subj < 0.99 && vUv.y > 0.3) {
        float wob = (vnoise(vec2(vUv.x * 10.0, t * 1.3)) - 0.5) * 0.025;
        float jit = hash(vUv * 731.0 + fract(t));
        float near = 0.0;
        for (int k = 0; k < 5; k++) {
          float o = (float(k) + jit) * 0.024 + 0.004;
          near = max(near, subjectAt(vUv - vec2(wob * o * 25.0, o)) * (1.0 - o * 6.5));
        }
        float tongue = fbm(vec2(vUv.x * 16.0 * uAspect, vUv.y * 5.0 - t * 2.6));
        float flame = smoothstep(0.0, 0.35, tongue - (1.0 - near) * 0.75 - 0.1) * (1.0 - subj) * smoothstep(0.3, 0.55, vUv.y);
        vec3 flameCol = mix(vec3(0.55, 0.04, 0.01), vec3(1.0, 0.38, 0.06), smoothstep(0.2, 0.7, flame));
        col += flameCol * flame * 1.1 * mask;
        flameA = flame * mask * 0.9;
      }

      // ---- eyes: the red irises from the android frame, set into his real eyes ----
      vec2 eu = (vUv - EYE_RECT.xy) / (EYE_RECT.zw - EYE_RECT.xy);
      vec3 red = texture2D(tEyesRed, eu).rgb;
      float breathe = 0.85 + 0.15 * sin(t * 2.2);
      for (int i = 0; i < 2; i++) {
        vec2 e = i == 0 ? EYE_L : EYE_R;
        float de = length((vUv - e) * vec2(uAspect, 1.0));
        float iris = (1.0 - smoothstep(0.0085, 0.0145, de)) * awake;
        col = mix(col, red * (1.0 + 0.35 * breathe), iris);
        col += vec3(1.0, 0.12, 0.04) * exp(-de * 110.0) * 0.28 * breathe * awake;
      }
    }

    float boot = 1.0;
    float hot = 0.0;
    if (uIntro < 1.0) {
      // boot-up wipe from the bottom with a hot leading line
      float n = fbm(vUv * 6.0);
      float front = uIntro * 1.35 - 0.15;
      float y = vUv.y + n * 0.12;
      boot = (1.0 - smoothstep(front - 0.06, front, y));
      hot = (1.0 - smoothstep(0.0, 0.03, abs(y - front)));
      col = col * boot + vec3(1.0, 0.25, 0.15) * hot * 2.0;
    }

    // fine film grain
    col += (hash(vUv * 1200.0 + t) - 0.5) * 0.03;

    // cut-out: the black studio void becomes transparent so the name and grid show through
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    float alpha = max(max(smoothstep(0.03, 0.16, vDepth), smoothstep(0.03, 0.18, luma)), flameA);
    alpha *= smoothstep(0.0, 0.08, vUv.x) * (1.0 - smoothstep(0.92, 1.0, vUv.x)) * (1.0 - smoothstep(0.94, 1.0, vUv.y));
    alpha = max(alpha, hot) * max(boot, hot);
    gl_FragColor = vec4(col, alpha);
  }
`

// Floating dust that turns into rising embers while he burns.
export const dustVert = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uFire;
  uniform float uPixel;
  varying float vSeed;
  varying float vFade;
  void main(){
    vSeed = aSeed;
    vec3 p = position;
    float t = uTime * (0.05 + aSeed * 0.08) * (1.0 + uFire * 4.0);
    p.y = mod(p.y + t + 3.0, 6.0) - 3.0;              // endless upward drift, faster when hot
    p.x += sin(uTime * (0.4 + uFire) + aSeed * 12.0) * (0.12 + uFire * 0.1);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float flicker = 0.7 + 0.3 * sin(uTime * 14.0 + aSeed * 40.0);
    gl_PointSize = aSize * uPixel * (1.0 + uFire * 0.6 * flicker) * (6.0 / -mv.z);
    vFade = (1.0 - smoothstep(1.8, 3.0, abs(p.y)));
  }
`

export const dustFrag = /* glsl */ `
  precision highp float;
  uniform float uFire;
  varying float vSeed;
  varying float vFade;
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float a = (1.0 - smoothstep(0.0, 0.5, length(c)));
    vec3 ember = mix(vec3(1.0, 0.16, 0.06), vec3(1.0, 0.62, 0.2), vSeed);
    vec3 white = vec3(0.92, 0.92, 0.9);
    vec3 col = mix(white, ember, max(step(0.7, vSeed), uFire));
    gl_FragColor = vec4(col, a * vFade * (0.35 + uFire * 0.55));
  }
`
