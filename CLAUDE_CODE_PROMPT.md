# Prompt for Claude Code (paste this when you open the project folder)

You are working in a folder that contains `index.html`, a finished single-file demo of our college techfest website, "TECHFEST '27", with the theme **Paradox**. Read `index.html` and `README.md` fully before changing anything. The demo is the source of truth for design, copy, and behaviour.

## Goal
Turn this demo into a production-ready, deployable site at **https://techfestui.vercel.app** without losing any of the paradox interactions. Keep the look exactly as it is: dark stage, Instrument Serif italic display, Space Grotesk UI, JetBrains Mono labels, one accent colour. Do not redesign it.

## Steps
1. **Set up the project.** Create a Vite + vanilla JS project (or React if you have a strong reason, and say why first). Split `index.html` into `index.html`, `src/styles/*.css` (one file per section) and `src/js/*.js` (one module per section: hero, marquee, mirror, events, schedule, zeno, droste, sponsors, register, faq, footer, loop, stairs, settings, cursor). Move all placeholder data into `src/data/*.json`.
2. **Upgrade the motion, keeping each effect the same.**
   - Add **Lenis** (smooth scroll) and **GSAP + ScrollTrigger**. Re-implement the scroll-driven parts with ScrollTrigger: the mirror columns drifting in opposite directions, the pinned horizontal schedule, the Zeno counter, the footer grain dissolve, and the Ouroboros loop back to the hero. Make sure the loop jump uses `lenis.scrollTo(0 + offset, { immediate: true })` so it stays seamless.
   - Use GSAP **SplitText** (or the existing splitter) for the hero and heading reveals.
   - Use GSAP **Flip** for the Hilbert's hotel room shuffle and the event filter.
   - Keep `prefers-reduced-motion` support: no smooth scroll, no pinning, no reveals.
3. **Make registration real.** Wire the form to a Google Sheet through Google Apps Script (or Firebase if I say so). Validate inputs, show success and error states, and keep the "everyone moves up one room" animation after a successful submit.
4. **Pages.** Add an `/events/:id` detail page for each event (same modal content, shareable URL) and a simple `/team` page. Use the same header and footer.
5. **Quality bar.**
   - Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on desktop and mobile.
   - No horizontal scroll at 360px. Test 360, 390, 768, 1280 and 1440 wide.
   - Every interactive element is keyboard reachable, with a visible focus state.
   - Add Open Graph tags and a 1200×630 share image built from the Penrose triangle.
6. **Deploy.** Add `vercel.json` if needed, then deploy with `npx vercel --prod` under the project name `techfestui`. If that name is taken, tell me before picking another one.

## Rules
- Ask me before changing any copy, colours or section order.
- Keep the L1–L12 tags on each section. They map to our design canvas.
- After each step, run the dev server, check it in the browser at desktop and phone widths, and tell me what changed in 2–3 lines.
