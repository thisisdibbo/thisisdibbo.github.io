import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { ArrowLeft, ArrowRight, Download, X } from 'lucide-react'
import clsx from 'clsx'
import type { Deck } from '../content'
import { EASE } from '../lib/motion'

export const slideUrl = (deck: Deck, n: number) => `decks/${deck.slug}/${String(n).padStart(2, '0')}.webp`
export const pdfUrl = (deck: Deck) => `decks/${deck.slug}.pdf`

type Props = { title: string; subtitle: string; decks: Deck[]; onClose: () => void }

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -56 }),
}

/**
 * Full-screen slide viewer for a case deck. Arrow keys, the side buttons or a swipe move
 * between slides; Escape or the close button returns to the page.
 */
export function DeckViewer({ title, subtitle, decks, onClose }: Props) {
  const [deckIndex, setDeckIndex] = useState(0)
  const [[page, dir], setPage] = useState<[number, number]>([1, 0])
  const deck = decks[deckIndex]
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ w: 0, h: 0 })

  const go = useCallback(
    (delta: number) =>
      setPage(([p]) => {
        const next = Math.min(deck.pages, Math.max(1, p + delta))
        return [next, next === p ? 0 : delta]
      }),
    [deck.pages],
  )

  const showDeck = (i: number) => {
    setDeckIndex(i)
    setPage([1, 0])
  }

  // Lock page scroll, move focus into the dialog, and hand focus back on close.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Keep keyboard focus inside the dialog.
        const items = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        if (!items?.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      } else if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Home') setPage([1, -1])
      else if (e.key === 'End') setPage([deck.pages, 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose, deck.pages])

  // Fit the slide inside the stage whatever its shape.
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setStage({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Warm the cache for the neighbours so paging feels instant.
  useEffect(() => {
    for (const n of [page + 1, page + 2, page - 1]) {
      if (n >= 1 && n <= deck.pages) new Image().src = slideUrl(deck, n)
    }
  }, [page, deck])

  const width = Math.max(0, Math.min(stage.w, stage.h * deck.ratio))
  const height = width / deck.ratio

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1)
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1)
  }

  const navButton =
    'grid size-12 place-items-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur transition-[background-color,opacity,transform] duration-300 hover:bg-card enabled:hover:scale-105 disabled:opacity-30'

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="deck-title"
      className="fixed inset-0 z-[90] flex flex-col bg-background/95 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4 md:px-10 md:pt-6">
        <div className="min-w-0">
          <h2
            id="deck-title"
            className="font-display text-[20px] font-semibold leading-tight tracking-[-0.02em] md:text-[26px]"
          >
            {title}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground md:text-[14px]">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a
            href={pdfUrl(deck)}
            download={`${deck.slug}.pdf`}
            className="hidden items-center gap-2 rounded-full border border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
          >
            <Download className="size-3.5" />
            PDF
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close slides"
            className="grid size-11 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-foreground"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {decks.length > 1 && (
        <div role="tablist" aria-label="Rounds" className="flex gap-2 overflow-x-auto px-5 pb-2 md:px-10">
          {decks.map((d, i) => (
            <button
              key={d.slug}
              type="button"
              role="tab"
              aria-selected={i === deckIndex}
              onClick={() => showDeck(i)}
              className={clsx(
                'shrink-0 rounded-full border px-4 py-2 text-[12px] font-medium tracking-[0.02em] transition-colors',
                i === deckIndex
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {d.label ?? `Deck ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 items-center gap-4 px-4 py-3 md:px-10 md:py-4">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(-1)}
          disabled={page === 1}
          className={clsx(navButton, 'hidden md:grid')}
        >
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </button>

        <div ref={stageRef} className="grid h-full min-w-0 flex-1 place-items-center overflow-hidden">
          <AnimatePresence initial={false} custom={dir}>
            <motion.img
              key={`${deck.slug}-${page}`}
              src={slideUrl(deck, page)}
              alt={`Slide ${page} of ${deck.pages}: ${title}`}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={onDragEnd}
              draggable={false}
              style={{ width, height }}
              className="cursor-grab touch-pan-y select-none rounded-[6px] bg-card object-contain shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 [grid-area:1/1] active:cursor-grabbing"
            />
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          disabled={page === deck.pages}
          className={clsx(navButton, 'hidden md:grid')}
        >
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </button>
      </div>

      <footer className="flex items-center gap-4 px-5 pb-5 pt-2 md:px-10 md:pb-7">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(-1)}
          disabled={page === 1}
          className={clsx(navButton, 'size-11 md:hidden')}
        >
          <ArrowLeft className="size-5" strokeWidth={1.5} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span aria-live="polite" className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
            <span className="text-foreground">{String(page).padStart(2, '0')}</span> /{' '}
            {String(deck.pages).padStart(2, '0')}
          </span>
          <div className="h-px min-w-0 flex-1 bg-border" aria-hidden="true">
            <motion.div
              className="h-px bg-primary"
              initial={false}
              animate={{ width: `${(page / deck.pages) * 100}%` }}
              transition={{ duration: 0.35, ease: EASE }}
            />
          </div>
          <a
            href={pdfUrl(deck)}
            download={`${deck.slug}.pdf`}
            aria-label="Download the PDF"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-foreground sm:hidden"
          >
            <Download className="size-4" />
          </a>
        </div>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(1)}
          disabled={page === deck.pages}
          className={clsx(navButton, 'size-11 md:hidden')}
        >
          <ArrowRight className="size-5" strokeWidth={1.5} />
        </button>
      </footer>
    </motion.div>,
    document.body,
  )
}
