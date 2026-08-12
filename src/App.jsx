import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import CinematicScene from './components/CinematicScene'
import FinalMessage from './components/FinalMessage'
import { useIsMobile, usePixelRatio } from './utils/device'

// Reel-timed phase schedule (seconds), matching the requested sequence.
// Phase numbers correspond to SALUTE_PHASES / camera KEYFRAMES.
const PHASE_SCHEDULE = [
  { phase: 0, at: 0 }, // dark screen, distant silhouette — 15 AUGUST 2026
  { phase: 1, at: 3 }, // establishing shot — INDIA
  { phase: 2, at: 7 }, // character reveal
  { phase: 3, at: 9 }, // salute rising
  { phase: 4, at: 11 }, // salute held, close-up
  { phase: 5, at: 15 }, // flag close-up + rotate — A SALUTE TO FREEDOM
  { phase: 6, at: 21 } // final hero shot — HAPPY INDEPENDENCE DAY / JAI HIND
]
const LOOP_AFTER = 30 // seconds — restart the sequence for continuous reel capture

export default function App() {
  const [phase, setPhase] = useState(0)
  const [ready, setReady] = useState(false)
  const isMobile = useIsMobile()
  const dpr = usePixelRatio(isMobile)
  const timers = useRef([])

  useEffect(() => {
    const startTimers = () => {
      timers.current.forEach(clearTimeout)
      timers.current = PHASE_SCHEDULE.map(({ phase: p, at }) =>
        setTimeout(() => setPhase(p), at * 1000)
      )
      timers.current.push(
        setTimeout(() => {
          setPhase(0)
          startTimers()
        }, LOOP_AFTER * 1000)
      )
    }
    startTimers()
    return () => timers.current.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="scene-wrapper">
      {!ready && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
          <span className="loading-shimmer font-cinematic text-sm tracking-[0.5em]">
            LOADING SCENE
          </span>
        </div>
      )}

      <Canvas
        shadows={!isMobile}
        dpr={dpr}
        camera={{ fov: isMobile ? 58 : 42, near: 0.1, far: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050810']} />
        <Suspense fallback={null}>
          <CinematicScene phase={phase} isMobile={isMobile} />
          {!isMobile && (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={0.55}
                luminanceThreshold={0.35}
                luminanceSmoothing={0.25}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.25} darkness={0.9} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>

      <FinalMessage phase={phase} />

      {/* subtle vertical composition guide is implicit — no UI chrome so the frame stays clean for recording */}
    </div>
  )
}
