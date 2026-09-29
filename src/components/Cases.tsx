import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { cases, moreCases, type Deck } from '../content'
import { CompactList } from './CompactList'
import { DeckViewer } from './DeckViewer'
import { TalkRows } from './TalkRows'

type Open = { title: string; subtitle: string; decks: Deck[] }

/** Case competitions. Clicking a case opens its slides. Hidden until content.ts has a case. */
export function Cases() {
  const [open, setOpen] = useState<Open | null>(null)
  if (cases.length === 0) return null

  return (
    <>
      <TalkRows
        id="cases"
        label="Case competitions"
        heading="Business cases I’ve pitched."
        items={cases}
        thumbWidth={336}
        thumbRatio={16 / 9}
        onSelect={(i) => {
          const c = cases[i]
          if (c.decks) setOpen({ title: c.title, subtitle: c.venue, decks: c.decks })
        }}
      >
        {moreCases.length > 0 && (
          <CompactList
            label="More cases"
            items={moreCases}
            onSelect={(i) => {
              const c = moreCases[i]
              setOpen({ title: c.title, subtitle: `${c.meta} · ${c.year}`, decks: c.decks })
            }}
          />
        )}
      </TalkRows>
      <AnimatePresence>
        {open && <DeckViewer key={open.title} {...open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  )
}
