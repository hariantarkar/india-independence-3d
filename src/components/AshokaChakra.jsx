import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * A thin animated overlay that sits exactly on top of the chakra drawn
 * into the flag's texture (see IndianFlag.jsx). Adds:
 *  - a slow rotating navy ring (mirrors the spokes)
 *  - a soft blue glow pulse
 *  - a handful of shimmering point-light-like particles orbiting it
 * Kept intentionally subtle — elegant, not neon.
 */
export default function AshokaChakra({ position = [0, 0, 0.025], radius = 0.21 }) {
  const ringRef = useRef()
  const shimmerRef = useRef()

  const shimmerPositions = useMemo(() => {
    const count = 18
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      arr[i * 3] = Math.cos(angle) * radius
      arr[i * 3 + 1] = Math.sin(angle) * radius
      arr[i * 3 + 2] = 0
    }
    return arr
  }, [radius])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.15
      ringRef.current.material.opacity = 0.3 + Math.sin(t * 1.2) * 0.08
    }
    if (shimmerRef.current) {
      shimmerRef.current.rotation.z = -t * 0.1
      shimmerRef.current.material.opacity = 0.4 + Math.sin(t * 2.3) * 0.2
    }
  })

  return (
    <group position={position}>
      <mesh ref={ringRef}>
        <ringGeometry args={[radius * 0.86, radius * 1.05, 40]} />
        <meshBasicMaterial color="#3b5bdb" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <points ref={shimmerRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={shimmerPositions.length / 3}
            array={shimmerPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.014} color="#8fb2ff" transparent opacity={0.5} sizeAttenuation />
      </points>
    </group>
  )
}
