import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { defaultLocale, localizeHref, type Locale } from "../../lib/localization"

interface NavItem {
  label: string
  href: string
}

interface DesktopNavigationProps {
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
  locale?: Locale
}

export function DesktopNavigation({
  navItems,
  ctaLabel,
  ctaHref = "/contact",
  locale = defaultLocale,
}: DesktopNavigationProps) {
  return (
    <div className="hidden items-center gap-4 md:flex">
      <NavigationMenu>
        <NavigationMenuList>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink render={<a href={item.href} />}>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      {ctaLabel ? (
        <a href={localizeHref(ctaHref, locale)} className={buttonVariants({ variant: "primary" })}>
          {ctaLabel}
        </a>
      ) : null}
    </div>
  )
}
