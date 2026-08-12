import * as React from "react"

import { buildLanguageSwitcher, defaultLocale, type LanguageSwitcherOption, type Locale } from "../../lib/localization"
import { getSiteCopy } from "../../lib/site-copy"

interface LanguageSwitcherProps {
  locale?: Locale
  options?: LanguageSwitcherOption[]
  className?: string
}

export function LanguageSwitcher({
  locale = defaultLocale,
  options = buildLanguageSwitcher(locale),
  className,
}: LanguageSwitcherProps) {
  const copy = getSiteCopy(locale)

  return (
    <nav className={className} aria-label={copy.shell.languageSwitcherLabel}>
      <ul className="flex items-center gap-1 rounded-[var(--radius-control)] border border-border/70 p-1 text-xs font-semibold tracking-[0.12em]">
        {options.map((option) => (
          <li key={option.locale}>
            {option.href ? (
              <a
                href={option.href}
                aria-label={option.label}
                className="inline-flex min-h-8 min-w-9 items-center justify-center rounded-[calc(var(--radius-control)-2px)] px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {option.shortLabel}
              </a>
            ) : (
              <span
                aria-current={option.isCurrent ? "page" : undefined}
                title={option.label}
                className="inline-flex min-h-8 min-w-9 items-center justify-center rounded-[calc(var(--radius-control)-2px)] bg-primary px-2 text-primary-foreground"
              >
                {option.shortLabel}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
