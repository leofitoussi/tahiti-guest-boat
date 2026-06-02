import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ChevronDownIcon } from "lucide-react"
import { defaultLocale, localizeHref, type Locale } from "../../lib/localization"

interface NavItem {
  label: string
  href: string
  hasDropdown?: boolean
}

interface CruiseLink {
  label: string
  href: string
}

interface DesktopNavigationProps {
  navItems: NavItem[]
  cruiseLinks?: CruiseLink[]
  ctaLabel?: string
  ctaHref?: string
  locale?: Locale
}

function shouldRenderCruiseDropdown(item: NavItem, cruiseLinks: CruiseLink[]) {
  const normalizedHref =
    item.href.replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "") || "/"
  const isCruiseNavItem = normalizedHref === "/nos-croisieres" || /croisi|cruise/i.test(item.label)

  return cruiseLinks.length > 0 && isCruiseNavItem && (item.hasDropdown || normalizedHref === "/nos-croisieres")
}

export function DesktopNavigation({
  navItems,
  cruiseLinks = [],
  ctaLabel,
  ctaHref = "/contact",
  locale = defaultLocale,
}: DesktopNavigationProps) {
  return (
    <div className="hidden items-center gap-4 md:flex">
      <NavigationMenu>
        <NavigationMenuList>
          {navItems.map((item) => {
            const hasCruiseDropdown = shouldRenderCruiseDropdown(item, cruiseLinks)

            return (
              <NavigationMenuItem key={item.href} className="group/navigation-item">
                <NavigationMenuLink
                  render={<a href={item.href} aria-haspopup={hasCruiseDropdown ? "true" : undefined} />}
                  className="min-h-11"
                >
                  <span>{item.label}</span>
                  {hasCruiseDropdown ? (
                    <ChevronDownIcon
                      className="size-3.5 transition-transform duration-200 group-hover/navigation-item:rotate-180 group-focus-within/navigation-item:rotate-180"
                      aria-hidden="true"
                    />
                  ) : null}
                </NavigationMenuLink>
                {hasCruiseDropdown ? (
                  <div className="invisible absolute left-0 top-full z-50 min-w-64 translate-y-2 rounded-[var(--radius-panel)] bg-popover p-2 text-popover-foreground opacity-0 shadow-lg ring-1 ring-border/70 transition-[opacity,transform,visibility] duration-200 ease-out group-hover/navigation-item:visible group-hover/navigation-item:translate-y-0 group-hover/navigation-item:opacity-100 group-focus-within/navigation-item:visible group-focus-within/navigation-item:translate-y-0 group-focus-within/navigation-item:opacity-100">
                    <nav className="flex flex-col" aria-label={item.label}>
                      {cruiseLinks.map((cruise) => (
                        <NavigationMenuLink
                          key={cruise.href}
                          render={<a href={cruise.href} />}
                          className="min-h-11 whitespace-nowrap px-3 py-2.5 font-heading text-base"
                        >
                          {cruise.label}
                        </NavigationMenuLink>
                      ))}
                    </nav>
                  </div>
                ) : null}
              </NavigationMenuItem>
            )
          })}
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
