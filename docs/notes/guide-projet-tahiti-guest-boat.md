# Guide Projet — Refonte Tahiti Guest Boat avec Astro

## Objectif du projet

Refondre le site WordPress actuel de Tahiti Guest Boat afin de :

- améliorer drastiquement les performances
- optimiser le SEO
- simplifier la maintenance
- moderniser l’architecture technique
- conserver et améliorer le contenu existant

---

# Stack technique recommandée

## Frontend
- Astro
- TailwindCSS
- TypeScript

## CMS
- Sanity

## Hébergement
- Vercel

## Média
- Vimeo (vidéos)
- Sanity CDN (images)

---

# Architecture du projet

```txt
Frontend Astro
↓
Sanity CMS
↓
Vercel CDN
↓
Optimisation images + SEO
```

---

# Structure du projet

```txt
src/
├── components/
│   ├── ui/
│   ├── cards/
│   ├── sections/
│   ├── navigation/
│   └── layouts/
│
├── pages/
├── layouts/
├── styles/
├── lib/
└── content/
```

---

# Étape 1 — Audit du site actuel

## Objectifs
- identifier les pages importantes
- conserver le SEO existant
- préparer la migration

## Actions
- crawler le site avec Screaming Frog
- récupérer :
  - URLs
  - titles
  - meta descriptions
  - H1/H2
  - images
- analyser les pages qui rankent

---

# Étape 2 — Export du contenu WordPress

## Utiliser l’API WordPress

```txt
/wp-json/wp/v2/
```

## Contenu à récupérer
- pages
- articles
- images
- catégories
- médias

---

# Étape 3 — Création du projet Astro

## Initialisation

```bash
npm create astro@latest
```

## Installer
- Tailwind
- ESLint
- Prettier

---

# Étape 4 — Création du Design System

## Définir
- couleurs
- typographie
- spacing
- containers
- boutons
- cards

---

# Étape 5 — Architecture des composants

## Structure recommandée

```txt
components/
├── ui/
├── cards/
├── sections/
└── navigation/
```

---

# UI Components

Petits composants réutilisables :

```txt
Button
Container
SectionTitle
Badge
```

---

# Cards

```txt
CruiseCard
BlogCard
ReviewCard
```

---

# Sections

```txt
Hero
Gallery
Testimonials
FAQ
CTA
```

---

# Étape 6 — Reconstruction de la Homepage

## Workflow

### 1. Découper la homepage en sections

Exemple :

```txt
Hero
Croisières
Le bateau
Galerie
Avis
FAQ
CTA
```

---

### 2. Créer chaque section

Exemple :

```txt
components/sections/Hero.astro
```

---

### 3. Assembler dans la homepage

```astro
---
import Hero from '../components/sections/Hero.astro'
import Gallery from '../components/sections/Gallery.astro'
---

<Layout>

  <Hero />
  <Gallery />

</Layout>
```

---

# Étape 7 — Intégration Sanity

## Collections recommandées

### Pages

```txt
home
bateau
contact
about
```

---

### Croisières

```txt
title
slug
description
gallery
seo
```

---

### Blog

```txt
title
slug
content
coverImage
seo
```

---

# Étape 8 — SEO

## À implémenter

- sitemap.xml
- robots.txt
- canonical URLs
- hreflang FR/EN
- Open Graph
- JSON-LD
- metadata dynamiques

---

# Étape 9 — Performance

## Optimisations importantes

### Images
- WebP
- AVIF
- lazy loading
- responsive images

### JavaScript
- hydration minimale
- éviter les librairies lourdes

### Fonts
- hébergement local
- preload

---

# Étape 10 — Multilingue

## Structure recommandée

```txt
/fr/
/en/
```

## Exemple

```txt
/fr/croisieres/moorea-sunset
/en/cruises/moorea-sunset
```

---

# Étape 11 — Déploiement

## Workflow

```txt
GitHub
→ Vercel
→ Preview Deployments
→ Production
```

---

# Étape 12 — Redirections SEO

## Important

Conserver les URLs existantes si possible.

Sinon :
- mettre en place des redirections 301

---

# Workflow global recommandé

## Phase 1
Audit SEO

## Phase 2
Export contenu WordPress

## Phase 3
Création Design System

## Phase 4
Création composants Astro

## Phase 5
Reconstruction homepage

## Phase 6
Templates croisières/blog

## Phase 7
Connexion Sanity

## Phase 8
Optimisations SEO/performance

## Phase 9
Deploy production

---

# Philosophie du projet

## Ne pas reproduire Elementor

Le but est de :
- reconstruire proprement
- simplifier l’architecture
- améliorer la performance
- rendre le site maintenable

---

# Résultat attendu

## Objectifs finaux

- Lighthouse mobile 95+
- excellent SEO
- maintenance simple
- CMS moderne
- site ultra rapide
- expérience premium
