import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityClient } from 'sanity:client';

const { projectId, dataset } = sanityClient.config();

export const isSanityConfigured = Boolean(projectId && dataset);

const builder = projectId && dataset ? imageUrlBuilder({ projectId, dataset }) : null;

export function urlForImage(source: SanityImageSource) {
  return builder?.image(source);
}

// Largeurs responsive pour les images hero plein écran (ratio 3:2, 1680×1120).
const HERO_WIDTHS = [640, 828, 1080, 1280, 1680];
const HERO_ASPECT = 1120 / 1680;

export interface ResponsiveImage {
  src: string;
  srcset: string;
  sizes: string;
  width: number;
  height: number;
}

/**
 * Construit un jeu de sources responsive pour une image hero plein largeur.
 * Permet au navigateur (notamment mobile) de télécharger une variante adaptée
 * au lieu du 1680px unique, et alimente le preload LCP côté <head>.
 */
export function heroImageSources(source: SanityImageSource): ResponsiveImage | undefined {
  if (!builder) return undefined;
  const build = (w: number) =>
    builder
      .image(source)
      .width(w)
      .height(Math.round(w * HERO_ASPECT))
      .fit('crop')
      .quality(84)
      .auto('format')
      .url();
  return {
    src: build(1680),
    srcset: HERO_WIDTHS.map((w) => `${build(w)} ${w}w`).join(', '),
    sizes: '100vw',
    width: 1680,
    height: 1120,
  };
}
