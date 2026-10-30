import { Suspense, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, Text, useTexture } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { portraitVert, portraitFrag, dustVert, dustFrag } from './shaders'

export type HeroCtrl = {
  gaze: number
  glitch: number
  intro: number
  scroll: number
  px: number // pointer in hero NDC
  py: number
  pointerIn: boolean // a mouse is over the hero, or a finger is down
  armed: boolean // he is looking at you, so the fire may wake
  fire: number // written by the scene: heat under the cursor
  spread: number // written by the scene: how far the fire has spread
  onFace?: (on: boolean) => void
  reduced: boolean
}

const IMG = ['/img/hero_away.webp', '/img/hero_mid.webp', '/img/hero_eye.webp', '/img/hero_eyes_red.webp']
const DATA = ['/img/hero_away_depth.webp', '/img/hero_eye_depth.webp', '/img/hero_veins.webp']
const FONT = '/fonts/unbounded-latin-800-normal.woff'
useTexture.preload([...IMG, ...DATA])

const damp = THREE.MathUtils.damp
const PLANE_H = 1.5
// the copy block on the left of the hero (left gutter + max-w-md), in CSS px
const COPY_RIGHT = 48 + 448

// Read the depth map once on the CPU so "is the cursor on him?" follows his real silhouette.
function depthSampler(img: CanvasImageSource) {
  const w = 96
  const h = 144
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const cx = cv.getContext('2d', { willReadFrequently: true })!
  cx.drawImage(img, 0, 0, w, h)
  const data = cx.getImageData(0, 0, w, h).data
  return (u: number, v: number) => {
    const x = Math.min(w - 1, Math.max(0, Math.floor(u * w)))
    const y = Math.min(h - 1, Math.max(0, Math.floor((1 - v) * h)))
    return data[(y * w + x) * 4] / 255
  }
}

function Portrait({ ctrl }: { ctrl: RefObject<HeroCtrl> }) {
  const [tAway, tMid, tEye, tEyesRed] = useTexture(IMG)
  const [dAway, dEye, tVeins] = useTexture(DATA)
  useMemo(() => {
    for (const t of [tAway, tMid, tEye, tEyesRed]) {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
    }
    tEyesRed.wrapS = tEyesRed.wrapT = THREE.ClampToEdgeWrapping
  }, [tAway, tMid, tEye, tEyesRed])
  const depthAt = useMemo(() => depthSampler(dEye.image as HTMLImageElement), [dEye])

  const group = useRef<THREE.Group>(null)
  const hit = useRef<THREE.Mesh>(null)
  const { viewport, camera, raycaster, size } = useThree()

  const uniforms = useMemo(
    () => ({
      tAway: { value: tAway }, tMid: { value: tMid }, tEye: { value: tEye }, tEyesRed: { value: tEyesRed },
      dAway: { value: dAway }, dEye: { value: dEye }, tVeins: { value: tVeins },
      uGaze: { value: 0 }, uGlitch: { value: 0 }, uIntro: { value: 0 }, uFire: { value: 0 }, uSpread: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.6) }, uAspect: { value: 2 / 3 }, uDepth: { value: 0.14 }, uTime: { value: 0 },
      uTexel: { value: new THREE.Vector2(1 / 1024, 1 / 1536) },
    }),
    [tAway, tMid, tEye, tEyesRed, dAway, dEye, tVeins],
  )

  const geo = useMemo(() => new THREE.PlaneGeometry(1, PLANE_H, 128, 192), [])
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: portraitVert, fragmentShader: portraitFrag, uniforms, transparent: true }),
    [uniforms],
  )
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const mouseUv = useRef(new THREE.Vector2(0.5, 0.6))
  const wasOn = useRef(false)

  useFrame((state, dt) => {
    const c = ctrl.current
    if (!c || !group.current) return
    const u = uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uGaze.value = c.gaze
    u.uGlitch.value = c.glitch
    u.uIntro.value = c.intro

    // full viewport height, portrait 2:3, cover on phones — uniform scale only, never squashed
    const tall = viewport.aspect < 0.8
    const h = viewport.height * 1.04
    const s = Math.max(h / PLANE_H, tall ? viewport.width * 1.02 : 0)
    const k = s * (1.12 - 0.12 * c.intro) * (1 - c.scroll * 0.15)
    group.current.scale.setScalar(k)
    // on landscape screens, slide him right just enough that the copy never sits on his face
    let shift = 0
    if (viewport.aspect >= 1) {
      const px = Math.min(size.width * 0.22, Math.max(0, COPY_RIGHT + 24 + size.height * 0.13 - size.width / 2))
      shift = (px / size.width) * viewport.width
    }
    group.current.position.x = shift
    group.current.position.y = -viewport.height * (tall ? 0.09 : 0.03) + c.scroll * 0.5
    group.current.position.z = -c.scroll * 0.8

    // once he's watching you, his head tracks you — a few degrees, so the face never warps
    const follow = c.reduced ? 0 : 0.045 * Math.min(c.gaze / 2, 1)
    group.current.rotation.y = damp(group.current.rotation.y, c.px * follow, 3, dt)
    group.current.rotation.x = damp(group.current.rotation.x, -c.py * follow * 0.6, 3, dt)

    // pointer → portrait uv → is it on his face?
    let on = false
    if (hit.current && c.pointerIn) {
      raycaster.setFromCamera(ndc.set(c.px, c.py), camera)
      const i = raycaster.intersectObject(hit.current)[0]
      if (i?.uv) {
        mouseUv.current.lerp(i.uv, Math.min(1, dt * 12))
        on = i.uv.y > 0.4 && depthAt(i.uv.x, i.uv.y) > 0.14
      }
    }
    if (on !== wasOn.current) {
      wasOn.current = on
      c.onFace?.(on)
    }
    const lit = on && c.armed
    c.fire = damp(c.fire, lit ? 1 : 0, lit ? 5 : 2.5, dt)
    // keep hovering and the fire runs through his whole face; leave and it dies back
    c.spread = lit ? Math.min(1, c.spread + dt * 0.4) : Math.max(0, c.spread - dt * 0.8)
    u.uFire.value = c.fire
    u.uSpread.value = c.spread
    u.uMouse.value.copy(mouseUv.current)
  })

  return (
    <group ref={group}>
      <mesh geometry={geo} material={mat} />
      <mesh ref={hit} visible={false} position-z={0.08}>
        <planeGeometry args={[1, PLANE_H]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}

// His name, huge, standing behind his head. It heats up with him.
function BackName({ ctrl }: { ctrl: RefObject<HeroCtrl> }) {
  const group = useRef<THREE.Group>(null)
  const width = useRef(0)
  const { camera, viewport } = useThree()
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#f4f3ee', toneMapped: false, transparent: true, opacity: 0 }), [])
  const bone = useMemo(() => new THREE.Color('#f4f3ee'), [])
  const ember = useMemo(() => new THREE.Color(2.2, 0.42, 0.1), [])
  const Z = -1.1

  useFrame((state, dt) => {
    const c = ctrl.current
    if (!c || !group.current || !width.current) return
    const vp = viewport.getCurrentViewport(camera, [0, 0, Z])
    const tall = vp.aspect < 0.8
    group.current.scale.setScalar(((vp.width * (tall ? 0.94 : 0.92)) / width.current) * (1.06 - 0.06 * c.intro))
    // phones: above his head; landscape: behind it, at brow-to-crown height
    group.current.position.y = vp.height * (tall ? 0.37 : vp.aspect < 1.45 ? 0.315 : 0.28) + c.scroll * 0.9
    const flick = 0.85 + 0.15 * Math.sin(state.clock.elapsedTime * 21.0) * Math.sin(state.clock.elapsedTime * 7.3)
    mat.color.copy(bone).lerp(ember, c.fire * (0.55 + 0.45 * c.spread) * flick)
    mat.opacity = damp(mat.opacity, c.intro > 0.3 ? 1 : 0, 3, dt)
  })

  return (
    <group ref={group} position={[0, 0, Z]}>
      <Text
        font={FONT}
        fontSize={1}
        letterSpacing={-0.03}
        anchorX="center"
        anchorY="middle"
        material={mat}
        onSync={(t) => {
          const b = (t as unknown as { textRenderInfo?: { blockBounds: number[] } }).textRenderInfo?.blockBounds
          if (b) width.current = b[2] - b[0]
        }}
      >
        SOUVIK
      </Text>
    </group>
  )
}

function Dust({ ctrl, count = 900 }: { ctrl: RefObject<HeroCtrl>; count?: number }) {
  const { gl } = useThree()
  const [geo, mat] = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const size = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 7
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = -2.5 + Math.random() * 4
      seed[i] = Math.random()
      size[i] = 1.5 + Math.random() * 3.5
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      uniforms: { uTime: { value: 0 }, uFire: { value: 0 }, uPixel: { value: gl.getPixelRatio() } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return [g, m]
  }, [count, gl])

  useFrame((state) => {
    const c = ctrl.current
    if (!c) return
    mat.uniforms.uTime.value = c.reduced ? 0 : state.clock.elapsedTime
    mat.uniforms.uFire.value = c.fire
    mat.uniforms.uPixel.value = state.gl.getPixelRatio()
  })

  return <points geometry={geo} material={mat} />
}

// A receding grid wall — the 48px parallax grid from the reference, rebuilt in 3D.
function GridWall({ ctrl }: { ctrl: RefObject<HeroCtrl> }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uFire: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          precision highp float; varying vec2 vUv; uniform float uFire;
          void main(){
            vec2 g = vUv * vec2(60.0, 40.0);
            vec2 f = abs(fract(g - 0.5) - 0.5) / fwidth(g);
            float line = 1.0 - min(min(f.x, f.y), 1.0);
            float fade = 1.0 - smoothstep(0.0, 0.75, length((vUv - 0.5) * vec2(1.4, 1.0)));
            vec3 col = mix(vec3(0.39, 0.45, 0.55), vec3(1.0, 0.22, 0.08), uFire);
            gl_FragColor = vec4(col, line * (0.16 + uFire * 0.1) * fade);
          }`,
      }),
    [],
  )
  useFrame(() => {
    mat.uniforms.uFire.value = ctrl.current?.fire ?? 0
  })
  return (
    <mesh position={[0, 0, -3.2]} material={mat}>
      <planeGeometry args={[30, 20]} />
    </mesh>
  )
}

function CameraRig({ ctrl }: { ctrl: RefObject<HeroCtrl> }) {
  const look = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  useFrame((state, dt) => {
    const c = ctrl.current
    if (!c) return
    const amp = c.reduced ? 0 : 1
    state.camera.position.x = damp(state.camera.position.x, c.px * 0.28 * amp, 2.5, dt)
    state.camera.position.y = damp(state.camera.position.y, c.py * 0.16 * amp, 2.5, dt)
    state.camera.lookAt(look)
  })
  return null
}

const MAX_DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1

export default function PortraitScene({ ctrl, active }: { ctrl: RefObject<HeroCtrl>; active: boolean }) {
  // start sharp, and drop resolution only if this device can't hold the frame rate
  const [dpr, setDpr] = useState(MAX_DPR)
  return (
    <Canvas
      dpr={dpr}
      flat
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 35, position: [0, 0, 6], near: 0.1, far: 50 }}
      onCreated={({ gl }) => gl.setClearColor('#000000', 1)}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(MAX_DPR)} flipflops={3} onFallback={() => setDpr(1)} />
      <CameraRig ctrl={ctrl} />
      <GridWall ctrl={ctrl} />
      <Suspense fallback={null}>
        <BackName ctrl={ctrl} />
        <Portrait ctrl={ctrl} />
      </Suspense>
      <Dust ctrl={ctrl} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.85} luminanceThreshold={0.85} luminanceSmoothing={0.15} mipmapBlur levels={6} />
        <Vignette offset={0.28} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
