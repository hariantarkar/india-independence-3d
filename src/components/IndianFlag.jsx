import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import AshokaChakra from './AshokaChakra'

const WIDTH = 2.7
const HEIGHT = 1.8
const SEG_X = 40
const SEG_Y = 26

/**
 * Builds a high-resolution canvas texture of the Indian tricolor with a
 * navy-blue 24-spoke Ashoka Chakra, drawn procedurally (no external
 * image assets required).
 */
function buildFlagTexture() {
  const size = 1024
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = Math.round((size * HEIGHT) / WIDTH)
  const ctx = canvas.getContext('2d')
  const bandH = canvas.height / 3

  // Saffron
  ctx.fillStyle = '#FF9933'
  ctx.fillRect(0, 0, canvas.width, bandH)
  // White
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, bandH, canvas.width, bandH)
  // Green
  ctx.fillStyle = '#138808'
  ctx.fillRect(0, bandH * 2, canvas.width, bandH)

  // subtle fabric grain
  ctx.globalAlpha = 0.05
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#ffffff'
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1)
  }
  ctx.globalAlpha = 1

  // Ashoka Chakra
  const cx = canvas.width / 2
  const cy = bandH * 1.5
  const r = bandH * 0.38
  const navy = '#0B1F6E'

  ctx.strokeStyle = navy
  ctx.lineWidth = r * 0.045
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.06, 0, Math.PI * 2)
  ctx.fillStyle = navy
  ctx.fill()

  const spokes = 24
  for (let i = 0; i < spokes; i++) {
    const angle = (i / spokes) * Math.PI * 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.strokeStyle = navy
    ctx.lineWidth = r * 0.035
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -r * 0.94)
    ctx.stroke()
    ctx.restore()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export default function IndianFlag({ position = [0, 1.55, -1.4], phase = 0 }) {
  const meshRef = useRef()
  const texture = useMemo(() => buildFlagTexture(), [])

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WIDTH, HEIGHT, SEG_X, SEG_Y)
    return geo
  }, [])

  const basePositions = useMemo(() => geometry.attributes.position.array.slice(), [geometry])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pos = meshRef.current.geometry.attributes.position
    const windStrength = 0.11 + (phase >= 4 ? 0.03 : 0)

    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3
      const x = basePositions[ix]
      const y = basePositions[ix + 1]

      // distance from the pole (left edge) drives how much a point waves
      const attach = THREE.MathUtils.clamp((x + WIDTH / 2) / WIDTH, 0, 1)

      const wave =
        Math.sin(t * 1.8 + x * 2.4 + y * 0.6) * 0.14 * attach +
        Math.sin(t * 3.1 + x * 4.2) * 0.045 * attach +
        Math.sin(t * 0.7 + y * 1.5) * 0.03 * attach

      pos.array[ix + 2] = wave * windStrength * 4.4
      pos.array[ix + 1] = y - attach * 0.015 * Math.sin(t * 1.1) // slight droop/flutter
    }
    pos.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()
  })

  return (
    <group position={position}>
      {/* Flagpole */}
      <mesh position={[-WIDTH / 2 - 0.04, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.032, HEIGHT + 1.9, 12]} />
        <meshStandardMaterial color="#8a8f99" roughness={0.35} metalness={0.75} />
      </mesh>
      <mesh position={[-WIDTH / 2 - 0.04, HEIGHT / 2 + 0.92, 0]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Waving flag fabric */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={texture}
          side={THREE.DoubleSide}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Ashoka Chakra glow + shimmer, aligned over the chakra in the texture */}
      <AshokaChakra position={[0, 0, 0.025]} radius={0.21} />
    </group>
  )
}
