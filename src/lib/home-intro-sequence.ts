const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const easeOut = (value: number) => 1 - (1 - value) ** 3;
const ENTRANCE_STEPS = 0.65;

/** Reveal the opening phrase first, then relay the remaining phrases continuously. */
export function getHomeIntroFrame(progress: number, count: number) {
  const position = clamp(progress) * (count - 1 + ENTRANCE_STEPS);
  const arrival = clamp(position / ENTRANCE_STEPS);
  const relay = clamp(position - ENTRANCE_STEPS, 0, count - 1);
  const active = Math.min(count - 2, Math.floor(relay));
  return { active, handover: relay - active, arrival };
}

export function initHomeIntroSequences() {
  document.querySelectorAll<HTMLElement>('[data-home-intro-sequence]').forEach((sequence) => {
    if (sequence.dataset.initialized) return;
    const section = sequence.closest<HTMLElement>('.home-intro-track');
    const openingTitle = section?.previousElementSibling?.querySelector<HTMLElement>('.home-hero-centered__title');
    const panel = sequence;
    const actions = sequence.querySelector<HTMLElement>('[data-sequence-actions]');
    const phrases = Array.from(sequence.querySelectorAll<HTMLElement>('[data-sequence-phrase]'));
    if (!section || !panel || phrases.length < 2) return;
    sequence.dataset.initialized = 'true';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 767px)');
    let enabled = false;
    let frame = 0;
    let start = 0;
    let travel = 0;
    let heights: number[] = [];
    let viewportWidth = 0;
    let viewportHeight = 0;
    let onscreen = true;
    let displayedProgress = 0;
    let lastFrameTime = 0;

    const reset = () => {
      enabled = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      section.classList.remove('home-intro-track--enhanced');
      for (const phrase of phrases) phrase.removeAttribute('style');
      sequence.style.removeProperty('--sequence-stage-height');
      sequence.style.removeProperty('--sequence-actions-top');
      if (actions) {
        actions.removeAttribute('style');
        actions.inert = false;
      }
      for (const name of ['--sequence-panel-height', '--sequence-travel', '--sequence-top', '--sequence-gallery-gap-reduction']) {
        section.style.removeProperty(name);
      }
    };

    const reduceGalleryGap = () => {
      // Astro can insert a module script between the section and the next block.
      const gallery = section.parentElement?.querySelector<HTMLElement>('#home-beta-suite .marquee-gallery');
      if (!actions || !gallery) return;
      // At the end of the sticky track, the panel's bottom meets the track's
      // bottom. Include its unused stage space and the gallery's own padding.
      const panelTail = panel.getBoundingClientRect().bottom - actions.getBoundingClientRect().bottom;
      const trackPadding = parseFloat(getComputedStyle(section).paddingBottom) || 0;
      const galleryLead = gallery.getBoundingClientRect().top - section.getBoundingClientRect().bottom;
      const gap = Math.max(0, panelTail + trackPadding + galleryLead);
      section.style.setProperty('--sequence-gallery-gap-reduction', `${gap * 0.3}px`);
    };

    const render = (now = performance.now()) => {
      frame = 0;
      if (!enabled || !onscreen || document.hidden) return;
      const target = clamp((window.scrollY - start) / travel);
      const elapsed = clamp(now - lastFrameTime, 1, 32);
      lastFrameTime = now;
      displayedProgress += (target - displayedProgress) * (1 - Math.exp(-elapsed / 60));
      if (Math.abs(target - displayedProgress) < 0.0001) displayedProgress = target;
      const { active, handover, arrival } = getHomeIntroFrame(displayedProgress, phrases.length);
      for (let index = 0; index < phrases.length; index++) {
        const phrase = phrases[index];
        let opacity = 0;
        let scale = 0.84;
        let y = 0;
        let reveal = heights[index] + 48;
        if (index === active) {
          opacity = 1 - handover;
          scale = 1;
          y = -(heights[active] + 32) * handover;
          if (active === 0) {
            opacity *= arrival;
            scale *= 0.9 + arrival * 0.1;
            y += (1 - arrival) * 16;
            reveal = (heights[index] + 48) * arrival;
          }
        } else if (index === active + 1) {
          // Both phrases move by the same distance. Their bounds remain 32px
          // apart, even for the long paragraph and when scrolling backwards.
          const preview = Math.min(1, handover * 4);
          opacity = 0.22 * preview + handover * 0.78;
          scale = 0.88 + handover * 0.12;
          y = (heights[active] + 32) * (1 - handover);
          reveal = 72 + (heights[index] + 48 - 72) * handover;
        }
        phrase.style.opacity = String(opacity);
        phrase.style.transform = `translateY(${y}px) scale(${scale})`;
        phrase.style.setProperty('--sequence-phrase-solid', `${Math.max(0, reveal - 48)}px`);
        phrase.style.setProperty('--sequence-phrase-reveal', `${reveal}px`);
        phrase.style.zIndex = index === active + 1 ? '2' : '1';
      }
      if (actions) {
        const reveal = easeOut(clamp((displayedProgress - 0.88) / 0.12));
        const finalHeight = heights.at(-1)!;
        const followLastPhrase = active === phrases.length - 2
          ? (heights[active] + 32) * (1 - handover) + finalHeight * (0.88 + handover * 0.12 - 1)
          : 0;
        actions.style.opacity = String(reveal);
        actions.style.visibility = reveal > 0 ? 'visible' : 'hidden';
        actions.style.pointerEvents = reveal > 0.95 ? 'auto' : 'none';
        actions.style.transform = `translateY(${followLastPhrase + (1 - reveal) * 8}px)`;
        actions.inert = reveal < 0.95;
      }
      // Only smooth a wheel/trackpad burst; stop requesting frames once settled.
      if (displayedProgress !== target) frame = requestAnimationFrame(render);
    };

    const requestRender = () => {
      if (enabled && onscreen && !document.hidden && !frame) frame = requestAnimationFrame(render);
    };

    const measure = () => {
      reset();
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      if (mobile.matches) return;
      if (reducedMotion.matches) {
        reduceGalleryGap();
        return;
      }

      // Measure untransformed text once, not during scrolling.
      section.classList.add('home-intro-track--enhanced');
      heights = phrases.map((phrase) => phrase.offsetHeight);
      const actionHeight = actions?.offsetHeight ?? 0;
      const actionGap = 60;
      sequence.style.setProperty('--sequence-stage-height', `${Math.max(...heights) + 96 + Math.max(92, actionHeight + actionGap)}px`);
      sequence.style.setProperty('--sequence-actions-top', `${48 + heights.at(-1)! + actionGap}px`);
      const panelHeight = panel.offsetHeight;
      if (panelHeight > viewportHeight - 16) {
        reset();
        reduceGalleryGap();
        return;
      }

      const top = Math.max(8, (viewportHeight - panelHeight) / 2);
      const stepDistance = Math.max(300, Math.min(460, viewportHeight * 0.45));
      const stickyStart = section.getBoundingClientRect().top + window.scrollY - top;
      const titleExit = openingTitle
        ? openingTitle.getBoundingClientRect().bottom + window.scrollY
        : stickyStart;
      // Reveal during the approach. The first phrase is fully readable exactly
      // when the opening title's lower edge leaves the top of the viewport.
      start = titleExit - stepDistance * ENTRANCE_STEPS;
      travel = stepDistance * (phrases.length - 1 + ENTRANCE_STEPS);
      section.style.setProperty('--sequence-panel-height', `${panelHeight}px`);
      section.style.setProperty('--sequence-travel', `${Math.max(0, start + travel - stickyStart)}px`);
      section.style.setProperty('--sequence-top', `${top}px`);
      displayedProgress = clamp((window.scrollY - start) / travel);
      lastFrameTime = performance.now();
      enabled = true;
      reduceGalleryGap();
      render();
    };

    const onResize = () => {
      // Mobile browser chrome changes height while scrolling; keep the stage stable.
      if (window.innerWidth !== viewportWidth || Math.abs(window.innerHeight - viewportHeight) > 140) measure();
    };
    const observer = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      requestRender();
    });
    observer.observe(section);
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    reducedMotion.addEventListener('change', measure);
    mobile.addEventListener('change', measure);
    document.addEventListener('visibilitychange', requestRender);
    // Hero media and fonts can settle after the module starts.
    window.addEventListener('load', measure, { once: true });
    void document.fonts.ready.then(measure);
    measure();
  });
}
