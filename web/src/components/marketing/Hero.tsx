import { Pill, OutlinePill } from "./Pill";
import { Reveal } from "./Reveal";
import { NoiseOverlay } from "./NoiseOverlay";
import { HERO_COPY, ANNOUNCEMENT_STRIP } from "./sections";

export function Hero() {
  return (
    <section className="relative mt-[84px] border border-border border-b-0 bg-background">
      <NoiseOverlay />

      {/* Announcement strip */}
      <div className="relative z-10 flex items-center justify-between border-b border-border px-4 py-3 text-xs sm:px-6 sm:text-sm">
        <a
          href="#pricing"
          className="flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
        >
          <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
          <span className="underline decoration-foreground/40 underline-offset-2 hover:decoration-foreground">
            {ANNOUNCEMENT_STRIP.left}
          </span>
        </a>
        <div className="hidden items-center gap-4 text-foreground/60 lg:flex">
          {ANNOUNCEMENT_STRIP.right.map((item) => (
            <span key={item.label} className="whitespace-nowrap">
              <span className="text-muted-foreground">{item.label}</span>{" "}
              <span className="font-mono font-semibold tabular-nums text-foreground">{item.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dashed grid panel */}
      <div className="relative z-10 grid grid-cols-1 gap-0 px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="grid grid-cols-10 gap-0">
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1" />
        </div>

        <Reveal direction="up">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {HERO_COPY.kicker}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl lg:text-7xl">
              {HERO_COPY.headline1}
              <br />
              {HERO_COPY.headline2}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {HERO_COPY.subhead}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Pill asLink to={HERO_COPY.primary.to}>
                <span className="font-mono text-sm sm:text-base">{HERO_COPY.primary.label}</span>
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path d="M8 8V4h12v12h-4M16 8v12H4V8h12z" strokeLinecap="round" />
                </svg>
              </Pill>
              <OutlinePill asLink href={HERO_COPY.secondary.href}>
                {HERO_COPY.secondary.label}
              </OutlinePill>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-10 gap-0">
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1 dash-right hidden sm:block" />
          <div className="col-span-1" />
        </div>
      </div>
    </section>
  );
}
