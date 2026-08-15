import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { buildLanguageSwitcher, defaultLocale, type LanguageSwitcherOption, type Locale } from "../../lib/localization"
import { getSiteCopy } from "../../lib/site-copy"

interface LanguageSwitcherProps {
  locale?: Locale
  options?: LanguageSwitcherOption[]
  className?: string
  placement?: "above" | "below"
}

export function LanguageSwitcher({
  locale = defaultLocale,
  options = buildLanguageSwitcher(locale),
  className,
  placement = "below",
}: LanguageSwitcherProps) {
  const copy = getSiteCopy(locale)
  const currentOption = options.find((option) => option.isCurrent) ?? options[0]

  if (!currentOption) {
    return null
  }

  const getFlag = (optionLocale: Locale) => (optionLocale === "fr" ? "🇫🇷" : "🇬🇧")

  return (
    <nav className={className} aria-label={copy.shell.languageSwitcherLabel}>
      <details className="group relative w-fit">
        <summary
          aria-haspopup="menu"
          aria-label={`${copy.shell.languageSwitcherLabel}: ${currentOption.label}`}
          className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-[var(--radius-control)] border border-border/70 bg-background px-2.5 text-xs font-semibold tracking-[0.12em] uppercase shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 [&::-webkit-details-marker]:hidden"
        >
          <span className="text-base leading-none" aria-hidden="true">
            {getFlag(currentOption.locale)}
          </span>
          <ChevronDownIcon
            className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <ul
          className={`absolute right-0 z-50 min-w-16 rounded-[var(--radius-panel)] border border-border/70 bg-popover p-1 text-xs font-semibold tracking-[0.12em] text-popover-foreground shadow-md ${
            placement === "above" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]"
          }`}
        >
          {options.map((option) => (
            <li key={option.locale}>
              {option.href ? (
                <a
                  href={option.href}
                  data-language-switcher="true"
                  aria-label={option.label}
                  title={option.label}
                  className="flex min-h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] px-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {getFlag(option.locale)}
                  </span>
                </a>
              ) : (
                <span
                  aria-current={option.isCurrent ? "page" : undefined}
                  title={option.label}
                  className="flex min-h-9 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-muted px-2.5 text-foreground"
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {getFlag(option.locale)}
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </details>
    </nav>
  )
}
