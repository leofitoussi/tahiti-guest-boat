import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

describe('English contact conversion journey', () => {
  beforeAll(() => {
    execFileSync('npx', ['astro', 'build'], { stdio: 'ignore', timeout: 600000 });
  }, 600000);

  it('publishes an English noindex confirmation page with an English home link', async () => {
    const html = await readFile('dist/en/thank-you/index.html', 'utf8');

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).toContain('Thank you');
    expect(html).toContain('href="/en/"');
  });

  it('publishes reciprocal SEO metadata for the French and English contact pages', async () => {
    const [frenchHtml, englishHtml] = await Promise.all([
      readFile('dist/contact/index.html', 'utf8'),
      readFile('dist/en/contact/index.html', 'utf8'),
    ]);

    expect(frenchHtml).toContain('<html lang="fr">');
    expect(frenchHtml).toContain(
      '<link rel="canonical" href="https://tahitiguestboat.com/contact/"',
    );
    expect(frenchHtml).toContain(
      '<link rel="alternate" hreflang="en" href="https://tahitiguestboat.com/en/contact/"',
    );

    expect(englishHtml).toContain('<html lang="en">');
    expect(englishHtml).toContain(
      '<link rel="canonical" href="https://tahitiguestboat.com/en/contact/"',
    );
    expect(englishHtml).toContain(
      '<link rel="alternate" hreflang="fr" href="https://tahitiguestboat.com/contact/"',
    );
    expect(englishHtml).toContain('<meta property="og:locale" content="en_US"');
  });

  it('keeps the English contact journey localized while preserving contact channels', async () => {
    const html = await readFile('dist/en/contact/index.html', 'utf8');

    expect(html).toContain('Let’s talk about your cruise in French Polynesia');
    expect(html).toContain('Would you rather speak with us?');
    expect(html).toContain('href="/en/our-boat"');
    expect(html).toContain('href="/en/cruises"');
    expect(html).toContain('href="/en/blog"');
    expect(html).toContain('href="mailto:tahitiguestboat@gmail.com"');
    expect(html).toContain('href="tel:+68989341434"');
    expect(html).not.toContain('Informations pratiques et contact');
    expect(html).not.toContain('Nous contacter');
  });

  it('keeps the confirmation routes out of every generated sitemap', async () => {
    const sitemapFiles = await Promise.all([
      readFile('dist/page-sitemap.xml', 'utf8'),
      readFile('dist/post-sitemap.xml', 'utf8'),
      readFile('dist/sitemap-cruises.xml', 'utf8'),
    ]);
    const sitemaps = sitemapFiles.join('\n');

    expect(sitemaps).not.toContain('/merci/');
    expect(sitemaps).not.toContain('/en/thank-you/');
  });

  it('gives French visitors an immediately available cruise quote form', async () => {
    const html = await readFile('dist/contact/index.html', 'utf8');

    expect(html).toContain('<h1');
    expect(html).toContain('Parlons de votre croisière en Polynésie');
    expect(html).toContain('id="demande-de-devis"');
    expect(html).toContain('data-tally-form-id="nPrj8V"');
    expect(html).toContain('dynamicHeight=1');
  });

  it('explains the private cruise offer before the quote form', async () => {
    const html = await readFile('dist/contact/index.html', 'utf8');

    expect(html).toContain('Croisière 100 % sur mesure');
    expect(html).toContain('Jusqu’à 5 personnes');
    expect(html).toContain('À partir de 250 € par personne et par jour');
    expect(html).toContain('5/5 sur Google avec 26 avis');
  });

  it('offers WhatsApp and email in a dedicated contact section after the form', async () => {
    const html = await readFile('dist/contact/index.html', 'utf8');

    expect(html).toContain('href="https://wa.me/68989341434"');
    expect(html).toContain('href="mailto:tahitiguestboat@gmail.com"');
    expect(html).not.toContain('data-contact-action="phone"');
    expect(html.indexOf('data-tally-form-id="nPrj8V"')).toBeLessThan(html.indexOf('https://wa.me/68989341434'));
    expect(html).toContain('contact-channels');
  });

  it('sends homepage and header conversion calls to the quote form', async () => {
    const [homeHtml, contactHtml, englishHomeHtml, englishContactHtml] = await Promise.all([
      readFile('dist/index.html', 'utf8'),
      readFile('dist/contact/index.html', 'utf8'),
      readFile('dist/en/index.html', 'utf8'),
      readFile('dist/en/contact/index.html', 'utf8'),
    ]);

    expect(homeHtml).toMatch(/href="\/contact\/#demande-de-devis"[^>]*>\s*Discutez avec nous\s*<\/a>/);
    expect(contactHtml).toMatch(/href="\/contact\/#demande-de-devis"[^>]*>Réserver<\/a>/);
    expect(englishHomeHtml).toMatch(/href="\/en\/contact\/#demande-de-devis"[^>]*>\s*Talk to us\s*<\/a>/);
    expect(englishContactHtml).toMatch(/href="\/en\/contact\/#demande-de-devis"[^>]*>Book your cruise<\/a>/);
  });

  it('exposes the quote funnel to the existing analytics tracker', async () => {
    const html = await readFile('dist/contact/index.html', 'utf8');

    expect(html).toContain('data-tally-analytics-scope="contact"');
    expect(html).toContain('data-umami-event="contact_whatsapp_clicked"');
    expect(html).toContain('data-umami-event="contact_email_clicked"');
  });

  it('places the three next steps with the initial project guidance and keeps inclusions in the FAQ', async () => {
    const html = await readFile('dist/contact/index.html', 'utf8');

    expect(html).toContain('Le tarif comprend le bateau, le skipper, l’hôtesse, les repas, les boissons et les activités à bord');
    expect(html).toContain('01</span><strong');
    expect(html).toContain('Vous nous transmettez votre projet');
    expect(html).toContain('Nous échangeons avec vous');
    expect(html).toContain('Nous vous envoyons une proposition personnalisée');
    expect(html).toContain('Questions fréquentes');
    expect(html.indexOf('Une première idée suffit')).toBeLessThan(html.indexOf('01</span><strong'));
    expect(html.indexOf('01</span><strong')).toBeLessThan(html.indexOf('Parlez-nous de votre projet'));
  });

  it('keeps the first-visit cookie choices compact on mobile', async () => {
    const banner = await readFile('src/components/consent/CookieConsentBanner.astro', 'utf8');

    expect(banner).toContain('mt-4 grid grid-cols-3 gap-2');
  });
});
