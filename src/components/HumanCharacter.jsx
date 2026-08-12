import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { damp, getPoseTarget } from '../animations/saluteAnimation'

/**
 * Stylized, low-poly cinematic human figure standing at attention and
 * saluting. Built entirely from Three.js primitives (no external GLB),
 * so it always loads instantly with zero asset dependencies.
 *
 * The rig: shoulderGroup (pivot at shoulder) -> elbowGroup (pivot at
 * elbow) -> wristGroup (pivot at wrist) -> hand. Each pivot is damped
 * toward a target rotation defined per animation phase, producing a
 * smooth, organic salute rather than a robotic snap.
 *
 * To swap in a better model later: replace the contents of this
 * component with a <primitive object={gltf.scene} /> from
 * useGLTF('/models/soldier.glb'), and drive the equivalent bones
 * (RightArm / RightForeArm / RightHand) using the same `pose` targets
 * from animations/saluteAnimation.js inside the same useFrame damp calls.
 */
export default function HumanCharacter({ phase = 0, position = [0, -1.05, 1.6] }) {
  const group = useRef()
  const shoulder = useRef()
  const elbow = useRef()
  const wrist = useRef()
  const head = useRef()
  const chest = useRef()

  const current = useRef({ shoulder: 0.02, elbow: 0.05, wrist: 0 })

  useFrame((state, dt) => {
    const target = getPoseTarget(phase)
    const lambda = 1.35 // slow, emotional, non-robotic easing

    current.current.shoulder = damp(current.current.shoulder, target.shoulder, lambda, dt)
    current.current.elbow = damp(current.current.elbow, target.elbow, lambda, dt)
    current.current.wrist = damp(current.current.wrist, target.wrist, lambda, dt)

    if (shoulder.current) {
      shoulder.current.rotation.z = -current.current.shoulder
      shoulder.current.rotation.x = -current.current.shoulder * 0.5
    }
    if (elbow.current) elbow.current.rotation.z = current.current.elbow
    if (wrist.current) wrist.current.rotation.x = current.current.wrist

    // subtle breathing / idle sway so the figure never looks frozen
    const t = state.clock.elapsedTime
    if (chest.current) {
      chest.current.scale.y = 1 + Math.sin(t * 0.9) * 0.006
      chest.current.scale.x = 1 + Math.sin(t * 0.9) * 0.003
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(t * 0.25) * 0.015
    }
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * 0.9) * 0.01
    }
  })

  const uniformMaterial = (
    <meshStandardMaterial
      color="#1a1f2b"
      roughness={0.55}
      metalness={0.25}
      flatShading
    />
  )
  const skinMaterial = (
    <meshStandardMaterial color="#3a2a22" roughness={0.7} metalness={0.05} flatShading />
  )

  return (
    <group ref={group} position={position} castShadow>
      {/* Legs */}
      <mesh position={[-0.13, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.85, 8]} />
        {uniformMaterial}
      </mesh>
      <mesh position={[0.13, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.85, 8]} />
        {uniformMaterial}
      </mesh>

      {/* Boots */}
      <mesh position={[-0.13, 0.02, 0.03]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.28]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0.13, 0.02, 0.03]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.28]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.6} flatShading />
      </mesh>

      {/* Torso / chest */}
      <group ref={chest} position={[0, 1.02, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.22, 0.55, 4, 8]} />
          {uniformMaterial}
        </mesh>
        {/* subtle belt */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.05, 8]} />
          <meshStandardMaterial color="#0a0a0c" roughness={0.4} metalness={0.4} />
        </mesh>
      </group>

      {/* Neck + Head */}
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 8]} />
        {skinMaterial}
      </mesh>
      <group ref={head} position={[0, 1.58, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.145, 12, 10]} />
          {skinMaterial}
        </mesh>
        {/* simple cap silhouette */}
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#12151c" roughness={0.5} flatShading />
        </mesh>
      </group>

      {/* Left arm — resting at side */}
      <group position={[-0.29, 1.22, 0]} rotation={[0, 0, 0.08]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.32, 4, 8]} />
          {uniformMaterial}
        </mesh>
        <mesh position={[0, -0.48, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.28, 4, 8]} />
          {uniformMaterial}
        </mesh>
        <mesh position={[0, -0.66, 0]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          {skinMaterial}
        </mesh>
      </group>

      {/* Right arm — rigged for the salute */}
      <group ref={shoulder} position={[0.29, 1.28, 0]}>
        {/* upper arm */}
        <mesh position={[0.02, -0.18, 0.02]} rotation={[0, 0, -0.1]} castShadow>
          <capsuleGeometry args={[0.058, 0.3, 4, 8]} />
          {uniformMaterial}
        </mesh>

        {/* elbow pivot, offset to end of upper arm */}
        <group ref={elbow} position={[0.06, -0.34, 0.04]}>
          <mesh position={[0.02, -0.16, 0.05]} rotation={[0.1, 0, -0.05]} castShadow>
            <capsuleGeometry args={[0.05, 0.26, 4, 8]} />
            {uniformMaterial}
          </mesh>

          {/* wrist pivot, offset to end of forearm */}
          <group ref={wrist} position={[0.03, -0.32, 0.09]}>
            <mesh castShadow rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.09, 0.11, 0.035]} />
              {skinMaterial}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
