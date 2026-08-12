import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { damp } from '../animations/saluteAnimation'

// Camera keyframes matching the reel sequence phases.
// pos = camera position, look = point the camera aims at.
const KEYFRAMES = {
  0: { pos: [0, 1.3, 9.5], look: [0, 1.1, -1] }, // dark / distant silhouette
  1: { pos: [0.6, 1.5, 6.2], look: [0.1, 1.2, -0.5] }, // establishing shot
  2: { pos: [1.4, 1.55, 3.4], look: [0.3, 1.3, 0.2] }, // character reveal (side)
  3: { pos: [0.55, 1.5, 2.4], look: [0.15, 1.35, 0.6] }, // salute rising, closer
  4: { pos: [0.25, 1.55, 1.55], look: [0.05, 1.4, 1.2] }, // salute held, tight
  5: { pos: [-0.3, 1.65, -0.35], look: [0, 1.55, -1.4] }, // flag close-up
  6: { pos: [1.6, 1.7, 4.4], look: [0.1, 1.25, 0] } // final hero pull-back
}

export default function CinematicCamera({ phase = 0, isMobile = false }) {
  const { camera, pointer } = useThree()
  const currentPos = useRef(new THREE.Vector3(...KEYFRAMES[0].pos))
  const currentLook = useRef(new THREE.Vector3(...KEYFRAMES[0].look))
  const shakeOffset = useRef(new THREE.Vector3())

  useFrame((state, dt) => {
    const kf = KEYFRAMES[phase] ?? KEYFRAMES[0]
    const targetPos = new THREE.Vector3(...kf.pos)
    const targetLook = new THREE.Vector3(...kf.look)

    // slow, cinematic damping (not linear, not robotic)
    currentPos.current.x = damp(currentPos.current.x, targetPos.x, 0.9, dt)
    currentPos.current.y = damp(currentPos.current.y, targetPos.y, 0.9, dt)
    currentPos.current.z = damp(currentPos.current.z, targetPos.z, 0.9, dt)

    currentLook.current.x = damp(currentLook.current.x, targetLook.x, 1.1, dt)
    currentLook.current.y = damp(currentLook.current.y, targetLook.y, 1.1, dt)
    currentLook.current.z = damp(currentLook.current.z, targetLook.z, 1.1, dt)

    // extremely subtle handheld camera shake
    const t = state.clock.elapsedTime
    shakeOffset.current.set(
      Math.sin(t * 1.3) * 0.006,
      Math.cos(t * 1.7) * 0.005,
      0
    )

    // gentle desktop-only mouse parallax; character keeps looking at flag
    let parallaxX = 0
    let parallaxY = 0
    if (!isMobile) {
      parallaxX = pointer.x * 0.18
      parallaxY = pointer.y * 0.1
    }

    camera.position.set(
      currentPos.current.x + shakeOffset.current.x + parallaxX,
      currentPos.current.y + shakeOffset.current.y + parallaxY,
      currentPos.current.z
    )
    camera.lookAt(currentLook.current)
  })

  return null
}
