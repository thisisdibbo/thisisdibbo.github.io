import { ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import { moreBuilds, profile, work, type Project } from '../content'
import { CompactList } from './CompactList'
import { Container } from './Container'

export function Work() {
  return (
    <section id="work" aria-labelledby="work-heading" className="py-24 md:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="type-label">Selected work</p>
            <h2 id="work-heading" className="type-h2 mt-5">
              Recent <span className="text-primary">builds</span>.
            </h2>
          </div>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/70 transition-colors hover:text-foreground"
          >
            Everything on GitHub
            <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-14 md:mt-16 md:grid-cols-2 md:gap-y-20">
          {work.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>

        <CompactList label="More builds" items={moreBuilds} />
      </Container>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const screen = project.fit === 'screen'
  return (
    <a href={project.href} target="_blank" rel="noreferrer" data-cursor="view" className="group block min-w-0">
      <div
        className={clsx(
          'relative aspect-[4/3] overflow-hidden rounded-[6px] bg-card',
          screen && 'grid place-items-center border border-border p-5 md:p-8',
        )}
      >
        <img
          src={project.image}
          alt={project.alt}
          loading="lazy"
          decoding="async"
          style={project.position ? { objectPosition: project.position } : undefined}
          className={clsx(
            'transition-transform duration-[900ms] ease-[var(--ease-expo)] group-hover:scale-105',
            screen
              ? 'w-full rounded-[4px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10'
              : 'size-full object-cover',
          )}
        />
      </div>
      <div className="mt-6 flex items-baseline justify-between gap-6">
        <p className="type-label min-w-0 !text-muted-foreground">{project.stack}</p>
        <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">{project.year}</span>
      </div>
      <h3 className="mt-3 font-display text-[26px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[30px]">
        {project.title}
      </h3>
      <p className="mt-3 max-w-[52ch] text-muted-foreground">{project.result}</p>
    </a>
  )
}
