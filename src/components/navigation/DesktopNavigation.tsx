import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

interface NavItem {
  label: string
  href: string
}

interface DesktopNavigationProps {
  navItems: NavItem[]
  ctaLabel?: string
  ctaHref?: string
}

export function DesktopNavigation({
  navItems,
  ctaLabel,
  ctaHref = "/contact",
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
        <a href={ctaHref} className={buttonVariants({ variant: "primary" })}>
          {ctaLabel}
        </a>
      ) : null}
    </div>
  )
}
