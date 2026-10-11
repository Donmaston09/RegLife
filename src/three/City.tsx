// RegLife 3D city, in daylight. Created by Anthony Onoja, Ph.D., University of Surrey.
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, MapControls, Sky } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { BUILDINGS, BY_ID, LANDS, NOTICE_BOARDS, ROADS } from '../content/city'
import type { Building, District, Rect } from '../content/types'

/* map grid (x,y) -> world (X,Z); y on the map runs towards the viewer */
const W = (x: number, y: number): [number, number] => [x - 12, y - 11.75]
const HU = 0.9 // world units per storey block
const TOP = 0.3 // height of the land surface
const M = 0.6 // grass and ring-road margin around each district
const LAKE = { x: -2, y: -2, w: 28, d: 28 } // water around the districts, in map units

const DAY = {
  sky: '#BFE0F7', fog: '#D3E9F7', water: '#4F9FD1', sand: '#E3D3A6', soil: '#8B7A5C', asphalt: '#4B5058', kerb: '#CFCAC0',
  line: '#F4F1E6', roof: '#EEF1F4', glass: '#A9C9E3', trunk: '#7A5A3C',
  own: '#46A592', uk: '#8797D8', eu: '#6FA1D8', us: '#D79676', care: '#E3B160'
} as const

const rand = (s0: number) => { let s = s0; return () => { s = (s * 16807) % 2147483647; return s / 2147483647 } }
const inR = (x: number, y: number, r: Rect, m: number) => x > r.x - m && x < r.x + r.w + m && y > r.y - m && y < r.y + r.d + m
const grown = (l: Rect): Rect => ({ x: l.x - M, y: l.y - M, w: l.w + 2 * M, d: l.d + 2 * M })

/* ---------- procedural textures (no downloads) ---------- */
function grassTexture(repeat: number) {
  const c = document.createElement('canvas'); c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#7DB356'; g.fillRect(0, 0, 256, 256)
  const r = rand(11)
  for (let i = 0; i < 2600; i++) {
    const x = r() * 256, y = r() * 256, l = 2 + r() * 5
    g.strokeStyle = ['#6FA64A', '#8CC063', '#679C43', '#95C86B'][Math.floor(r() * 4)]
    g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 2, y - l); g.stroke()
  }
  for (let i = 0; i < 40; i++) { g.fillStyle = r() < 0.5 ? '#FFF7D6' : '#F7D046'; g.fillRect(r() * 256, r() * 256, 2, 2) }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}
function windowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64)
  g.fillStyle = '#8FB4D2'
  for (let y = 8; y < 64; y += 24) for (let x = 8; x < 64; x += 24) g.fillRect(x, y, 14, 12)
  g.fillStyle = '#C9DDEC'
  for (let y = 8; y < 64; y += 24) for (let x = 8; x < 64; x += 24) g.fillRect(x, y, 5, 4)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace
  return t
}

function BuildingMesh({ b, active, onOpen }: { b: Building; active: boolean; onOpen: (id: string) => void }) {
  const [hover, setHover] = useState(false)
  const [X, Z] = W(b.x + b.w / 2, b.y + b.d / 2)
  const H = b.h * HU
  const color = DAY[b.k as District]
  const mats = useMemo(() => {
    const map = windowTexture(); map.repeat.set(Math.max(1, Math.round(Math.max(b.w, b.d) * 1.6)), Math.max(1, Math.round(b.h * 1.3)))
    const wall = new THREE.MeshStandardMaterial({ color, map, roughness: 0.65, metalness: 0.05 })
    const roof = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).lerp(new THREE.Color(DAY.roof), 0.55), roughness: 0.9 })
    return [wall, wall, roof, roof, wall, wall]
  }, [color, b])
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); if (e.delta > 6) return; onOpen(b.id) }
  const regulator = b.k === 'uk' || b.k === 'eu' || b.k === 'us'
  return (
    <group position={[X, TOP, Z]}>
      {/* paved plot around the building */}
      <mesh position={[0, 0.012, 0]} receiveShadow><boxGeometry args={[b.w + 0.5, 0.02, b.d + 0.5]} /><meshStandardMaterial color={DAY.kerb} roughness={0.95} /></mesh>
      <mesh material={mats} position={[0, H / 2, 0]} castShadow receiveShadow onClick={click}
        onPointerOver={e => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
        <boxGeometry args={[b.w, H, b.d]} />
      </mesh>
      {/* roof parapet and plant room */}
      <mesh position={[0, H + 0.04, 0]} castShadow><boxGeometry args={[b.w * 0.94, 0.08, b.d * 0.94]} /><meshStandardMaterial color={DAY.roof} /></mesh>
      {b.h > 2 && b.id !== 'tower' && <mesh position={[b.w * 0.2, H + 0.2, -b.d * 0.15]} castShadow><boxGeometry args={[b.w * 0.3, 0.3, b.d * 0.3]} /><meshStandardMaterial color="#B9C0C8" /></mesh>}
      {(hover || active) && <mesh position={[0, H / 2, 0]}><boxGeometry args={[b.w + 0.08, H + 0.08, b.d + 0.08]} /><meshBasicMaterial color="#3FA46C" wireframe /></mesh>}
      {b.id === 'hospital' && <group position={[0, H + 0.1, 0]}><mesh><boxGeometry args={[0.9, 0.06, 0.28]} /><meshStandardMaterial color="#D23A2A" /></mesh><mesh><boxGeometry args={[0.28, 0.06, 0.9]} /><meshStandardMaterial color="#D23A2A" /></mesh></group>}
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
    g.current.position.y = TOP + Math.abs(Math.sin(clock.elapsedTime * 4)) * 0.08
  })
  return (
    <group ref={g} position={[0, 0.3, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow><capsuleGeometry args={[0.18, 0.35, 6, 12]} /><meshStandardMaterial color="#3FA46C" /></mesh>
      <mesh position={[0, 0.82, 0]} castShadow><sphereGeometry args={[0.17, 16, 16]} /><meshStandardMaterial color="#F2D2B6" /></mesh>
      <Html position={[0, 1.35, 0]} center zIndexRange={[7, 0]}><span className="avatar3d">You</span></Html>
    </group>
  )
}

/* ---------- road network ---------- */
type Seg = { x: number; y: number; w: number; d: number; along: 'x' | 'y' }
function useRoadNet() {
  return useMemo(() => {
    const roads: Seg[] = [], bridges: Seg[] = []
    const RW = 0.45, inset = 0.1
    // a ring road just inside every district's grass margin
    for (const l of LANDS) {
      const g = grown(l), o = inset
      roads.push({ x: g.x + o, y: g.y + o, w: g.w - 2 * o, d: RW, along: 'x' })
      roads.push({ x: g.x + o, y: g.y + g.d - o - RW, w: g.w - 2 * o, d: RW, along: 'x' })
      roads.push({ x: g.x + o, y: g.y + o, w: RW, d: g.d - 2 * o, along: 'y' })
      roads.push({ x: g.x + g.w - o - RW, y: g.y + o, w: RW, d: g.d - 2 * o, along: 'y' })
    }
    // the two avenues, clipped to land; gaps between districts become bridges
    for (const r of ROADS) {
      const along = r.w > r.d ? 'x' : 'y'
      const lands = LANDS.map(grown).filter(g => along === 'x' ? r.y < g.y + g.d && r.y + r.d > g.y : r.x < g.x + g.w && r.x + r.w > g.x)
        .sort((a, b) => along === 'x' ? a.x - b.x : a.y - b.y)
      lands.forEach((g, i) => {
        if (along === 'x') roads.push({ x: g.x, y: r.y, w: g.w, d: r.d, along })
        else roads.push({ x: r.x, y: g.y, w: r.w, d: g.d, along })
        const n = lands[i + 1]
        if (n) {
          if (along === 'x' && n.x > g.x + g.w) bridges.push({ x: g.x + g.w, y: r.y, w: n.x - g.x - g.w, d: r.d, along })
          if (along === 'y' && n.y > g.y + g.d) bridges.push({ x: r.x, y: g.y + g.d, w: r.w, d: n.y - g.y - g.d, along })
        }
      })
    }
    return { roads, bridges }
  }, [])
}

function Ground() {
  const meadow = useMemo(() => grassTexture(60), [])
  const { roads, bridges } = useRoadNet()
  const dashes = useMemo(() => {
    const out: [number, number, boolean][] = []
    for (const s of [...roads, ...bridges]) {
      const len = s.along === 'x' ? s.w : s.d
      for (let t = 0.3; t < len - 0.3; t += 0.7) out.push(s.along === 'x' ? [s.x + t, s.y + s.d / 2, true] : [s.x + s.w / 2, s.y + t, false])
    }
    return out
  }, [roads, bridges])
  const dashRef = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
    dashes.forEach(([x, y, horiz], i) => { const [X, Z] = W(x, y); m.compose(new THREE.Vector3(X, TOP + 0.024, Z), horiz ? q : qy, new THREE.Vector3(1, 1, 1)); dashRef.current!.setMatrixAt(i, m) })
    dashRef.current!.instanceMatrix.needsUpdate = true
  }, [dashes])
  const [lx, lz] = W(LAKE.x + LAKE.w / 2, LAKE.y + LAKE.d / 2)
  return (
    <group>
      {/* countryside meadow, sandy shore and the lagoon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]} receiveShadow><planeGeometry args={[240, 240]} /><meshStandardMaterial map={meadow} roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lx, -0.12, lz]} receiveShadow><planeGeometry args={[LAKE.w + 1.4, LAKE.d + 1.4]} /><meshStandardMaterial color={DAY.sand} roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[lx, -0.08, lz]} receiveShadow><planeGeometry args={[LAKE.w, LAKE.d]} /><meshStandardMaterial color={DAY.water} roughness={0.15} metalness={0.25} /></mesh>
      {LANDS.map(l => <District key={l.label} l={l} />)}
      {roads.map((s, i) => { const [X, Z] = W(s.x + s.w / 2, s.y + s.d / 2); return <mesh key={'r' + i} position={[X, TOP + 0.01, Z]} receiveShadow><boxGeometry args={[s.w, 0.02, s.d]} /><meshStandardMaterial color={DAY.asphalt} roughness={0.9} /></mesh> })}
      {bridges.map((s, i) => { const [X, Z] = W(s.x + s.w / 2, s.y + s.d / 2); const side = s.along === 'x'; return (
        <group key={'b' + i} position={[X, TOP, Z]}>
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow><boxGeometry args={[s.w, 0.12, s.d]} /><meshStandardMaterial color={DAY.asphalt} /></mesh>
          <mesh position={side ? [0, 0.08, -s.d / 2] : [-s.w / 2, 0.08, 0]}><boxGeometry args={side ? [s.w, 0.12, 0.04] : [0.04, 0.12, s.d]} /><meshStandardMaterial color="#E8E4DA" /></mesh>
          <mesh position={side ? [0, 0.08, s.d / 2] : [s.w / 2, 0.08, 0]}><boxGeometry args={side ? [s.w, 0.12, 0.04] : [0.04, 0.12, s.d]} /><meshStandardMaterial color="#E8E4DA" /></mesh>
          <mesh position={[0, -0.35, 0]}><boxGeometry args={side ? [0.2, 0.5, s.d * 0.8] : [s.w * 0.8, 0.5, 0.2]} /><meshStandardMaterial color="#B8B2A6" /></mesh>
        </group>) })}
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]}><boxGeometry args={[0.3, 0.005, 0.04]} /><meshStandardMaterial color={DAY.line} /></instancedMesh>
      <Lamps roads={roads} />
    </group>
  )
}

function District({ l }: { l: Rect & { label: string } }) {
  const g = grown(l)
  const tex = useMemo(() => grassTexture(Math.max(g.w, g.d) / 2.5), [g.w, g.d])
  const [X, Z] = W(g.x + g.w / 2, g.y + g.d / 2)
  const [LX, LZ] = W(l.x + 0.3, l.y + l.d - 0.25)
  return (
    <group>
      <mesh position={[X, TOP / 2 - 0.06, Z]} castShadow receiveShadow material={[
        new THREE.MeshStandardMaterial({ color: DAY.soil }), new THREE.MeshStandardMaterial({ color: DAY.soil }),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }), new THREE.MeshStandardMaterial({ color: DAY.soil }),
        new THREE.MeshStandardMaterial({ color: DAY.soil }), new THREE.MeshStandardMaterial({ color: DAY.soil })]}>
        <boxGeometry args={[g.w, TOP + 0.12, g.d]} />
      </mesh>
      <Html position={[LX, TOP + 0.03, LZ]} transform rotation={[-Math.PI / 2, 0, 0]} scale={0.5} zIndexRange={[1, 0]} pointerEvents="none">
        <span className="land3d day">{l.label}</span>
      </Html>
    </group>
  )
}

function Lamps({ roads }: { roads: Seg[] }) {
  const spots = useMemo(() => {
    const out: [number, number][] = []
    for (const s of roads) {
      const len = s.along === 'x' ? s.w : s.d
      for (let t = 0.6; t < len - 0.4; t += 2.2) {
        const p: [number, number] = s.along === 'x' ? [s.x + t, s.y - 0.08] : [s.x - 0.08, s.y + t]
        if (BUILDINGS.some(b => inR(p[0], p[1], b, 0.3))) continue
        out.push(p)
      }
    }
    return out
  }, [roads])
  const poles = useRef<THREE.InstancedMesh>(null), heads = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1)
    spots.forEach(([x, y], i) => {
      const [X, Z] = W(x, y)
      m.compose(new THREE.Vector3(X, TOP + 0.3, Z), q, one); poles.current!.setMatrixAt(i, m)
      m.compose(new THREE.Vector3(X, TOP + 0.62, Z), q, one); heads.current!.setMatrixAt(i, m)
    })
    poles.current!.instanceMatrix.needsUpdate = true; heads.current!.instanceMatrix.needsUpdate = true
  }, [spots])
  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, undefined, spots.length]} castShadow><cylinderGeometry args={[0.018, 0.022, 0.6, 6]} /><meshStandardMaterial color="#5C636B" /></instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, spots.length]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#FFF6D8" emissive="#FFE7A3" emissiveIntensity={0.3} /></instancedMesh>
    </group>
  )
}

/* ---------- traffic on the two avenues ---------- */
const CARS = [
  { along: 'x' as const, lane: 10.78, dir: 1, speed: 1.6, color: '#D9483B', off: 0 },
  { along: 'x' as const, lane: 11.22, dir: -1, speed: 1.3, color: '#2F6FB5', off: 9 },
  { along: 'x' as const, lane: 10.78, dir: 1, speed: 1.4, color: '#F2C14E', off: 15 },
  { along: 'y' as const, lane: 12.22, dir: 1, speed: 1.5, color: '#FFFFFF', off: 3 },
  { along: 'y' as const, lane: 11.78, dir: -1, speed: 1.2, color: '#3B9C6B', off: 12 },
  { along: 'y' as const, lane: 12.22, dir: 1, speed: 1.7, color: '#7A4FB0', off: 19 }
]
function Traffic() {
  const refs = useRef<(THREE.Group | null)[]>([])
  const span = { x: [-0.4, 23.4], y: [-0.4, 23.9] }
  useFrame(({ clock }) => {
    CARS.forEach((c, i) => {
      const g = refs.current[i]; if (!g) return
      const [a, b] = span[c.along], len = b - a
      let t = ((clock.elapsedTime * c.speed + c.off) % len); if (c.dir < 0) t = len - t
      const pos = a + t
      const [X, Z] = c.along === 'x' ? W(pos, c.lane) : W(c.lane, pos)
      g.position.set(X, TOP + 0.08, Z)
      g.rotation.y = c.along === 'x' ? (c.dir > 0 ? 0 : Math.PI) : (c.dir > 0 ? -Math.PI / 2 : Math.PI / 2)
    })
  })
  return <>{CARS.map((c, i) => (
    <group key={i} ref={el => { refs.current[i] = el }}>
      <mesh castShadow><boxGeometry args={[0.36, 0.11, 0.18]} /><meshStandardMaterial color={c.color} roughness={0.4} metalness={0.3} /></mesh>
      <mesh position={[-0.02, 0.1, 0]} castShadow><boxGeometry args={[0.2, 0.09, 0.16]} /><meshStandardMaterial color="#BFD6E8" roughness={0.2} metalness={0.4} /></mesh>
    </group>))}</>
}

/* ---------- trees, grass tufts, clouds ---------- */
function Vegetation() {
  const { round, pine, tufts } = useMemo(() => {
    const r = rand(7)
    const round: [number, number, number, number][] = [], pine: [number, number, number, number][] = [], tufts: [number, number, number][] = []
    const blocked = (x: number, y: number) => BUILDINGS.some(b => inR(x, y, b, 0.45)) || ROADS.some(rd => inR(x, y, rd, 0.35)) ||
      NOTICE_BOARDS.some(n => Math.abs(n.x - x) < 1.2 && Math.abs(n.y - y) < 1.2)
    // inside districts, away from ring roads
    for (const l of LANDS) for (let i = 0; i < l.w * l.d * 0.55; i++) {
      const x = l.x + 0.15 + r() * (l.w - 0.3), y = l.y + 0.15 + r() * (l.d - 0.3)
      if (blocked(x, y)) continue
      ;(r() < 0.7 ? round : pine).push([x, y, 0.65 + r() * 0.5, r()])
    }
    // countryside beyond the lagoon
    for (let i = 0; i < 520; i++) {
      const ang = r() * Math.PI * 2, rad = 20 + r() * 42
      const x = 12 + Math.cos(ang) * rad, y = 11.75 + Math.sin(ang) * rad
      if (inR(x, y, { x: LAKE.x - 1.2, y: LAKE.y - 1.2, w: LAKE.w + 2.4, d: LAKE.d + 2.4 }, 0)) continue
      ;(r() < 0.55 ? round : pine).push([x, y, 0.8 + r() * 0.9, r()])
    }
    for (let i = 0; i < 1400; i++) {
      const x = -30 + r() * 84, y = -30 + r() * 84
      if (inR(x, y, LAKE, 0.9)) continue
      tufts.push([x, y, 0.5 + r() * 0.8])
    }
    return { round, pine, tufts }
  }, [])
  const roundC = useRef<THREE.InstancedMesh>(null), roundT = useRef<THREE.InstancedMesh>(null)
  const pineC = useRef<THREE.InstancedMesh>(null), pineT = useRef<THREE.InstancedMesh>(null), tuftR = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color()
    const greens = ['#4E9A4A', '#5DAA52', '#3F8A45', '#6DB35A', '#87B84E']
    const ground = (x: number, y: number) => LANDS.some(l => inR(x, y, grown(l), 0)) ? TOP : -0.14
    round.forEach(([x, y, s, k], i) => {
      const [X, Z] = W(x, y), g = ground(x, y)
      m.compose(new THREE.Vector3(X, g + 0.55 * s, Z), q, new THREE.Vector3(s, s * 0.9, s)); roundC.current!.setMatrixAt(i, m)
      roundC.current!.setColorAt(i, c.set(greens[Math.floor(k * greens.length)]))
      m.compose(new THREE.Vector3(X, g + 0.18 * s, Z), q, new THREE.Vector3(s, s, s)); roundT.current!.setMatrixAt(i, m)
    })
    pine.forEach(([x, y, s, k], i) => {
      const [X, Z] = W(x, y), g = ground(x, y)
      m.compose(new THREE.Vector3(X, g + 0.6 * s, Z), q, new THREE.Vector3(s, s, s)); pineC.current!.setMatrixAt(i, m)
      pineC.current!.setColorAt(i, c.set(k < 0.5 ? '#2F6E3E' : '#3A7D47'))
      m.compose(new THREE.Vector3(X, g + 0.15 * s, Z), q, new THREE.Vector3(s, s, s)); pineT.current!.setMatrixAt(i, m)
    })
    tufts.forEach(([x, y, s], i) => { const [X, Z] = W(x, y); m.compose(new THREE.Vector3(X, -0.14 + 0.06 * s, Z), q, new THREE.Vector3(s, s, s)); tuftR.current!.setMatrixAt(i, m) })
    for (const r of [roundC, roundT, pineC, pineT, tuftR]) { r.current!.instanceMatrix.needsUpdate = true; if (r.current!.instanceColor) r.current!.instanceColor.needsUpdate = true }
  }, [round, pine, tufts])
  return (
    <group>
      <instancedMesh ref={roundC} args={[undefined, undefined, round.length]} castShadow><icosahedronGeometry args={[0.36, 1]} /><meshStandardMaterial roughness={0.9} flatShading /></instancedMesh>
      <instancedMesh ref={roundT} args={[undefined, undefined, round.length]} castShadow><cylinderGeometry args={[0.045, 0.06, 0.36, 6]} /><meshStandardMaterial color={DAY.trunk} /></instancedMesh>
      <instancedMesh ref={pineC} args={[undefined, undefined, pine.length]} castShadow><coneGeometry args={[0.3, 0.9, 7]} /><meshStandardMaterial roughness={0.9} flatShading /></instancedMesh>
      <instancedMesh ref={pineT} args={[undefined, undefined, pine.length]}><cylinderGeometry args={[0.04, 0.05, 0.3, 6]} /><meshStandardMaterial color={DAY.trunk} /></instancedMesh>
      <instancedMesh ref={tuftR} args={[undefined, undefined, tufts.length]}><coneGeometry args={[0.06, 0.14, 4]} /><meshStandardMaterial color="#6FA84A" roughness={1} /></instancedMesh>
    </group>
  )
}

function Clouds() {
  const g = useRef<THREE.Group>(null)
  const puffs = useMemo(() => { const r = rand(5); return Array.from({ length: 9 }, () => ({ x: -45 + r() * 90, z: -45 + r() * 70, y: 16 + r() * 6, s: 1.5 + r() * 2 })) }, [])
  useFrame((_s, dt) => { if (g.current) { g.current.position.x += dt * 0.25; if (g.current.position.x > 40) g.current.position.x = -40 } })
  return (
    <group ref={g}>
      {puffs.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]} scale={p.s}>
          {[[0, 0, 0, 1], [0.9, -0.1, 0.2, 0.75], [-0.9, -0.15, -0.1, 0.7], [0.3, 0.35, -0.2, 0.7]].map(([x, y, z, r], j) => (
            <mesh key={j} position={[x, y, z]}><sphereGeometry args={[r, 12, 10]} /><meshStandardMaterial color="#FFFFFF" roughness={1} transparent opacity={0.92} /></mesh>))}
        </group>))}
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

/** Always daylight, whatever the device theme, so the city reads as a sunny town. */
export default function City({ active, eventAt, avatarAt, onOpen }: CityProps) {
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [16, 17, 20], fov: 38, near: 0.5, far: 400 }} frameloop={reduced ? 'demand' : 'always'}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      aria-label="3D map of RegLife city" onPointerMissed={() => { document.body.style.cursor = '' }}>
      <color attach="background" args={[DAY.sky]} />
      <fog attach="fog" args={[DAY.fog, 55, 140]} />
      <Sky distance={450} sunPosition={[60, 45, 30]} turbidity={5} rayleigh={1.1} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <hemisphereLight args={['#E3F2FF', '#6E9A4F', 0.85]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[18, 26, 12]} intensity={1.7} color="#FFF3DE" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004}
        shadow-camera-left={-26} shadow-camera-right={26} shadow-camera-top={26} shadow-camera-bottom={-26} />
      <Ground />
      <Vegetation />
      {!reduced && <Clouds />}
      {!reduced && <Traffic />}
      {BUILDINGS.map(b => <BuildingMesh key={b.id} b={b} active={active === b.id} onOpen={onOpen} />)}
      <Boards onOpen={onOpen} />
      {eventAt && <Pulse id={eventAt} />}
      <Avatar at={avatarAt} />
      <MapControls makeDefault enableDamping dampingFactor={0.12} minDistance={9} maxDistance={55} maxPolarAngle={Math.PI / 2.5} minPolarAngle={0.35} screenSpacePanning={false} />
      <CameraRig focus={active} />
    </Canvas>
  )
}
