// RegLife 3D city. Created by Anthony Onoja, Ph.D., University of Surrey.
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, MapControls } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { BUILDINGS, BY_ID, LANDS, NOTICE_BOARDS, ROADS } from '../content/city'
import type { Building, District } from '../content/types'
import { useDark } from '../lib/useDark'

/* map grid (x,y) -> world (X,Z); y on the map runs towards the viewer */
const W = (x: number, y: number): [number, number] => [x - 12, y - 11.75]
const HU = 0.9 // world units per storey block

const PAL = {
  light: { sky: '#CFE3F3', water: '#8FBBE0', land: '#CFE4C3', edge: '#94B985', road: '#B4BEC9', line: '#EEF2F6', tree: '#58A465', tree2: '#3F8A50', trunk: '#7A5A3C', roof: '#F1F4F7', win: '#CFE2F2', winGlow: '#000000', sun: 1.25, hemi: 0.9,
    own: '#46A592', uk: '#8797D8', eu: '#6FA1D8', us: '#D79676', care: '#E3B160' },
  dark: { sky: '#0B1520', water: '#0F2536', land: '#203A2D', edge: '#13261C', road: '#38444F', line: '#56636F', tree: '#2F6B40', tree2: '#245533', trunk: '#4A3826', roof: '#2A3846', win: '#1B2733', winGlow: '#F5D37A', sun: 0.35, hemi: 0.35,
    own: '#2F7F70', uk: '#4D5C98', eu: '#3F6A9A', us: '#99604A', care: '#9F7735' }
}
type Pal = typeof PAL.light

function windowTexture(lit: boolean) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = lit ? '#000' : '#fff'; g.fillRect(0, 0, 64, 64)
  g.fillStyle = lit ? '#fff' : '#9DB4C8'
  for (let y = 8; y < 64; y += 24) for (let x = 8; x < 64; x += 24) g.fillRect(x, y, 14, 12)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace
  return t
}

function BuildingMesh({ b, pal, dark, active, onOpen }: { b: Building; pal: Pal; dark: boolean; active: boolean; onOpen: (id: string) => void }) {
  const [hover, setHover] = useState(false)
  const [X, Z] = W(b.x + b.w / 2, b.y + b.d / 2)
  const H = b.h * HU
  const color = pal[b.k as District]
  const mats = useMemo(() => {
    const map = windowTexture(false); map.repeat.set(Math.max(1, Math.round(Math.max(b.w, b.d) * 1.6)), Math.max(1, Math.round(b.h * 1.3)))
    const glow = windowTexture(true); glow.repeat.copy(map.repeat)
    const wall = new THREE.MeshStandardMaterial({ color, map, emissive: new THREE.Color(pal.winGlow), emissiveMap: glow, emissiveIntensity: dark ? 0.9 : 0, roughness: 0.8 })
    const roof = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).lerp(new THREE.Color(pal.roof), 0.35), roughness: 0.9 })
    return [wall, wall, roof, roof, wall, wall]
  }, [color, b, pal, dark])
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta > 6) return; onOpen(b.id) }
  const regulator = b.k === 'uk' || b.k === 'eu' || b.k === 'us'
  return (
    <group position={[X, 0.3, Z]}>
      <mesh material={mats} position={[0, H / 2, 0]} castShadow receiveShadow onClick={click}
        onPointerOver={e => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
        <boxGeometry args={[b.w, H, b.d]} />
      </mesh>
      {(hover || active) && <mesh position={[0, H / 2, 0]}><boxGeometry args={[b.w + 0.08, H + 0.08, b.d + 0.08]} /><meshBasicMaterial color="#3FA46C" wireframe /></mesh>}
      {b.id === 'hospital' && <group position={[0, H + 0.03, 0]}><mesh><boxGeometry args={[0.9, 0.06, 0.28]} /><meshStandardMaterial color="#D23A2A" /></mesh><mesh><boxGeometry args={[0.28, 0.06, 0.9]} /><meshStandardMaterial color="#D23A2A" /></mesh></group>}
      {regulator && <group position={[-b.w / 2 + 0.25, H, -b.d / 2 + 0.25]}><mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.03, 0.03, 1]} /><meshStandardMaterial color="#555" /></mesh><mesh position={[0.22, 0.85, 0]}><boxGeometry args={[0.42, 0.26, 0.02]} /><meshStandardMaterial color={color} /></mesh></group>}
      {b.id === 'tower' && <Beacon y={H + 0.2} />}
      <Html position={[0, H + 0.9, 0]} center zIndexRange={[5, 0]}>
        <button className={`pin3d${active ? ' on' : ''}`} onClick={() => onOpen(b.id)} aria-label={`${b.name}. ${b.sub}`}>
          <span className="code">{b.code}</span><span className="nm">{b.name}</span>
        </button>
      </Html>
    </group>
  )
}

function Beacon({ y }: { y: number }) {
  const m = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => { if (m.current) m.current.emissiveIntensity = 1 + Math.sin(clock.elapsedTime * 3) })
  return <mesh position={[0, y, 0]}><sphereGeometry args={[0.18, 16, 16]} /><meshStandardMaterial ref={m} color="#E04A33" emissive="#E04A33" /></mesh>
}

function Pulse({ id }: { id: string }) {
  const r = useRef<THREE.Mesh>(null)
  const b = BY_ID[id]
  useFrame(({ clock }) => {
    if (!r.current) return
    const t = (clock.elapsedTime % 1.4) / 1.4
    r.current.scale.setScalar(0.6 + t * 1.2)
    ;(r.current.material as THREE.MeshBasicMaterial).opacity = 1 - t
  })
  if (!b) return null
  const [X, Z] = W(b.x + b.w / 2, b.y + b.d / 2)
  return (
    <group position={[X, 0.34, Z]}>
      <mesh ref={r} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[Math.max(b.w, b.d) * 0.75, Math.max(b.w, b.d) * 0.75 + 0.25, 48]} /><meshBasicMaterial color="#E04A33" transparent /></mesh>
      <Html position={[0, b.h * HU + 1.9, 0]} center zIndexRange={[6, 0]}><span className="alert3d" aria-hidden="true">!</span></Html>
    </group>
  )
}

function Avatar({ at }: { at: string }) {
  const g = useRef<THREE.Group>(null)
  const target = useMemo(() => {
    const b = BY_ID[at]
    const [X, Z] = b ? W(b.x + b.w + 0.45, b.y + b.d + 0.45) : W(12, 11)
    return new THREE.Vector3(X, 0.3, Z)
  }, [at])
  useFrame(({ clock }, dt) => {
    if (!g.current) return
    g.current.position.lerp(target, Math.min(1, dt * 2.5))
    g.current.position.y = 0.3 + Math.abs(Math.sin(clock.elapsedTime * 4)) * 0.08
  })
  return (
    <group ref={g} position={[0, 0.3, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow><capsuleGeometry args={[0.18, 0.35, 6, 12]} /><meshStandardMaterial color="#3FA46C" /></mesh>
      <mesh position={[0, 0.82, 0]} castShadow><sphereGeometry args={[0.17, 16, 16]} /><meshStandardMaterial color="#F2D2B6" /></mesh>
      <Html position={[0, 1.35, 0]} center zIndexRange={[7, 0]}><span className="avatar3d">You</span></Html>
    </group>
  )
}

function Ground({ pal }: { pal: Pal }) {
  const bridges: [number, number, number, number][] = [[6, 10.6, 2, 0.8], [16, 10.6, 2, 0.8], [11.6, 5, 0.8, 2], [11.6, 16, 0.8, 2]]
  const roadSegs = useMemo(() => {
    const out: [number, number, number, number][] = []
    for (const r of ROADS) for (const l of LANDS) {
      const x0 = Math.max(r.x, l.x), x1 = Math.min(r.x + r.w, l.x + l.w), y0 = Math.max(r.y, l.y), y1 = Math.min(r.y + r.d, l.y + l.d)
      if (x1 > x0 && y1 > y0) out.push([x0, y0, x1 - x0, y1 - y0])
    }
    return out
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow><planeGeometry args={[120, 120]} /><meshStandardMaterial color={pal.water} roughness={0.35} metalness={0.1} /></mesh>
      {LANDS.map(l => { const [X, Z] = W(l.x + l.w / 2, l.y + l.d / 2); const [LX, LZ] = W(l.x + 0.3, l.y + l.d - 0.25); return (
        <group key={l.label}>
          <mesh position={[X, 0.15, Z]} receiveShadow><boxGeometry args={[l.w, 0.3, l.d]} /><meshStandardMaterial color={pal.land} /></mesh>
          <mesh position={[X, -0.02, Z]}><boxGeometry args={[l.w + 0.06, 0.06, l.d + 0.06]} /><meshStandardMaterial color={pal.edge} /></mesh>
          <Html position={[LX, 0.32, LZ]} transform rotation={[-Math.PI / 2, 0, 0]} scale={0.5} zIndexRange={[1, 0]} pointerEvents="none">
            <span className="land3d">{l.label}</span>
          </Html>
        </group>) })}
      {roadSegs.map(([x, y, w, d], i) => { const [X, Z] = W(x + w / 2, y + d / 2); return <mesh key={i} position={[X, 0.31, Z]} receiveShadow><boxGeometry args={[w, 0.02, d]} /><meshStandardMaterial color={pal.road} /></mesh> })}
      {bridges.map(([x, y, w, d], i) => { const [X, Z] = W(x + w / 2, y + d / 2); return <mesh key={'b' + i} position={[X, 0.2, Z]} castShadow><boxGeometry args={[w, 0.12, d]} /><meshStandardMaterial color={pal.road} /></mesh> })}
    </group>
  )
}

function Trees({ pal }: { pal: Pal }) {
  const spots = useMemo(() => {
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    const inR = (x: number, y: number, r: { x: number; y: number; w: number; d: number }, m: number) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.d + m
    const out: [number, number, number][] = []
    for (const l of LANDS) for (let i = 0; i < l.w * l.d * 0.5; i++) {
      const x = l.x + 0.3 + rnd() * (l.w - 0.6), y = l.y + 0.3 + rnd() * (l.d - 0.6)
      if (BUILDINGS.some(b => inR(x, y, b, 0.35)) || ROADS.some(r => inR(x, y, r, 0.3)) || NOTICE_BOARDS.some(n => Math.abs(n.x - x) < 1.2 && Math.abs(n.y - y) < 1.2)) continue
      out.push([x, y, 0.7 + rnd() * 0.5])
    }
    return out
  }, [])
  const crowns = useRef<THREE.InstancedMesh>(null), trunks = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = new THREE.Matrix4()
    spots.forEach(([x, y, s], i) => {
      const [X, Z] = W(x, y)
      m.compose(new THREE.Vector3(X, 0.3 + 0.75 * s, Z), new THREE.Quaternion(), new THREE.Vector3(s, s, s)); crowns.current!.setMatrixAt(i, m)
      m.compose(new THREE.Vector3(X, 0.3 + 0.2 * s, Z), new THREE.Quaternion(), new THREE.Vector3(s, s, s)); trunks.current!.setMatrixAt(i, m)
    })
    crowns.current!.instanceMatrix.needsUpdate = true; trunks.current!.instanceMatrix.needsUpdate = true
  }, [spots])
  return (
    <group>
      <instancedMesh ref={crowns} args={[undefined, undefined, spots.length]} castShadow><coneGeometry args={[0.35, 0.8, 7]} /><meshStandardMaterial color={pal.tree} /></instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, spots.length]}><cylinderGeometry args={[0.05, 0.06, 0.4]} /><meshStandardMaterial color={pal.trunk} /></instancedMesh>
    </group>
  )
}

function Boards({ onOpen }: { onOpen: (id: string) => void }) {
  return <>{NOTICE_BOARDS.map(n => {
    const [X, Z] = W(n.x, n.y)
    return (
      <group key={n.t1} position={[X, 0.3, Z]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[-0.7, 0.6, 0]}><cylinderGeometry args={[0.04, 0.04, 1.2]} /><meshStandardMaterial color="#444" /></mesh>
        <mesh position={[0.7, 0.6, 0]}><cylinderGeometry args={[0.04, 0.04, 1.2]} /><meshStandardMaterial color="#444" /></mesh>
        <Html position={[0, 1.55, 0]} transform scale={0.3} zIndexRange={[4, 0]}>
          <button className="board3d" onClick={() => onOpen(n.go)}><span>NOTICE</span><b>{n.t1}</b><small>{n.t2}</small></button>
        </Html>
      </group>)
  })}</>
}

function CameraRig({ focus }: { focus: string | null }) {
  const { controls, camera } = useThree() as unknown as { controls: { target: THREE.Vector3; update: () => void } | null; camera: THREE.Camera }
  const goal = useRef<THREE.Vector3 | null>(null)
  useEffect(() => {
    const b = focus ? BY_ID[focus] : null
    if (!b) return
    const [X, Z] = W(b.x + b.w / 2, b.y + b.d / 2)
    const g = new THREE.Vector3(X, 0, Z)
    // On wide screens the drawer covers the right side, so aim right of the building to show it on the left
    if (window.innerWidth > 640 && controls) {
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0); right.y = 0; right.normalize()
      const share = Math.min(720, window.innerWidth) / window.innerWidth
      g.addScaledVector(right, camera.position.distanceTo(controls.target) * share * 0.55)
    }
    goal.current = g
  }, [focus, controls, camera])
  useFrame((_s, dt) => {
    if (!controls || !goal.current) return
    controls.target.lerp(goal.current, Math.min(1, dt * 3))
    controls.update()
    if (controls.target.distanceTo(goal.current) < 0.05) goal.current = null
  })
  return null
}

export interface CityProps { active: string | null; eventAt: string | null; avatarAt: string; onOpen: (id: string) => void }

export default function City({ active, eventAt, avatarAt, onOpen }: CityProps) {
  const dark = useDark()
  const pal = dark ? PAL.dark : PAL.light
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [16, 17, 20], fov: 38, near: 0.5, far: 300 }} frameloop={reduced ? 'demand' : 'always'}
      aria-label="3D map of RegLife city" onPointerMissed={() => { document.body.style.cursor = '' }}>
      <color attach="background" args={[pal.sky]} />
      <fog attach="fog" args={[pal.sky, 45, 110]} />
      <hemisphereLight args={['#ffffff', pal.edge, pal.hemi]} />
      <directionalLight position={[12, 22, 8]} intensity={pal.sun} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} />
      <Ground pal={pal} />
      <Trees pal={pal} />
      {BUILDINGS.map(b => <BuildingMesh key={b.id} b={b} pal={pal} dark={dark} active={active === b.id} onOpen={onOpen} />)}
      <Boards onOpen={onOpen} />
      {eventAt && <Pulse id={eventAt} />}
      <Avatar at={avatarAt} />
      <MapControls makeDefault enableDamping dampingFactor={0.12} minDistance={9} maxDistance={48} maxPolarAngle={Math.PI / 2.6} minPolarAngle={0.35} screenSpacePanning={false} />
      <CameraRig focus={active} />
    </Canvas>
  )
}
