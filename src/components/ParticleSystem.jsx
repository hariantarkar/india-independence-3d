import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TRICOLOR = ['#FF9933', '#FFFFFF', '#138808']

function makeParticles(count, spread, colorBias = 0.12) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const speeds = new Float32Array(count)
  const color = new THREE.Color()

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread.x
    positions[i * 3 + 1] = Math.random() * spread.y
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z

    // mostly warm dust, occasionally a tricolor glint
    if (Math.random() < colorBias) {
      color.set(TRICOLOR[Math.floor(Math.random() * 3)])
    } else {
      color.set('#c9b18a')
    }
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    speeds[i] = 0.05 + Math.random() * 0.12
  }
  return { positions, colors, speeds }
}

/**
 * Subtle cinematic particles: floating dust/atmosphere throughout, plus
 * a gentle tricolor burst that intensifies during the final hero phase.
 */
export default function ParticleSystem({ phase = 0, count = 260 }) {
  const pointsRef = useRef()
  const spread = useMemo(() => ({ x: 7, y: 4.2, z: 6 }), [])
  const { positions, colors, speeds } = useMemo(
    () => makeParticles(count, spread, 0.14),
    [count, spread]
  )

  useFrame((state, dt) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position
    const t = state.clock.elapsedTime
    const burst = phase >= 6 ? 1 : 0

    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3
      pos.array[ix + 1] += speeds[i] * dt * (0.6 + burst * 0.8)
      pos.array[ix] += Math.sin(t * 0.4 + i) * 0.0006
      pos.array[ix + 2] += Math.cos(t * 0.3 + i) * 0.0004

      if (pos.array[ix + 1] > spread.y) {
        pos.array[ix + 1] = 0
      }
    }
    pos.needsUpdate = true

    const mat = pointsRef.current.material
    mat.opacity = phase >= 6 ? 0.85 : 0.5
    mat.size = phase >= 6 ? 0.028 : 0.02
  })

  return (
    <points ref={pointsRef} position={[0, -0.3, 0.5]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.5}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
