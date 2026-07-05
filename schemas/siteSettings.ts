import { defineArrayMember, defineField, defineType } from 'sanity';
import { defineLocalizationFields } from './localization-fields';
import { activityDescriptionText, h2HeadingText } from './portableText';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: false,
      },
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      description: 'Icône affichée dans l’onglet du navigateur. Utiliser une image carrée (idéalement 512×512px, PNG ou SVG).',
      type: 'image',
      options: {
        hotspot: false,
      },
    }),
    ...defineLocalizationFields(),
    defineField({
      name: 'logoAlt',
      title: 'Logo — texte alternatif',
      type: 'string',
    }),
    defineField({
      name: 'reservationText',
      title: 'Bouton réservation — texte',
      type: 'string',
    }),
    defineField({
      name: 'reservationLink',
      title: 'Bouton réservation — lien',
      type: 'url',
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'nav',
      title: 'Navigation',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'navItem',
          title: 'Nav item',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Lien',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'hasDropdown',
              title: 'Indicateur dropdown',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'footerLink',
          title: 'Footer link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer text',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
    }),
    defineField({
      name: 'whyUsTitle',
      title: 'Why us — titre principal',
      type: 'array',
      of: h2HeadingText,
      description: 'Titre éditorial en h2 avec gras/italique.',
      validation: (rule) => rule.max(1),
    }),
    defineField({
      name: 'whyUsArguments',
      title: 'Why us — arguments',
      type: 'array',
      description: 'Trois colonnes : icône étoile + texte.',
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          name: 'whyUsArgument',
          title: 'Argument',
          type: 'object',
          fields: [
            defineField({
              name: 'body',
              title: 'Texte',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              subtitle: 'body',
            },
            prepare({ subtitle }) {
              return { title: subtitle };
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'bookingEmbed',
      title: 'Booking embed',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
        }),
        defineField({
          name: 'providerName',
          title: 'Provider name',
          type: 'string',
        }),
        defineField({
          name: 'embedUrl',
          title: 'Embed URL',
          type: 'url',
          validation: (rule) =>
            rule.uri({
              scheme: ['http', 'https'],
            }),
        }),
        defineField({
          name: 'fallbackCtaLabel',
          title: 'Fallback CTA label',
          type: 'string',
        }),
        defineField({
          name: 'fallbackCtaUrl',
          title: 'Fallback CTA URL',
          type: 'url',
          validation: (rule) =>
            rule.uri({
              allowRelative: true,
              scheme: ['http', 'https', 'mailto', 'tel'],
            }),
        }),
        defineField({
          name: 'body',
          title: 'Texte (tarif, inclus / non inclus) — pages génériques hors croisière',
          description:
            'Utilisé uniquement sur les pages génériques du Page Builder. Chaque page croisière a son propre texte, indépendant de celui-ci.',
          type: 'array',
          of: activityDescriptionText,
        }),
      ],
    }),
    defineField({
      name: 'headScripts',
      title: 'Scripts <head> (tracking)',
      type: 'text',
      rows: 12,
      description:
        'Code de suivi injecté tel quel dans le <head> de toutes les pages (analytics, bannière cookies, ' +
        'Pixel Facebook, Google Ads…). Ordre = ordre de chargement : la bannière de consentement en premier, ' +
        "puis l'analytics, puis les pixels qu'elle doit gater. À renseigner une seule fois ici (version " +
        'française) : il est appliqué à toutes les langues du site.',
      hidden: ({ document }) => document?.locale !== 'fr',
      validation: (rule) =>
        rule.custom((value) =>
          !value || value.includes('<') ? true : 'Cela ne ressemble pas à du HTML/script.'
        ),
    }),
  ],
  preview: {
    select: {
      title: 'siteName',
      media: 'logo',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Site settings',
        subtitle: 'Singleton',
        media,
      };
    },
  },
});
