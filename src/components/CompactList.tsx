import { ArrowRight, ArrowUpRight } from 'lucide-react'

export type CompactItem = { title: string; meta: string; year: string; href?: string }

type Props = {
  label: string
  items: CompactItem[]
  /** When set, rows open something on the page (the slide viewer) instead of following a link. */
  onSelect?: (index: number) => void
}

/** A plain, dense list: title, one line of context and a year. Rows with a link open it in a new tab. */
export function CompactList({ label, items, onSelect }: Props) {
  return (
    <div className="mt-24 md:mt-32">
      <h3 className="type-label">{label}</h3>
      <ul className="mt-6 border-t border-border">
        {items.map((item, i) => {
          const row = (
            <>
              <span className="min-w-0 font-display text-[19px] font-semibold leading-snug tracking-[-0.01em] md:text-[22px]">
                {item.title}
                {item.href && !onSelect && (
                  <ArrowUpRight className="ml-1.5 inline size-4 align-[-2px] text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}
                {onSelect && (
                  <ArrowRight className="ml-1.5 inline size-4 align-[-2px] text-primary opacity-60 transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                )}
              </span>
              <span className="col-start-1 row-start-2 min-w-0 text-[15px] leading-snug text-muted-foreground md:col-start-auto md:row-start-auto">
                {item.meta}
              </span>
              <span className="col-start-2 row-start-1 text-right text-[15px] tabular-nums text-muted-foreground md:col-start-auto md:row-start-auto">
                {item.year}
              </span>
            </>
          )
          const rowClass =
            'group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_96px] md:gap-x-10'
          return (
            <li key={item.title} className="border-b border-border">
              {onSelect ? (
                <button type="button" onClick={() => onSelect(i)} className={`${rowClass} w-full text-left`}>
                  {row}
                </button>
              ) : item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" className={rowClass}>
                  {row}
                </a>
              ) : (
                <div className={rowClass}>{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
