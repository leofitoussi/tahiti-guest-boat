import { ImageIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const galleryBlock = defineType({
  name: 'galleryBlock',
  title: 'Galerie photos (masonry)',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Surtitre',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
    }),
    defineField({
      name: 'columns',
      title: 'Nombre de colonnes',
      type: 'number',
      options: {
        list: [
          { title: '2 colonnes', value: 2 },
          { title: '3 colonnes', value: 3 },
          { title: '4 colonnes', value: 4 },
        ],
        layout: 'radio',
      },
      initialValue: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gap',
      title: 'Espacement',
      type: 'string',
      options: {
        list: [
          { title: 'Petit', value: 'sm' },
          { title: 'Moyen', value: 'md' },
          { title: 'Grand', value: 'lg' },
        ],
        layout: 'radio',
      },
      initialValue: 'md',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Photos',
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
            defineField({
              name: 'caption',
              title: 'Légende (optionnelle)',
              type: 'string',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      images: 'images',
      firstImage: 'images.0',
    },
    prepare({ title, images, firstImage }) {
      const count = Array.isArray(images) ? images.length : 0;
      return {
        title: title || 'Galerie photos',
        subtitle: `${count} photo${count > 1 ? 's' : ''}`,
        media: firstImage,
      };
    },
  },
});
