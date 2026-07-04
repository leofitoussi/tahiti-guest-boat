import { defineField, defineType } from 'sanity';
import { defineLocalizationFields } from './localization-fields';
import { activityDescriptionText, inlineText, richText } from './portableText';
import { seo as seoType } from './seo';

export const cruisePage = defineType({
  name: 'cruisePage',
  title: 'Cruise page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    ...defineLocalizationFields(),
    defineField({
      name: 'destinationLabel',
      title: 'Libellé destination',
      type: 'string',
      description: 'Nom court de la destination utilisé dans les blocs partagés et les formulations sensibles à la grammaire.',
      validation: (rule) => rule.required().warning('Ajoutez le libellé destination pour personnaliser les blocs partagés.'),
    }),
    defineField({
      name: 'editorialPriority',
      title: 'Priorité éditoriale',
      type: 'number',
      description: 'Priorité utilisée pour ordonner Autres croisières. Une valeur plus élevée remonte la page.',
      initialValue: 0,
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(170),
    }),
    defineField({
      name: 'seo',
      title: seoType.title,
      type: 'seo',
    }),
    defineField({
      name: 'visible',
      title: 'Visible dans le listing',
      type: 'boolean',
      initialValue: false,
      description: 'Cocher pour afficher cette croisière dans la page /nos-croisieres. Les pages cachées restent accessibles par URL directe.',
    }),
    defineField({
      name: 'hero',
      title: 'Hero croisière',
      type: 'heroBlock',
      validation: (rule) => rule.required().warning('Ajoutez le Hero croisière pour présenter la page.'),
    }),
    defineField({
      name: 'cruiseTeaser',
      title: 'Accroche croisière',
      type: 'object',
      validation: (rule) => rule.required().warning("Ajoutez l'Accroche croisière pour qualifier l'expérience rapidement."),
      fields: [
        defineField({
          name: 'headline',
          title: 'Titre',
          type: 'array',
          of: inlineText,
          description: 'Titre de l’accroche (gras / italique possibles).',
        }),
        defineField({
          name: 'capacity',
          title: 'Capacité',
          type: 'string',
        }),
        defineField({
          name: 'minimumDuration',
          title: 'Durée minimum',
          type: 'string',
        }),
        defineField({
          name: 'pricing',
          title: 'Tarif',
          type: 'string',
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'bookingBody',
      title: 'Texte de réservation (tarif, inclus / non inclus)',
      type: 'array',
      of: activityDescriptionText,
      description: 'Texte affiché dans le bloc réservation de cette croisière (tarifs, ce qui est inclus / non inclus).',
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie défilante',
      type: 'object',
      description: 'Une rangée de photos qui défile sous l’accroche croisière.',
      fields: [
        defineField({
          name: 'title',
          title: 'Titre',
          type: 'array',
          of: inlineText,
          description: 'Titre de la section (gras / italique possibles).',
        }),
        defineField({
          name: 'text',
          title: 'Texte libre',
          type: 'array',
          of: activityDescriptionText,
          description: 'Texte d’introduction (gras, italique, liens, listes) affiché sous le titre, avant les images.',
        }),
        defineField({
          name: 'images',
          title: 'Images',
          type: 'array',
          of: [
            defineField({
              name: 'image',
              title: 'Image',
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
        }),
      ],
    }),
    defineField({
      name: 'introductionDestination',
      title: 'Introduction destination',
      type: 'object',
      description: 'Bloc éditorial affiché après la galerie pour expliquer pourquoi la croisière est adaptée à la destination.',
      fields: [
        defineField({
          name: 'heading',
          title: 'Titre',
          type: 'array',
          of: inlineText,
          description: 'Titre du bloc (gras / italique possibles).',
        }),
        defineField({ name: 'body', title: 'Texte', type: 'array', of: richText }),
        defineField({
          name: 'images',
          title: 'Galerie',
          type: 'array',
          of: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [defineField({ name: 'alt', title: 'Texte alternatif', type: 'string', validation: (r) => r.required() })],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'boat',
      title: 'Notre bateau (Na Maka)',
      type: 'boatBlock',
      description: 'Bloc expliquant pourquoi le catamaran Na Maka est idéal pour cette croisière. Affiché après l’introduction destination, avant l’itinéraire.',
      validation: (rule) => rule.required().warning('Ajoutez le bateau recommandé pour renforcer la conversion.'),
    }),
    defineField({
      name: 'itinerary',
      title: 'Itinéraire',
      type: 'itineraryBlock',
      validation: (rule) => rule.required().warning('Ajoutez un itinéraire indicatif pour rendre la croisière concrète.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Cruise page',
        subtitle: subtitle ? `/nos-croisieres/${subtitle}/` : 'No slug',
      };
    },
  },
});
