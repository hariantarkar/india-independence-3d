# India — A Salute to Freedom 🇮🇳

A premium cinematic 3D Independence Day experience built for a portfolio showcase / Instagram Reel. A stylized human figure stands before a waving Indian flag and salutes it, inside a dark, volumetric, cinematically-lit scene, with a slow autonomous camera move through five shots.

**Suggested repo name:** `india-salute-3d`

---

## 1. Installation

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL Vite prints (default `http://localhost:5173`). For an exact 9:16 reel capture, open Chrome DevTools → Device Toolbar → set a custom size like 405×720, or resize your window to a tall aspect ratio — the whole composition (camera framing, particle density, text position) automatically adapts under 820px width.

```bash
npm run build      # production build → dist/
npm run preview    # preview the production build
```

---

## 2. How the scene is orchestrated

`App.jsx` is the single source of truth. It runs a `PHASE_SCHEDULE` — a list of `{ phase, at }` pairs in seconds — matching the requested 0–25s reel sequence:

| Time | Phase | What happens |
|---|---|---|
| 0s | 0 | Dark screen, distant flag silhouette, "15 AUGUST 2026" |
| 3s | 1 | Establishing shot pulls in, "INDIA" |
| 7s | 2 | Character reveal, camera arcs to the person's side |
| 9s | 3 | Arm begins rising into the salute |
| 11s | 4 | Salute held, camera tightens on person + flag |
| 15s | 5 | Flag close-up, chakra + folds, "A SALUTE TO FREEDOM" |
| 21s | 6 | Final hero pull-back, particle burst, "HAPPY INDEPENDENCE DAY 🇮🇳 / JAI HIND" |
| 30s | → 0 | Loop restarts automatically for continuous reel capture |

Every visual system (camera, arm rig, flag wind, particle density, text) simply reads this single `phase` number — there's no scroll-jacking or manual triggers to wire up.

---

## 3. Major Three.js / R3F components

- **`CinematicScene.jsx`** — the scene graph: lighting rig (key, rim, flag spotlight, ground glow, ambient/hemisphere fill), fog, ground disc, distant birds, and mounts of the flag/human/particles/camera.
- **`HumanCharacter.jsx`** — a fully procedural low-poly figure (capsules, cylinders, spheres — no external model needed). The right arm is a `shoulder → elbow → wrist` pivot chain; each joint is damped every frame toward a target rotation from `animations/saluteAnimation.js`, producing a slow, organic salute instead of a snap animation. Idle breathing/sway keeps it alive when not saluting.
- **`IndianFlag.jsx`** — a `PlaneGeometry` with a canvas-generated tricolor + 24-spoke Ashoka Chakra texture (drawn at runtime, zero image assets). Every frame it displaces vertices with layered sine waves weighted by distance from the pole, simulating cloth-like wind without a physics engine, then recomputes normals so lighting reacts correctly to the folds.
- **`AshokaChakra.jsx`** — a thin rotating ring + shimmering point sprites layered exactly on top of the chakra printed in the flag texture, for the "slow rotation / glow / shimmer" requirement without ever looking neon.
- **`ParticleSystem.jsx`** — a single `Points` cloud (dust + occasional tricolor glints) that drifts upward and intensifies into a subtle tricolor burst once the final phase begins.
- **`CinematicCamera.jsx`** — no `OrbitControls`; instead a hand-authored keyframe table (one position/look-at per phase) that the camera critically-damps toward every frame, plus a hair of handheld shake and desktop-only mouse parallax (the character never turns toward the cursor — only the camera drifts).
- **`FinalMessage.jsx`** — the only DOM/text layer, an absolutely-positioned overlay keyed by phase so each headline replays the blur→sharp/letter-spacing/upward-fade CSS animation in `index.css`.

---

## 4. Replacing the character with a better 3D model later

`HumanCharacter.jsx` currently builds the figure from primitives so the project runs instantly with no binary assets. To upgrade to a rigged GLTF/GLB character:

1. Drop your file at `src/assets/models/soldier.glb`.
2. In `HumanCharacter.jsx`, replace the primitive markup with:
   ```jsx
   import { useGLTF } from '@react-three/drei'
   const { scene, nodes } = useGLTF('/src/assets/models/soldier.glb')
   return <primitive object={scene} position={position} />
   ```
3. Find your rig's right-arm bones (commonly `RightArm` / `RightForeArm` / `RightHand`, or `mixamorig:RightArm` for Mixamo rigs) via `nodes`, and drive their `.rotation` inside the same `useFrame` block using the existing `getPoseTarget(phase)` + `damp()` calls already imported from `animations/saluteAnimation.js` — the pose targets and easing don't need to change, only which object each rotation is applied to.
4. If the model ships its own salute animation clip, you can instead drive it with `useAnimations` from `drei` and simply `play()`/blend toward it when `phase >= SALUTE_PHASES.REVEAL`.
5. Call `useGLTF.preload(...)` near the bottom of the file so the model starts fetching immediately on load.

---

## 5. Performance notes

- Mobile/narrow viewports (`useIsMobile`, <820px) automatically: disable shadows, disable the bloom/vignette post-processing pass, cap `dpr` at 1.5, and cut particle count from 260 → 100.
- All animation runs inside `useFrame`, driven by `requestAnimationFrame` via R3F — no `setInterval` loops touch the render path.
- The flag's vertex displacement and particle drift mutate typed arrays in place (`pos.array[...]`) rather than allocating new geometry per frame.
- No external textures/models are fetched over the network, so first paint has zero asset-loading latency.

---

## 6. Project structure

```
src/
├── components/
│   ├── CinematicScene.jsx
│   ├── HumanCharacter.jsx
│   ├── IndianFlag.jsx
│   ├── AshokaChakra.jsx
│   ├── ParticleSystem.jsx
│   ├── CinematicCamera.jsx
│   └── FinalMessage.jsx
├── animations/
│   └── saluteAnimation.js
├── utils/
│   └── device.js
├── assets/
│   ├── models/       (empty — see section 4)
│   └── textures/     (empty — flag texture is generated at runtime)
├── App.jsx
├── main.jsx
└── index.css
```

Jai Hind. 🇮🇳
