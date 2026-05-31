"use client"

import * as React from "react"
import { MenuIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface NavItem {
  label: string
  href: string
}

interface MobileDrawerProps {
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
}

export function MobileDrawer({
  navItems,
  ctaLabel,
  ctaHref = "/contact",
}: MobileDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Ouvrir le menu" />}>
        <MenuIcon data-icon="inline-start" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(24rem,88vw)]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-8" aria-label="Navigation mobile">
          {navItems.map((item) => (
            <SheetClose
              key={item.href}
              nativeButton={false}
              render={
                <a
                  href={item.href}
                  className="py-3 font-heading text-xl font-semibold tracking-[0.14em] text-foreground uppercase transition hover:text-primary"
                />
              }
            >
              {item.label}
            </SheetClose>
          ))}
        </nav>
        {ctaLabel ? (
          <div className="mt-8 px-8">
            <SheetClose
              nativeButton={false}
              render={
                <a
                  href={ctaHref}
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
