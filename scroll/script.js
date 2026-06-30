gsap.registerPlugin(ScrollTrigger);

window.addEventListener('load', () => {

  // ── Intro text: fade in on load ─────────────────────
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('.intro h1', { opacity: 1, y: 0, duration: 1.2 })
    .to('.intro p',  { opacity: 1, y: 0, duration: 1.2 }, '-=0.7');

  // Start hero-bg zoomed out so more scene is visible
  gsap.set('.hero-bg', { scale: 0.82, transformOrigin: 'center center' });

  // ── Pinned zoom timeline ─────────────────────────────
  gsap.timeline({
    scrollTrigger: {
      trigger: '.pin-wrap',
      start: 'top top',
      end: '+=180%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
    }
  })
  .to('.intro',           { opacity: 0, duration: 0.2 },                         0)
  .to('.img-overlay img', { scale: 2.8, z: 380, transformOrigin: 'center center', ease: 'none', duration: 1 }, 0)
  .to('.hero-bg',         { scale: 1.6, transformOrigin: 'center center',          ease: 'none', duration: 1 }, 0)
  .to('.img-overlay img', { opacity: 0, duration: 0.3 },                          0.68)
  .to('.hero-bg',         { opacity: 0, duration: 0.35 },                         0.82);

  // ── Text reveal after pin releases ───────────────────
  ScrollTrigger.create({
    trigger: '.gradient-blue',
    start: 'top 72%',
    once: true,
    onEnter() {
      gsap.to('.text-block p', {
        opacity: 1, y: 0,
        duration: 0.9,
        stagger: 0.22,
        ease: 'power2.out',
      });
    }
  });

});
