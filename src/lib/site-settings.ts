import type { SiteSettings } from './cruises';
import { defaultLocale, localizeHref, localizePath, type Locale } from './localization';
import { getSiteCopy } from './site-copy';

export interface LayoutViewModel {
  brandName: string;
  homeHref: string;
  ctaLabel: string;
  ctaHref: string;
  contactEmail?: string;
  contactPhone?: string;
  footerLinks: {
    label: string;
    href: string;
  }[];
  footerText?: string;
  logoAlt: string;
  logoUrl?: string;
  mobileMenuLabel: string;
  navItems: {
    label: string;
    href: string;
    hasDropdown: boolean;
  }[];
  navigationLabel: string;
  footerNavigationLabel: string;
}

export function buildLayoutViewModel(
  settings: SiteSettings | null | undefined,
  logoUrl?: string,
  locale: Locale = defaultLocale
): LayoutViewModel {
  const copy = getSiteCopy(locale);

  return {
    brandName: settings?.siteName ?? 'Tahiti Guest Boat',
    homeHref: localizePath('/', locale),
    ctaLabel: settings?.reservationText ?? 'Réserver',
    ctaHref: settings?.reservationLink ? localizeHref(settings.reservationLink, locale) : localizePath('/reservation', locale),
    contactEmail: settings?.contactEmail,
    contactPhone: settings?.contactPhone,
    footerLinks:
      settings?.footerLinks?.map((link) => ({
        label: link.label ?? '',
        href: link.url ? localizeHref(link.url, locale) : '#',
      })) ?? [],
    footerText: settings?.footerText ?? copy.shell.defaultFooterText,
    logoAlt: settings?.logoAlt ?? 'Logo Tahiti Guest Boat',
    logoUrl,
    mobileMenuLabel: copy.shell.mobileMenuLabel,
    navItems:
      settings?.nav?.map((item) => ({
        label: item.label ?? '',
        href: item.href ? localizeHref(item.href, locale) : '#',
        hasDropdown: item.hasDropdown ?? false,
      })) ?? [],
    navigationLabel: copy.shell.navigationLabel,
    footerNavigationLabel: copy.shell.footerNavigationLabel,
  };
}
