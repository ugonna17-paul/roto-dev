import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial, Environment } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as random from 'maath/random/dist/maath-random.esm'
import * as THREE from 'three'
import './App.css' // We'll add this next

// Planet data (you can add more!)
const planetData = [
  { name: 'Mercury', color: '#A9A9A9', size: 0.2, xRadius: 3, zRadius: 2, speed: 0.02 },
  { name: 'Venus', color: '#FFA500', size: 0.4, xRadius: 5, zRadius: 3, speed: 0.015 },
  { name: 'Earth', color: '#00BFFF', size: 0.5, xRadius: 7, zRadius: 4, speed: 0.01 },
  { name: 'Mars', color: '#FF4500', size: 0.3, xRadius: 9, zRadius: 5, speed: 0.008 },
  { name: 'Jupiter', color: '#DAA520', size: 1.0, xRadius: 12, zRadius: 7, speed: 0.005 },
  { name: 'Saturn', color: '#F4A460', size: 0.8, xRadius: 15, zRadius: 9, speed: 0.003 },
]

// Sun component
function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial color="#FFD700" emissive="#FF4500" emissiveIntensity={2} />
    </mesh>
  )
}

// Single planet with orbit animation
function Planet({ planet }) {
  const ref = useRef()
  const [angle] = useState(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    const currentAngle = angle + planet.speed * performance.now() * 0.001
    const x = planet.xRadius * Math.cos(currentAngle)
    const z = planet.zRadius * Math.sin(currentAngle)
    ref.current.position.set(x, 0, z)
    ref.current.rotation.y += 0.005 // Self rotation
  })

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial color={planet.color} emissive={planet.color} emissiveIntensity={0.6} />
      </mesh>
      {/* Orbit path */}
      <Ecliptic xRadius={planet.xRadius} zRadius={planet.zRadius} />
    </>
  )
}

function Ecliptic({ xRadius, zRadius }) {
  const points = []
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2
    points.push(new THREE.Vector3(xRadius * Math.cos(angle), 0, zRadius * Math.sin(angle)))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return <line geometry={geometry}><lineBasicMaterial color="#ffffff" transparent opacity={0.15} /></line>
}

// Crazy galaxy stars (interactive particles)
function Stars() {
  const ref = useRef()
  const [positions] = useState(() => random.inSphere(new Float32Array(8000), { radius: 60 }))

  useFrame((state) => {
    ref.current.rotation.y += 0.0002
    const { mouse } = state
    ref.current.position.x = mouse.x * 3
    ref.current.position.z = -mouse.y * 3
  })

  return (
    <group ref={ref}>
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ffffff" size={0.015} sizeAttenuation blending="additive" depthWrite={false} />
      </Points>
    </group>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#000011']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#FFD700" />

      <Sun />
      {planetData.map((p, i) => <Planet key={i} planet={p} />)}
      <Stars />

      <EffectComposer>
        <Bloom intensity={1.8} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>

      <Environment preset="night" />
    </>
  )
}

export default function App() {
  return (
    <div className="landing-container">
      <Canvas camera={{ position: [0, 15, 35], fov: 50 }}>
        <Scene />
        <OrbitControls enableZoom={true} enablePan={false} minDistance={20} maxDistance={60} />
      </Canvas>

      {/* Hero Overlay */}
      <div className="hero-overlay">
        <h1 className="title">Explore the Cosmos</h1>
        <p className="subtitle">Journey through galaxies, stars, and infinite possibilities</p>
        <div className="cta-buttons">
          <button className="btn primary">Discover Planets</button>
          <button className="btn secondary">Enter the Void</button>
        </div>
      </div>
    </div>
  )
}