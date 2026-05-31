import { ImagesIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

function imageRowField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'alt',
            title: 'Texte alternatif',
            type: 'string',
            validation: (rule) => rule.required(),
          }),
        ],
      }),
    ],
    validation: (rule) =>
      rule.min(5).warning('Recommandé : 5 images minimum pour un défilement fluide sans couture visible.'),
  });
}

export const marqueeGalleryBlock = defineType({
  name: 'marqueeGalleryBlock',
  title: 'Galerie défilante',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({ name: 'eyebrow', title: 'Surtitre', type: 'string' }),
    defineField({ name: 'title', title: 'Titre', type: 'string' }),
    imageRowField('row1', 'Ligne 1 — défile vers la droite'),
    imageRowField('row2', 'Ligne 2 — défile vers la gauche'),
    imageRowField('row3', 'Ligne 3 — défile vers la droite'),
  ],
  preview: {
    select: { title: 'title', firstImage: 'row1.0' },
    prepare({ title, firstImage }) {
      return {
        title: title || 'Galerie défilante',
        subtitle: '3 lignes en marquee',
        media: firstImage,
      };
    },
  },
});
