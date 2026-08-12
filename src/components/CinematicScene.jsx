import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import HumanCharacter from './HumanCharacter'
import IndianFlag from './IndianFlag'
import ParticleSystem from './ParticleSystem'
import CinematicCamera from './CinematicCamera'

function DistantBirds() {
  const group = useRef()
  const birds = useMemo(
    () => new Array(5).fill(0).map((_, i) => ({
      offset: i * 1.4,
      y: 3.2 + Math.random() * 0.8,
      z: -6 - Math.random() * 3
    })),
    []
  )

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((bird, i) => {
      const b = birds[i]
      bird.position.x = -6 + ((t * 0.35 + b.offset) % 12)
      bird.position.y = b.y + Math.sin(t * 2 + b.offset) * 0.08
    })
  })

  return (
    <group ref={group}>
      {birds.map((b, i) => (
        <mesh key={i} position={[-6, b.y, b.z]}>
          <coneGeometry args={[0.03, 0.14, 3]} />
          <meshBasicMaterial color="#1a1d24" />
        </mesh>
      ))}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow>
      <circleGeometry args={[9, 48]} />
      <meshStandardMaterial
        color="#04060a"
        roughness={0.35}
        metalness={0.4}
        envMapIntensity={0.4}
      />
    </mesh>
  )
}

function LightRays() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.material.opacity = 0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.015
  })
  return (
    <mesh ref={ref} position={[0, 1.6, -1.9]} rotation={[0, 0, 0]}>
      <coneGeometry args={[2.4, 5, 24, 1, true]} />
      <meshBasicMaterial
        color="#ffddaa"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function CinematicScene({ phase, isMobile }) {
  return (
    <>
      <CinematicCamera phase={phase} isMobile={isMobile} />

      <fog attach="fog" args={['#050810', 4, isMobile ? 13 : 16]} />

      {/* Key light — soft warm light from one direction */}
      <directionalLight
        position={[3.5, 5, 2]}
        intensity={1.1}
        color="#ffcf9e"
        castShadow={!isMobile}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      {/* Rim light — subtle blue/white around the silhouette */}
      <directionalLight position={[-2.5, 2.2, -3]} intensity={1.4} color="#8fb2ff" />

      {/* Flag light — slightly stronger, illuminating the tricolor */}
      <spotLight
        position={[0.5, 3.4, -0.5]}
        angle={0.55}
        penumbra={0.8}
        intensity={1.6}
        color="#fff4e0"
        distance={9}
      />

      {/* Ground glow — very subtle */}
      <pointLight position={[0, -0.9, 1.6]} intensity={0.25} color="#ff9933" distance={3} />
      <pointLight position={[0, -0.9, -1.2]} intensity={0.2} color="#138808" distance={3} />

      {/* Ambient fill so background isn't pure black */}
      <ambientLight intensity={0.18} color="#0e1830" />
      <hemisphereLight args={['#1b2740', '#050608', 0.35]} />

      <Ground />
      <LightRays />
      <DistantBirds />

      <HumanCharacter phase={phase} />
      <IndianFlag phase={phase} />
      <ParticleSystem phase={phase} count={isMobile ? 100 : 260} />

      {!isMobile && (
        <Sparkles
          count={40}
          scale={[6, 3, 5]}
          size={1.5}
          speed={0.15}
          opacity={0.25}
          color="#ffe3b3"
          position={[0, 0.6, 0]}
        />
      )}
    </>
  )
}
