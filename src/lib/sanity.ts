import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityClient } from 'sanity:client';

const { projectId, dataset } = sanityClient.config();

export const isSanityConfigured = Boolean(projectId && dataset);

const builder = projectId && dataset ? imageUrlBuilder({ projectId, dataset }) : null;

export function urlForImage(source: SanityImageSource) {
  return builder?.image(source);
}
