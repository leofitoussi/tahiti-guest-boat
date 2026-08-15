import type { CruisePageSummary, SiteSettings } from './cruises';
import { buildCruisePath } from './cruise-routes';
import {
  buildLanguageSwitcher,
  defaultLocale,
  localizeHref,
  localizePath,
  type LanguageSwitcherOption,
  type Locale,
} from './localization';
import { getSiteCopy } from './site-copy';

export interface LayoutLink {
  label: string;
  href: string;
}

export interface LayoutViewModel {
  brandName: string;
  homeHref: string;
  ctaLabel: string;
  ctaHref: string;
  contactEmail?: string;
  contactPhone?: string;
  cruiseLinks: LayoutLink[];
  cruisesNavigationLabel: string;
  footerLinks: LayoutLink[];
  legalFooterLinks: LayoutLink[];
  footerText?: string;
  logoAlt: string;
  logoUrl?: string;
  languageOptions: LanguageSwitcherOption[];
  mobileMenuLabel: string;
  closeMenuLabel: string;
  navItems: (LayoutLink & {
    label: string;
    href: string;
    hasDropdown: boolean;
  })[];
  navigationLabel: string;
  footerNavigationLabel: string;
}

export function buildLayoutViewModel(
  settings: SiteSettings | null | undefined,
  logoUrl?: string,
  locale: Locale = defaultLocale,
  cruises: CruisePageSummary[] = [],
  alternatePaths: Partial<Record<Locale, string>> = {},
): LayoutViewModel {
  const copy = getSiteCopy(locale);
  const configuredFooterLinks =
    settings?.footerLinks?.map((link) => ({
      label: link.label ?? '',
      href: link.url ? localizeHref(link.url, locale) : '#',
    })) ?? [];
  const legalFooterLinks = configuredFooterLinks.filter(isLegalFooterLink);
  const cruiseLinks = cruises.flatMap((cruise) => {
    const label = cruise.title?.trim() || cruise.heroTitle?.trim();
    if (!cruise.slug || !label) return [];

    return [
      {
        label,
        href: buildCruisePath(cruise.slug, locale),
      },
    ];
  });

  return {
    brandName: settings?.siteName ?? 'Tahiti Guest Boat',
    homeHref: localizePath('/', locale),
    ctaLabel: settings?.reservationText ?? copy.shell.reservationLabel,
    ctaHref: settings?.reservationLink ? localizeHref(settings.reservationLink, locale) : localizePath('/reservation', locale),
    contactEmail: settings?.contactEmail,
    contactPhone: settings?.contactPhone,
    cruiseLinks,
    cruisesNavigationLabel: copy.pages.cruisesIndex.badge,
    footerLinks: configuredFooterLinks.filter((link) => !isLegalFooterLink(link)),
    legalFooterLinks,
    footerText: settings?.footerText ?? copy.shell.defaultFooterText,
    logoAlt: settings?.logoAlt ?? 'Logo Tahiti Guest Boat',
    logoUrl,
    mobileMenuLabel: copy.shell.mobileMenuLabel,
    closeMenuLabel: copy.shell.closeMenuLabel,
    navItems:
      settings?.nav?.map((item) => ({
        label: item.label ?? '',
        href: item.href ? localizeHref(item.href, locale) : '#',
        hasDropdown: item.hasDropdown ?? false,
      })) ?? [],
    navigationLabel: copy.shell.navigationLabel,
    footerNavigationLabel: copy.shell.footerNavigationLabel,
    languageOptions: buildLanguageSwitcher(locale, alternatePaths),
  };
}

const LEGAL_FOOTER_PATHS = new Set([
  '/politique-de-confidentialite',
  '/politique-de-cookies-ue',
  '/en/privacy-policy',
  '/en/cookie-policy',
]);

function isLegalFooterLink(link: LayoutLink) {
  const path = link.href.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  return LEGAL_FOOTER_PATHS.has(path);
}
