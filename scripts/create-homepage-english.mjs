import {getCliClient} from 'sanity/cli'

const SOURCE_ID = 'f512860b-c337-4a81-b057-a93acdc2c961'
const ENGLISH_ID = 'homePage-en'
const API_VERSION = '2026-05-27'

const client = getCliClient({apiVersion: API_VERSION, withUserToken: true})

function replacePortableTextText(blocks, texts) {
  let index = 0

  return blocks.map((block) => ({
    ...block,
    children: block.children?.map((child) => {
      if (typeof child.text !== 'string') return child

      const text = texts[index] ?? child.text
      index += 1
      return {...child, text}
    }),
  }))
}

function referenceValue(key, id) {
  return {
    _key: key,
    _type: 'internationalizedArrayReferenceValue',
    value: {_type: 'reference', _ref: id},
    language: key,
  }
}

function translatePage(source) {
  const page = structuredClone(source)
  const blocks = Object.fromEntries(page.pageBuilder.map((block) => [block._key, block]))

  delete page._createdAt
  delete page._updatedAt
  delete page._rev
  delete page._system
  delete page.locale
  delete page.translationGroup
  page._id = ENGLISH_ID
  page._type = 'homePage'
  page.language = 'en'
  page.seoTitle = 'Tahiti Guest Boat | Polynesian sailing cruises'
  page.seoDescription =
    'The spirit and charm of a beautiful guest house, experienced as a private sailing cruise in Polynesia.'
  page.seo = {...page.seo, indexable: true}

  const hero = blocks.c37d40bfc71b
  hero.title = 'The spirit and charm of a beautiful guest house, experienced as a Polynesian sailing cruise'
  hero.body =
    'For those who dream of discovering or rediscovering the most beautiful sailing grounds on the planet; who want to enjoy the extraordinary beauty of lagoons and atolls at their own pace; who dream of relaxing, snorkelling, sunbathing and swimming in turquoise waters; kayaking, kitesurfing or wing foiling; a sunset aperitif and meals inspired by Tahiti… For those who want to experience Polynesian hospitality, open up to the culture and let conviviality and sharing make the journey unforgettable.'
  hero.keywords = ['Sharing', 'Leisure', 'Polynesia']
  hero.primaryCtaLabel = 'Talk to us'
  hero.secondaryCtaLabel = 'Discover the experience'

  const gallery = blocks['40e3633c2e80']
  ;[
    [
      'A reef shark underwater and Namaka at sunset in the Tuamotu',
      'Namaka seen from the mast',
      'Namaka under sail',
      'View of Maupiti',
      'A group at the Marquesas arts festival',
    ],
    [
      'Sunset in Tahiti',
      'Beach in the village of Kauehi',
      'A long beach in the Tuamotu',
      'Bay seen from the heights in the Marquesas',
      'A father and his children cycling in Kauehi',
    ],
    [
      'Kitesurfing at sunset in Maupiti',
      'Dolphins playing with Namaka\'s bow',
      'Fish underwater',
      'Spearfishing in the Tuamotu',
      'Jérôme wing foiling',
    ],
  ].forEach((alts, rowIndex) => {
    gallery[`row${rowIndex + 1}`].forEach((image, imageIndex) => {
      image.alt = alts[imageIndex]
    })
  })

  const video = blocks['834b136774da']
  video.title = replacePortableTextText(video.title, ['Welcome', ', aboard ', 'Na Maka, our catamaran'])
  video.body = replacePortableTextText(video.body, [
    'This elegant ',
    '15.5-metre catamaran',
    ' combines excellent sailing qualities, comfort and generous, welcoming living spaces.',
    'Our boat welcomes',
    ' up to ',
    '5 guests',
    ' (4 adults and 1 child), so we can give special attention to every detail that makes a cruise successful: a pace adapted to your wishes, varied activities and carefully prepared meals…',
  ])
  video.ctaLabel = 'Discover Na Maka'

  const hosts = blocks['7a7e5f46079e']
  hosts.title = replacePortableTextText(hosts.title, ['A word from your hosts,\n', 'Jérôme', ' & ', 'Nathalie'])
  hosts.body = replacePortableTextText(hosts.body, [
    '“After reaching Tahiti by sea and exploring these Polynesian archipelagos as a family for several years, each one more beautiful than the last, we were also won over by the warmth and kindness of our Polynesian friends. We dropped anchor in the Fenua.\n',
    'Since then, for a few weeks each year, we have shared our passion with guests.”',
  ])
  hosts.image.alt = 'The Na Maka crew in Polynesia'
  hosts.primaryCtaLabel = 'Discover their boat'
  hosts.secondaryCtaLabel = 'Discover their journey'

  const inspiration = blocks['c93d22e96a1c']
  inspiration.headingPrefix = 'A few cruise ideas'
  inspiration.headingHighlight = 'to inspire you'
  inspiration.subtitle = 'just to get you dreaming…'
  inspiration.cards[0].title = 'The Leeward Islands'
  inspiration.cards[0].description =
    'Glide across Bora Bora’s legendary lagoon, taste the vanilla of Taha’a (and its rum), and swim with Maupiti’s manta rays.'
  inspiration.cards[0].image.alt = 'The Leeward Islands'
  inspiration.cards[1].title = 'Tuamotu'
  inspiration.cards[1].description =
    'A cruise to the end of the world, through these unique atolls. Fish, discover kaveu crab or learn about copra.'
  inspiration.cards[1].image.alt = 'A remote anchorage in Kauehi, Tuamotu'
  inspiration.cards[2].title = 'Marquesas'
  inspiration.cards[2].description =
    'Jacques Brel made these islands his home. Discover how their wild beauty and spectacular mana captivated him.'
  inspiration.cards[2].image.alt = 'A dramatic bay in the Marquesas'
  inspiration.cards.forEach((card) => {
    card.linkLabel = 'Discover'
  })

  const journey = blocks.bee8d21e61cb
  journey.title = replacePortableTextText(journey.title, ['Your journey is unique,', 'make it your own'])
  journey.body = replacePortableTextText(journey.body, [
    'As a couple, a family or a group of friends, in the Leeward Islands, the Tuamotu or the Marquesas, ',
    'every itinerary is personalised.',
    'Your Polynesian cruise begins the moment you start imagining it.\n',
    'Treat yourself and let’s talk about it.',
  ])
  journey.image.alt = 'Namaka at sea, setting off on an adventure'
  journey.primaryCtaLabel = 'Contact us'

  const practical = blocks['96ddc5faebe9']
  practical.sectionTitle = 'Practical information'
  practical.leftColumn.title = 'Contact'
  practical.leftColumn.body = replacePortableTextText(practical.leftColumn.body, [
    'Ideally, let’s talk directly,',
    '\nPhone or WhatsApp: ',
    '+689 89 34 14 34',
    '\nEmail: tahitiguestboat@gmail.com',
    '\nWe speak French, English and Spanish.',
    'Because of the time difference (UTC-10), we recommend contacting us between:',
    '18:00 and 21:00 if you are in Europe,',
    '12:00 and 22:00 if you are in the USA.',
  ])
  practical.rightColumn.title = 'Rates'
  practical.rightColumn.body = replacePortableTextText(practical.rightColumn.body, [
    'From ',
    '€250 per person per day',
    ', based on four guests.',
    'We will prepare a precise quote after discussing the journey you would like to experience.',
    'All-inclusive: boat charter, skipper, host, meals, drinks and activities, excluding alcohol and activities provided by external operators.',
  ])

  const faq = blocks['0b796fcb329e']
  faq.title = 'Frequently asked questions'
  faq.description =
    'Frequently asked questions, ranked by popularity. If you cannot find your answer, please get in touch.'
  faq.ctaLabel = 'Contact us'
  faq.ctaHref = '#contact'

  const faqTranslations = [
    {
      question: 'What experience does Tahiti Guest Boat offer?',
      answer: [
        'Tahiti Guest Boat offers private cruises in Polynesia aboard a catamaran, allowing you to discover lagoons and atolls at your own pace while enjoying a wide range of activities and an authentic cultural experience.',
      ],
    },
    {
      question: 'How many guests can the Namaka catamaran accommodate?',
      answer: [
        'Namaka can accommodate up to 5 guests, usually 4 adults and 1 child, allowing us to offer personalised attention and a truly successful cruise experience.',
      ],
    },
    {
      question: 'How much does a Tahiti Guest Boat cruise cost?',
      answer: [
        'Prices start at €250 per person per day, based on 4 guests. This includes the boat, skipper, host, meals, non-alcoholic drinks and all included activities.',
        'Activities provided by external operators, such as scuba diving or restaurants, are charged separately. We can help you select them.',
        'Every rate is tailored to the cruise (duration and destination) and to your needs and wishes. Contact us on WhatsApp for more information.',
      ],
    },
    {
      question: 'Which activities are available during the cruise?',
      answer: [
        'Here is a non-exhaustive list of activities included during the cruise:',
        'Kayaking',
        'Walks and hikes',
        'Snorkelling',
        'Kitesurfing',
        'Wing foiling',
        'Spearfishing',
        'Line fishing',
        'Sailing',
        'Surfing',
        'Bodyboarding',
        'These activities take place in nature and cannot be guaranteed: they depend on everyone’s interests and fitness, as well as weather conditions.',
      ],
    },
    {
      question: 'What meals are served during the cruise?',
      answer: [
        'Meals depend on the provisions available aboard Nā Maka and on local shops. Access to food varies between archipelagos: the Marquesas and the Tuamotu do not offer the same products. In Polynesia, we generally eat plenty of fish.',
        'We can plan and adapt menus to your preferences; just let us know.',
      ],
    },
    {
      question: 'How can I contact Tahiti Guest Boat to book or ask for more information?',
      answer: [
        'You can contact Tahiti Guest Boat by phone or WhatsApp at ',
        '+689 89 34 14 34',
        ', or by email at ',
        'tahitiguestboat@gmail.com',
        '. We speak French, English and Spanish.',
      ],
    },
    {
      question: 'Which destinations are available for the cruises?',
      answer: [
        'Destinations include the Leeward Islands (Bora Bora, Taha’a and Maupiti), the Tuamotu and the Marquesas. Each itinerary is tailored to your preferences.',
      ],
    },
    {
      question: 'When is the best time to book a Polynesian cruise?',
      answer: [
        'The best time to book depends on your personal preferences, but cruises are available for several weeks each year, throughout the year. We recommend contacting Tahiti Guest Boat to discuss availability and tailor your journey.',
      ],
    },
    {
      question: 'What experience do hosts Jérôme and Nathalie have?',
      answer: [
        'Jérôme and Nathalie spent several years sailing with their family through the Polynesian archipelagos. They are passionate about the beauty of the islands and the kindness of the local people, and share that passion with guests on every cruise.',
      ],
    },
    {
      question: 'What are the recommended contact hours given the time difference?',
      answer: [
        'Because of the time difference (UTC-10), we recommend contacting Tahiti Guest Boat between 18:00 and 21:00 if you are in Europe, and between 12:00 and 22:00 if you are in the USA.',
      ],
    },
    {
      question: 'Can I customise my Tahiti Guest Boat journey?',
      answer: [
        'Yes. Every cruise itinerary is personalised around your wishes and preferences, whether you are travelling as a couple, a family or a group of friends.',
      ],
    },
  ]

  faq.items.forEach((item, index) => {
    const translation = faqTranslations[index]
    item.question = translation.question
    item.answer = replacePortableTextText(item.answer, translation.answer)
  })

  return page
}

const source = await client.fetch('*[_id == $id][0]', {id: SOURCE_ID})
if (!source) throw new Error(`French homepage ${SOURCE_ID} was not found`)

const existing = await client.fetch(
  '*[_id in [$englishId, $draftEnglishId] || (_type == "translation.metadata" && references($sourceId))]{_id, _type, translations}',
  {englishId: ENGLISH_ID, draftEnglishId: `drafts.${ENGLISH_ID}`, sourceId: SOURCE_ID},
)

if (existing.some((document) => document._id === ENGLISH_ID || document._id === `drafts.${ENGLISH_ID}`)) {
  throw new Error(`English homepage already exists; refusing to overwrite it (${ENGLISH_ID})`)
}

const metadata = existing.find((document) => document._type === 'translation.metadata')
const englishPage = translatePage(source)
const transaction = client.transaction().patch(SOURCE_ID, (patch) => patch.set({language: 'fr'}))

transaction.create(englishPage)

if (metadata) {
  const translations = metadata.translations ?? []
  const hasFrench = translations.some((translation) => translation.value?._ref === SOURCE_ID)
  const nextTranslations = hasFrench
    ? translations
    : [...translations, referenceValue('fr', SOURCE_ID)]
  nextTranslations.push(referenceValue('en', ENGLISH_ID))
  transaction.patch(metadata._id, (patch) => patch.set({translations: nextTranslations}))
} else {
  transaction.create({
    _type: 'translation.metadata',
    schemaTypes: ['homePage'],
    translations: [referenceValue('fr', SOURCE_ID), referenceValue('en', ENGLISH_ID)],
  })
}

const result = await transaction.commit()
const created = result.results?.find((item) => item.operation === 'create' && item.documentId === ENGLISH_ID)

console.log(
  JSON.stringify(
    {
      status: 'created-and-published',
      englishHomepage: created?.documentId ?? ENGLISH_ID,
      source: SOURCE_ID,
      metadata: metadata?._id ?? 'created',
      reusedAssets: true,
    },
    null,
    2,
  ),
)
