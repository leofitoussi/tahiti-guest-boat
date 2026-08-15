"use client"

import * as React from "react"
import { MenuIcon, XIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { defaultLocale, localizeHref, type LanguageSwitcherOption, type Locale } from "../../lib/localization"
import { getSiteCopy } from "../../lib/site-copy"
import { LanguageSwitcher } from "./LanguageSwitcher"

interface NavItem {
  label: string
  href: string
  hasDropdown?: boolean
}

interface CruiseLink {
  label: string
  href: string
}

interface MobileDrawerProps {
  navItems: NavItem[]
  cruiseLinks?: CruiseLink[]
  ctaLabel?: string
  ctaHref?: string
  menuLabel?: string
  closeMenuLabel?: string
  navigationLabel?: string
  locale?: Locale
  languageOptions?: LanguageSwitcherOption[]
}

function shouldRenderCruiseLinks(item: NavItem, cruiseLinks: CruiseLink[]) {
  const normalizedHref =
    item.href.replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "") || "/"
  const isCruiseNavItem = normalizedHref === "/nos-croisieres" || /croisi|cruise/i.test(item.label)

  return cruiseLinks.length > 0 && isCruiseNavItem && (item.hasDropdown || normalizedHref === "/nos-croisieres")
}

export function MobileDrawer({
  navItems,
  cruiseLinks = [],
  ctaLabel,
  ctaHref = "/contact",
  menuLabel,
  closeMenuLabel,
  navigationLabel,
  locale = defaultLocale,
  languageOptions,
}: MobileDrawerProps) {
  const copy = getSiteCopy(locale)
  const resolvedMenuLabel = menuLabel ?? copy.shell.mobileMenuLabel
  const resolvedCloseMenuLabel = closeMenuLabel ?? copy.shell.closeMenuLabel
  const resolvedNavigationLabel = navigationLabel ?? copy.shell.navigationLabel

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" aria-label={resolvedMenuLabel} />}>
        <MenuIcon className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[min(22rem,88vw)] flex-col p-0" showCloseButton={false}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-5">
          <span className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            {resolvedNavigationLabel}
          </span>
          <SheetClose
            render={<Button variant="ghost" size="icon-sm" aria-label={resolvedCloseMenuLabel} />}
          >
            <XIcon />
          </SheetClose>
        </div>

        <nav className="flex flex-1 flex-col divide-y divide-border/50 px-5" aria-label={resolvedNavigationLabel}>
          {navItems.map((item) => {
            const hasCruiseLinks = shouldRenderCruiseLinks(item, cruiseLinks)

            return (
              <div key={item.href} className="flex flex-col py-1">
                <SheetClose
                  nativeButton={false}
                  render={
                    <a
                      href={item.href}
                      className="py-4 font-heading text-2xl text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                    />
                  }
                >
                  {item.label}
                </SheetClose>
                {hasCruiseLinks ? (
                  <div className="mb-3 flex flex-col gap-1 border-l border-border/70 pl-4">
                    {cruiseLinks.map((cruise) => (
                      <SheetClose
                        key={cruise.href}
                        nativeButton={false}
                        render={
                          <a
                            href={cruise.href}
                            className="flex min-h-11 items-center font-heading text-lg text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                          />
                        }
                      >
                        {cruise.label}
                      </SheetClose>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-border/70 px-5 pb-8 pt-5">
          <LanguageSwitcher locale={locale} options={languageOptions} placement="above" />
        </div>
        {ctaLabel ? (
          <div className="shrink-0 border-t border-border/70 px-5 pb-8 pt-4">
            <SheetClose
              nativeButton={false}
              render={
                <a
                  href={localizeHref(ctaHref, locale)}
                  className={buttonVariants({ variant: "primary", className: "w-full" })}
                />
              }
            >
              {ctaLabel}
            </SheetClose>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
