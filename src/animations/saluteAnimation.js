// Maps the master scene "phase" to a target salute pose.
// Phase timeline (seconds), matches the reel sequence in App.jsx:
// 0: dark / distant        -> arm down, relaxed
// 1: establishing shot     -> arm down, relaxed, subtle breathing
// 2: character reveal      -> arm begins to lift
// 3: salute rising         -> arm rising toward forehead
// 4: salute held           -> full salute pose, held
// 5: flag close-up         -> salute held (person out of frame)
// 6: final hero shot       -> salute held, proud stance

export const SALUTE_PHASES = {
  IDLE: 0,
  ESTABLISH: 1,
  REVEAL: 2,
  RISING: 3,
  HELD: 4,
  FLAG_CLOSEUP: 5,
  FINAL: 6
}

// Target shoulder / elbow / wrist rotations (radians) per phase.
// Rotations are for the RIGHT arm rig: shoulder pitches forward/up,
// elbow bends to bring the forearm up, wrist tilts the hand to the brow.
export const POSE_TARGETS = {
  [SALUTE_PHASES.IDLE]: { shoulder: 0.02, elbow: 0.05, wrist: 0 },
  [SALUTE_PHASES.ESTABLISH]: { shoulder: 0.02, elbow: 0.05, wrist: 0 },
  [SALUTE_PHASES.REVEAL]: { shoulder: 0.35, elbow: 0.6, wrist: 0.1 },
  [SALUTE_PHASES.RISING]: { shoulder: 1.05, elbow: 1.85, wrist: 0.35 },
  [SALUTE_PHASES.HELD]: { shoulder: 1.35, elbow: 2.15, wrist: 0.45 },
  [SALUTE_PHASES.FLAG_CLOSEUP]: { shoulder: 1.35, elbow: 2.15, wrist: 0.45 },
  [SALUTE_PHASES.FINAL]: { shoulder: 1.35, elbow: 2.15, wrist: 0.45 }
}

// Smooth, non-robotic damping toward a target value.
// lambda controls speed (higher = snappier); dt = frame delta.
export function damp(current, target, lambda, dt) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export function getPoseTarget(phase) {
  return POSE_TARGETS[phase] ?? POSE_TARGETS[SALUTE_PHASES.IDLE]
}
