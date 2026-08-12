const PHASE_TEXT = {
  0: { lines: ['15 AUGUST 2026'], size: 'text-lg md:text-2xl', tracking: 'tracking-widest' },
  1: { lines: ['INDIA'], size: 'text-4xl md:text-6xl', tracking: 'tracking-[0.4em]' },
  5: { lines: ['A Tribute to the Brave Souls & स्वातंत्र्यदिनाच्या हार्दिक शुभेच्छा'], size: 'text-xl md:text-3xl', tracking: 'tracking-[0.3em]' },
  6: {
    lines: ['HAPPY INDEPENDENCE DAY 🇮🇳', 'JAI HIND'],
    size: 'text-2xl md:text-4xl',
    tracking: 'tracking-[0.2em]'
  }
}

/**
 * Renders only a few words at a time, keyed by phase so each reveal
 * replays the blur -> sharp / fade / letter-spacing CSS animation
 * defined in index.css (.text-blur-in).
 */
export default function FinalMessage({ phase }) {
  const content = PHASE_TEXT[phase]
  if (!content) return null

  return (
    <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-end pb-[14%] md:justify-center md:pb-0 z-20">
      <div key={phase} className="flex flex-col items-center gap-2 text-center px-6">
        {content.lines.map((line, i) => (
          <h1
            key={line}
            className={`text-blur-in font-cinematic text-white ${content.size} ${content.tracking} glow-text`}
            style={{ animationDelay: `${i * 0.35}s` }}
          >
            {line}
          </h1>
        ))}
        {phase === 6 && (
          <div
            className="text-blur-in mt-3 h-[2px] w-24 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"
            style={{ animationDelay: '0.7s' }}
          />
        )}
      </div>
    </div>
  )
}
