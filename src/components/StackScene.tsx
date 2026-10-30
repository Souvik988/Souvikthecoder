import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard, Text, MeshDistortMaterial, OrbitControls, Float, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { stack } from '@/content'

// Fibonacci sphere so labels spread evenly.
function useSpherePoints(n: number, r: number) {
  return useMemo(() => {
    const pts: THREE.Vector3[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const rad = Math.sqrt(1 - y * y)
      const t = phi * i
      pts.push(new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r))
    }
    return pts
  }, [n, r])
}

const LABEL_FONT = '/fonts/unbounded-latin-400-normal.woff'
const BONE = new THREE.Color('#ecebe6')
const SIGNAL = new THREE.Color('#ff2a1f')

// GPU text on billboards: no DOM nodes re-styled every frame.
function Label({ text, pos }: { text: string; pos: THREE.Vector3 }) {
  const group = useRef<THREE.Group>(null)
  const world = useMemo(() => new THREE.Vector3(), [])
  const cam = useMemo(() => new THREE.Vector3(), [])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: BONE, transparent: true, toneMapped: false, depthWrite: false }), [])
  useFrame(({ camera }) => {
    if (!group.current) return
    group.current.getWorldPosition(world)
    // fade and shrink labels on the far side of the sphere
    const facing = world.normalize().dot(cam.copy(camera.position).normalize())
    const o = THREE.MathUtils.mapLinear(facing, -1, 1, 0.08, 1)
    mat.opacity = o
    group.current.scale.setScalar(0.7 + o * 0.45)
    mat.color.copy(facing > 0.75 ? SIGNAL : BONE)
  })
  return (
    <group ref={group} position={pos}>
      <Billboard>
        <Text font={LABEL_FONT} fontSize={0.17} anchorX="center" anchorY="middle" material={mat} letterSpacing={-0.02}>
          {text}
        </Text>
      </Billboard>
    </group>
  )
}

function Cloud() {
  const g = useRef<THREE.Group>(null)
  const pts = useSpherePoints(stack.length, 2.4)
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.12
  })
  return (
    <group ref={g}>
      {stack.map((s, i) => (
        <Label key={s} text={s} pos={pts[i]} />
      ))}
    </group>
  )
}

function Core() {
  const mat = useRef<React.ComponentRef<typeof MeshDistortMaterial>>(null)
  useFrame(({ pointer }) => {
    if (mat.current) mat.current.distort = THREE.MathUtils.lerp(mat.current.distort, 0.25 + Math.hypot(pointer.x, pointer.y) * 0.35, 0.05)
  })
  return (
    <Float speed={1.6} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh>
        <icosahedronGeometry args={[1.05, 14]} />
        <MeshDistortMaterial ref={mat} color="#111214" roughness={0.15} metalness={1} distort={0.3} speed={2} />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#ff2a1f" wireframe transparent opacity={0.35} />
      </mesh>
    </Float>
  )
}

export default function StackScene({ active }: { active: boolean }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const wide = window.innerWidth >= 768
  return (
    <Canvas dpr={[1, 1.25]} gl={{ antialias: true, stencil: false, powerPreference: 'high-performance' }} frameloop={active && !reduced ? 'always' : 'demand'} camera={{ position: [0, 0, 7.2], fov: 40 }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[4, 3, 4]} intensity={40} color="#ff2a1f" />
      <pointLight position={[-4, -2, 3]} intensity={25} color="#9aa3ad" />
      <directionalLight position={[0, 5, 5]} intensity={1.2} />
      {/* studio reflections built from light cards — no HDR download */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} color="#ff2a1f" position={[3, 1, 2]} scale={[2, 4, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#ecebe6" position={[-3, 2, 3]} scale={[3, 1, 1]} />
        <Lightformer form="ring" intensity={2} color="#9aa3ad" position={[0, -3, 2]} scale={2} />
      </Environment>
      <group position={wide ? [1.4, -0.2, 0] : [0, -1.1, 0]} scale={wide ? 1 : 0.82}>
        <Core />
        <Cloud />
      </group>
      {/* touch devices keep native scrolling; drag-to-spin is a pointer nicety */}
      {window.matchMedia('(pointer: fine)').matches && <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />}
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}
