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
import { defaultLocale, localizeHref, type Locale } from "../../lib/localization"
import { getSiteCopy } from "../../lib/site-copy"

interface NavItem {
  label: string
  href: string
}

interface MobileDrawerProps {
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
  menuLabel?: string
  navigationLabel?: string
  locale?: Locale
}

export function MobileDrawer({
  navItems,
  ctaLabel,
  ctaHref = "/contact",
  menuLabel,
  navigationLabel,
  locale = defaultLocale,
}: MobileDrawerProps) {
  const copy = getSiteCopy(locale)
  const resolvedMenuLabel = menuLabel ?? copy.shell.mobileMenuLabel
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
            render={<Button variant="ghost" size="icon-sm" aria-label="Fermer" />}
          >
            <XIcon />
          </SheetClose>
        </div>

        <nav className="flex flex-1 flex-col divide-y divide-border/50 px-5" aria-label={resolvedNavigationLabel}>
          {navItems.map((item) => (
            <SheetClose
              key={item.href}
              nativeButton={false}
              render={
                <a
                  href={item.href}
                  className="py-5 font-heading text-2xl text-foreground transition-colors hover:text-primary"
                />
              }
            >
              {item.label}
            </SheetClose>
          ))}
        </nav>

        {ctaLabel ? (
          <div className="shrink-0 px-5 pb-8 pt-4">
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
