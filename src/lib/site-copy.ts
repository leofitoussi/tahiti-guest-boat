import { defaultLocale, type Locale } from './localization';

export interface SiteCopy {
  shell: {
    mobileMenuLabel: string;
    navigationLabel: string;
    footerNavigationLabel: string;
    defaultFooterText: string;
    defaultDescription: string;
  };
    pages: {
      home: {
        title: string;
        description: string;
      };
      blogIndex: {
        title: string;
        description: string;
        badge: string;
        heading: string;
        intro: string;
        readArticle: string;
        emptyTitle: string;
        emptyDescription: string;
      };
    contact: {
      title: string;
      description: string;
    };
    boat: {
      title: string;
      description: string;
    };
    cruisesIndex: {
      title: string;
      description: string;
      badge: string;
      heading: string;
      introLead: string;
      introBody: string;
      introTail: string;
      emptyTitle: string;
      emptyDescription: string;
    };
    blogPost: {
      backToBlog: string;
      primaryCruise: string;
      secondaryCruises: string;
      discoverCruise: string;
      fallbackDescription: string;
    };
  };
    blocks: {
      relatedCruisesEyebrow: string;
      relatedCruisesTitle: string;
      itineraryEyebrow: string;
      itineraryTitle: string;
      bookingEyebrow: string;
    bookingTitle: string;
    bookingProviderPrefix: string;
    bookingFallbackDescription: string;
    bookingFallbackCta: string;
    reviewsEyebrow: string;
    reviewsTitle: string;
      reviewsFallbackDescription: string;
      reviewsLinkLabel: string;
      whyUsTitle: string;
    heroEyebrow: string;
    discoverCta: string;
    videoPlayLabel: string;
    videoPosterAlt: string;
    videoFrameTitle: string;
  };
}

const siteCopy: Record<Locale, SiteCopy> = {
  fr: {
    shell: {
      mobileMenuLabel: 'Ouvrir le menu',
      navigationLabel: 'Navigation',
      footerNavigationLabel: 'Navigation footer',
      defaultFooterText: 'Croisieres privees et experiences lagon en Polynesie francaise.',
      defaultDescription: 'Croisieres privees et experiences lagon en Polynesie francaise avec Tahiti Guest Boat.',
    },
    pages: {
      home: {
        title: 'Tahiti Guest Boat | Croisière en Polynésie',
        description: `L'esprit et le charme d'une belle maison d'hôtes, version croisière en Polynésie.`,
      },
      blogIndex: {
        title: 'Notre blog | Tahiti Guest Boat',
        description: 'Articles, conseils et inspirations pour préparer une croisiere en Polynesie avec Tahiti Guest Boat.',
        badge: 'Notre blog',
        heading: 'Conseils et inspirations pour naviguer en Polynésie',
        intro: 'Retrouvez les derniers articles de Tahiti Guest Boat pour préparer votre expérience dans les lagons.',
        readArticle: "Lire l'article",
        emptyTitle: 'Aucun article publié pour le moment',
        emptyDescription: 'Les articles ajoutés dans Sanity Studio apparaîtront ici après publication et rebuild du site.',
      },
      contact: {
        title: 'Contact | Tahiti Guest Boat',
        description: 'Contactez Tahiti Guest Boat pour préparer une croisière en Polynésie française.',
      },
      boat: {
        title: 'Notre bateau | Tahiti Guest Boat',
        description: 'Découvrez notre bateau, son confort et l’expérience à bord avec Tahiti Guest Boat.',
      },
      cruisesIndex: {
        title: 'Nos croisières | Tahiti Guest Boat',
        description: 'Des croisières privées en catamaran en Polynésie, pensées sur mesure selon vos envies, votre rythme et vos escales.',
        badge: 'Nos croisières',
        heading: 'Les croisières en catamaran de Tahiti Guest Boat',
        introLead: '100% personnalisées',
        introBody:
          "Chaque croisière est une aventure unique, pensée sur mesure selon vos envies. Ici, pas d'itinéraires figés ni de programmes rigides : vous choisissez le rythme, les escales et les expériences qui vous ressemblent.",
        introTail:
          'Pour vous inspirer, découvrez ci-dessous quelques exemples d’expériences à vivre en mer. Mais souvenez-vous, la plus belle croisière sera celle que nous créerons ensemble !',
        emptyTitle: 'Les inspirations de croisière arrivent bientôt',
        emptyDescription:
          'Les pages ajoutées dans Sanity Studio apparaîtront ici après publication et rebuild du site.',
      },
      blogPost: {
        backToBlog: 'Retour au blog',
        primaryCruise: 'Croisière principale',
        secondaryCruises: 'Croisières secondaires',
        discoverCruise: 'Découvrir cette croisière',
        fallbackDescription: 'Article du blog Tahiti Guest Boat.',
      },
    },
    blocks: {
      relatedCruisesEyebrow: 'À découvrir aussi',
      relatedCruisesTitle: 'Autres inspirations de croisière',
      itineraryEyebrow: 'Itinéraire indicatif',
      itineraryTitle: 'Itinéraire indicatif',
      bookingEyebrow: 'Réservation',
      bookingTitle: 'Préparer votre croisière',
      bookingProviderPrefix: 'Module',
      bookingFallbackDescription:
        'Le module de réservation sera disponible prochainement. Vous pouvez déjà nous écrire pour construire votre croisière.',
      bookingFallbackCta: 'Nous contacter',
      reviewsEyebrow: 'Avis voyageurs',
      reviewsTitle: 'Ils ont vécu l’expérience',
      reviewsFallbackDescription: 'Les avis voyageurs seront affichés ici prochainement.',
      reviewsLinkLabel: 'Voir l’avis',
      whyUsTitle: 'Pourquoi naviguer avec Tahiti Guest Boat ?',
      heroEyebrow: 'Nos croisières',
      discoverCta: 'Découvrir',
      videoPlayLabel: 'Lire la vidéo YouTube',
      videoPosterAlt: 'Aperçu de la vidéo YouTube',
      videoFrameTitle: 'Lecteur vidéo YouTube',
    },
  },
  en: {
    shell: {
      mobileMenuLabel: 'Open menu',
      navigationLabel: 'Navigation',
      footerNavigationLabel: 'Footer navigation',
      defaultFooterText: 'Private cruises and lagoon experiences in French Polynesia.',
      defaultDescription: 'Private cruises and lagoon experiences in French Polynesia with Tahiti Guest Boat.',
    },
    pages: {
      home: {
        title: 'Tahiti Guest Boat | Polynesia Cruise',
        description: 'The spirit and charm of a guest house, reimagined as a cruise in Polynesia.',
      },
      blogIndex: {
        title: 'Our blog | Tahiti Guest Boat',
        description: 'Articles, tips, and inspiration to plan a cruise in Polynesia with Tahiti Guest Boat.',
        badge: 'Our blog',
        heading: 'Tips and inspiration for sailing in Polynesia',
        intro: 'Find the latest Tahiti Guest Boat articles to prepare your experience in the lagoons.',
        readArticle: 'Read article',
        emptyTitle: 'No published articles yet',
        emptyDescription: 'Articles added in Sanity Studio will appear here after publication and a site rebuild.',
      },
      contact: {
        title: 'Contact | Tahiti Guest Boat',
        description: 'Contact Tahiti Guest Boat to plan a cruise in French Polynesia.',
      },
      boat: {
        title: 'Our boat | Tahiti Guest Boat',
        description: 'Discover our boat, its comfort, and the onboard experience with Tahiti Guest Boat.',
      },
      cruisesIndex: {
        title: 'Our cruises | Tahiti Guest Boat',
        description: 'Private catamaran cruises in Polynesia, tailored to your wishes, pace, and stops.',
        badge: 'Our cruises',
        heading: 'Tahiti Guest Boat catamaran cruises',
        introLead: '100% tailored',
        introBody:
          'Every cruise is a unique adventure, tailored to your wishes. There are no fixed itineraries or rigid programs: you choose the pace, the stops, and the experiences that feel like you.',
        introTail:
          'To inspire you, explore a few examples of experiences to enjoy at sea below. But remember, the most beautiful cruise will be the one we create together!',
        emptyTitle: 'Cruise inspiration pages are coming soon',
        emptyDescription:
          'Pages added in Sanity Studio will appear here after publication and a site rebuild.',
      },
      blogPost: {
        backToBlog: 'Back to blog',
        primaryCruise: 'Primary cruise',
        secondaryCruises: 'Secondary cruises',
        discoverCruise: 'Discover this cruise',
        fallbackDescription: 'Tahiti Guest Boat blog article.',
      },
    },
    blocks: {
      relatedCruisesEyebrow: 'Also worth discovering',
      relatedCruisesTitle: 'More cruise inspiration',
      itineraryEyebrow: 'Indicative itinerary',
      itineraryTitle: 'Indicative itinerary',
      bookingEyebrow: 'Booking',
      bookingTitle: 'Plan your cruise',
      bookingProviderPrefix: 'Module',
      bookingFallbackDescription:
        'The booking module will be available soon. You can already write to us to build your cruise.',
      bookingFallbackCta: 'Contact us',
      reviewsEyebrow: 'Traveler reviews',
      reviewsTitle: 'They lived the experience',
      reviewsFallbackDescription: 'Traveler reviews will appear here soon.',
      reviewsLinkLabel: 'View review',
      whyUsTitle: 'Why sail with Tahiti Guest Boat?',
      heroEyebrow: 'Our cruises',
      discoverCta: 'Discover',
      videoPlayLabel: 'Play YouTube video',
      videoPosterAlt: 'YouTube video preview',
      videoFrameTitle: 'YouTube video player',
    },
  },
};

export function getSiteCopy(locale: Locale = defaultLocale) {
  return siteCopy[locale];
}
