---
name: Llegó
description: Silkscreen posters in the logo's flat inks (manual de identidad) on white paper; the order (the box) is the figure of every poster.
colors:
  ink: "#124939"
  ink-teal: "#176545"
  ink-teal-dark: "#124939"
  ink-orange: "#f9b41e"
  ink-orange-dark: "#d99600"
  ink-green: "#d1e5d9"
  ink-leaf: "#e6f0ea"
  ink-sun: "#f9c764"
  paper: "#ffffff"
  paper-deep: "#fef1d8"
  paper-bright: "#ffffff"
  ink-soft: "rgba(18, 73, 57, 0.8)"
  ink-mute: "rgba(18, 73, 57, 0.7)"
  ink-line: "rgba(18, 73, 57, 0.16)"
  error-ink: "#a3301c"
  night: "#011f20"
  night-surface: "#032a2b"
typography:
  display:
    fontFamily: "'Montserrat Variable', 'Arial Black', sans-serif"
    fontSize: "clamp(62px, 9.4vw, 128px)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Montserrat Variable', 'Arial Black', sans-serif"
    fontSize: "clamp(52px, 10vw, 128px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Montserrat Variable', 'Arial Black', sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 0.95
  label:
    fontFamily: "'Montserrat Variable', 'Arial Black', sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.02em"
  ticket:
    fontFamily: "'Montserrat Variable', 'Arial Black', sans-serif"
    fontSize: "1.6rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.01em"
  lede:
    fontFamily: "'Montserrat Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(17px, 1.6vw, 20px)"
    fontWeight: 500
    lineHeight: 1.55
  body:
    fontFamily: "'Montserrat Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "'Montserrat Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
  prose:
    fontFamily: "'Montserrat Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.75
  caption:
    fontFamily: "'Montserrat Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.15
rounded:
  none: "0"
  sm: "4px"
  ticket: "6px"
  md: "8px"
  device: "40px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
  4xl: "6rem"
  gutter: "clamp(20px, 5vw, 64px)"
  section-y: "clamp(72px, 11vw, 144px)"
components:
  ticket:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ticket}"
    rounded: "{rounded.ticket}"
    padding: "10px 22px 10px 18px"
    height: "52px"
  ticket-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
  ticket-teal:
    backgroundColor: "{colors.ink-teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.ticket}"
  ticket-orange:
    backgroundColor: "{colors.ink-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
  ticket-store:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ticket}"
    rounded: "{rounded.ticket}"
    padding: "10px 26px 10px 22px"
    height: "60px"
    width: "196px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.ticket}"
    padding: "12px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.ink-teal}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
    padding: "12px 24px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-accent:
    backgroundColor: "{colors.ink-sun}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
    padding: "12px 24px"
    height: "48px"
  button-accent-hover:
    backgroundColor: "{colors.ink-orange}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.paper-bright}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  poster:
    backgroundColor: "{colors.ink-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "28px"
  card:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "28px 24px"
  navbar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "68px"
  footer:
    backgroundColor: "{colors.ink-teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
---

# Design System: Llegó

## Identidad (manual de marca, oct 2026)

El manual de identidad del logo (`MANUAL_DE_IDENTIDADLOGO.pdf`, fuera del repo) manda sobre todo lo de abajo. Lo que fija:

- **Paleta (máx. 3 a la vez en una pieza):** Little Sun Dress `#F9C764` (`--ink-sun`), Tangerine Twist `#F9B41E` (`--ink-orange`), Jade Mussel Green `#176545` (`--ink-teal`) y Country Squire `#124939` (`--ink`, el texto). Los nombres de tokens (`teal`, `orange`) se conservan por compatibilidad; los valores son los del manual. `--ink-green` y `--ink-leaf` son tintes claros del verde Jade para campos suaves (Farmacia, Mensajeros, /negocios), no colores nuevos. El fondo es blanco (`--paper`); el crema del logo antiguo queda como `--paper-deep`/`--ink-cream`.
- **Letra:** Montserrat (variable, autoalojada con `@fontsource-variable/montserrat`) para todo: titulares en 900 y mayúsculas, texto en 400 a 600. La letra del logotipo (Moon Get Heavy) no tiene licencia web y solo vive dentro de los SVG del logo.
- **Logos (`public/img`):** `logo-horizontal.svg` (verde), `logo-horizontal-blanco.svg` (sobre verde), `logo-vertical.svg`, `isotipo.svg` (la mano con la caja, verde) e `isotipo-amarillo.svg` (sobre verde). Son vectores extraídos del PDF del manual: no se redibujan a mano. `favicon.svg` es el isotipo amarillo sobre un cuadrado verde redondeado y `og-image.jpg` el logo blanco sobre verde Jade.
- **Montserrat es ancha:** los titulares de carteles estrechos se ajustan con consultas de contenedor (`container-type: inline-size` y `cqi` según el número de letras, ver `Cartelera.astro` y `Ecosistema.astro`). Comprobar siempre a 360 px.

Las secciones siguientes describen el sistema de carteles; donde dicen Big Shoulders o Figtree, léase Montserrat, y donde dicen crema o teal, los valores del manual.

## Overview

**Creative North Star: "The Poster That Arrives" (El cartel que llega)**

Llegó is printed, not rendered. Every surface is a silkscreen poster in the ICAIC tradition: cream paper as the floor, the four flat inks of the logo laid down in fields that own whole sections, and the box from the logo as the figure that crosses each poster. Headlines are condensed, uppercase and huge; running text is a calm humanist sans. The site reads as one series of posters pasted on the same wall, from the home page to the 404.

Density is low and the scale contrast is extreme: a 128px headline beside 18px running text, one action per poster. Depth comes from printing, never from lighting. A second ink is laid slightly out of register under each headline (the signature "registration"), the logo box and the phone carry a translucent offset ink pass, and illustrations are two passes of the same shape in two inks, overlapping with multiply. Halftone dot screens and a film-strip light leak are the only textures.

Motion grammar is "arrival": the two inks of a headline slide into register when the poster enters the viewport, the box slides in from the left on the first poster, tickets tilt a degree on hover, the mobile menu drops like a poster being unrolled. Every motion is gated by `prefers-reduced-motion`; with reduced motion or without JavaScript, everything is already in its resting, registered state and nothing is hidden.

The site rejects the category delivery landing: headline plus subhead plus button on a dark gradient, then a row of identical cards.

**Key Characteristics:**
- Cream paper floor with full-bleed flat ink fields (teal, orange, green, sun) that own entire sections.
- Condensed uppercase poster headlines in two inks, misregistered on purpose.
- Buttons are cinema tickets with perforated notches.
- Straight-cut paper: posters and cards are square; only tickets, inputs and devices round.
- The logo box is the recurring figure, always rotated a few degrees, always crossing something.
- Real app screenshots as the only imagery; no stock, no invented figures.

## Colors

The palette is the logo's own inks printed flat on cream paper, with deep teal-ink as the one text color.

### Primary
- **Deep Teal Ink** (ink): the text color of the whole site on light fields, the default ticket and primary button fill, the film-strip section, the navbar scroll rule and every 2px border. 13.2:1 on paper.
- **Logo Teal** (ink-teal): the cool field. Footer, "En Cuba pides." half, LlegoBusiness poster, contact box, hover fill for primary buttons, inline links, focus ring and accent line in headlines (`PrintTitle accent`). Paper on it is 5.4:1.
- **Shadow Teal** (ink-teal-dark): the under-ink of headlines printed on a teal field and the second pass of illustrations on teal posters. Never text.

### Secondary
- **Logo Orange** (ink-orange): the warm field and the brand's loudest voice. The hero poster, the "Desde fuera pagas." half, the open mobile menu, the Restaurantes and Llegó posters, the default under-ink of headlines on paper, the nav hover bar and the FAQ plus box. Ink on it is 6.1:1.
- **Burnt Orange** (ink-orange-dark): the halftone dot screen over the orange hero and the list markers in legal text. Never text (3.4:1 on paper).

### Tertiary
- **Sun** (ink-sun): the light accent field and the highlight ink. The closing poster ("¿Qué pides hoy?"), the 404, headline lines and labels printed on teal or deep ink, footer column titles and the giant LLEGÓ wordmark, icon tiles, "last updated" stamp, text selection.
- **Field Green** (ink-green): the third field. Farmacia and Llego Mensajeros posters, the approved state, the second trail behind the hero box. Ink on it is 5.9:1.
- **Leaf** (ink-leaf): fill for illustrations on paper posters and the link/accent color in ink mode.

### Neutral
- **Cream Paper** (paper): the page floor, the navbar, text on teal and deep-ink fields, the paper ticket.
- **Deep Paper** (paper-deep): the second paper stock. Partner cards, legal callouts, the Perfumería poster, the scrollbar track.
- **Bright Paper** (paper-bright): the surface inside form fields and choice cards on /negocios, so the field reads as a sheet laid on the card.
- **Soft Ink** (ink-soft, 80%): secondary running text on paper (ledes, legal paragraphs, FAQ answers). 7.2:1.
- **Muted Ink** (ink-mute, 70%): the floor for any quieter text on paper. 5.4:1. Nothing lighter carries text.
- **Ink Rule** (ink-line, 16%): hairline dividers between legal sections and FAQ items.
- **Error Ink** (error-ink): field errors, form errors and the rejected state on /negocios. 6.6:1 on paper.

### Ink mode (admin panels)
`/tutoriales` and `/business-types` render with `data-theme="ink"` (`color-scheme: dark`): **Night** (night) as the background, **Night Surface** (night-surface) for panels, paper text at 100 / 72 / 62% for primary / variant / subtle, sun as highlight and focus, leaf as link and accent, teal as button fill. Admin panels inherit only the type and the palette; their `main h1, h2` switch to the poster face. They do not use tickets, posters or registration.

### Named Rules
**The Flat Field Rule.** A section is one flat ink, edge to edge. Inks never blend into gradients; when two inks meet they overlap with `mix-blend-mode: multiply` or sit side by side at a hard seam (Dos orillas).

**The Ink-On-Ink Rule.** Text on paper, orange, sun, green and deep paper is always Deep Teal Ink. Text on Logo Teal and on Deep Teal Ink is paper, or sun for display-size lines only (sun on teal is 4.2:1, large text only).

**The Paper Floor Rule.** The page floor is white (the logo manual's background); never pure black. The darkest surface is Country Squire (`--ink`). The Sign in with Apple button keeps Apple's black because Apple requires it.

## Typography

**Display Font:** Montserrat Variable 900, uppercase, letter-spacing -0.02em (fallback Arial Black)
**Body Font:** Montserrat Variable 400 to 600 (fallback -apple-system, Segoe UI, Roboto)

**Character:** One geometric family, as the logo manual asks: the poster voice is Montserrat Black in uppercase, the small print is the same family at regular weight.

### Hierarchy
- **Display** (900, clamp(62px, 9.4vw, 128px), 0.98): the hero headline only ("Pide lo que / quieras. / Llegó."), and the ComingSoon posters at clamp(60px, 12vw, 160px).
- **Headline** (800, clamp(52px, 10vw, 128px), 0.98): section posters via `PrintTitle` ("Una app. / Todos los negocios.", "Así llega / tu pedido"). Dos orillas uses 900 at clamp(56px, 9vw, 112px); the closing poster goes up to 176px. Legal pages use 900 at clamp(2.75rem, 8vw, 4.75rem), 0.92.
- **Title** (800, 30px, 0.95): film-frame titles, partner choice and card titles (30 to 34px), legal h2 (1.85rem, teal). Poster and app names in the poster walls run larger, 900 at clamp(28px, 7.4vw, 64px) and clamp(40px, 3.7vw, 54px), line-height 0.9.
- **Label** (800, 22px, 0.02em, uppercase): footer column titles, Dos orillas list items, contact labels, inline poster CTAs ("Vender en Llegó", 24px with a 3px underline).
- **Ticket** (800, 1.35rem in a standard ticket, 1.6rem in the store tickets, uppercase): the big word on a ticket ("App Store", "APK", "Descargar").
- **Lede** (500, clamp(17px, 1.6vw, 20px), 1.55): the paragraph under a poster headline, max 44 to 46ch.
- **Body** (400, 1rem, 1.6): default running text.
- **Body small** (500, 15px, 1.5): poster captions, frame text, nav links (600), footer links.
- **Prose** (400, 1.0625rem, 1.75): legal and support reading column, max 36rem (about 66 characters).
- **Caption** (600, 0.75rem, 85% opacity): the small line on a ticket ("Descargar en", "Descargar para Android").

### Named Rules
**The Two Voices Rule.** Display weight (900) is always uppercase and only for headlines, titles, labels, tickets and the wordmark. Running text is never uppercase and carries every sentence a visitor has to read. Titles and buttons are written in Spanish sentence case in the source; the uppercase comes from CSS.

**The Room For The Accent Rule.** Display lines are stacked tight (0.9 to 0.98) but each printed line after the first gets `padding-top: 0.1em`, so Ó, Í and ¿ never collide with the line above. Never go below 0.9 line-height on Spanish uppercase.

## Layout

The page is a vertical stack of full-bleed posters. Each section paints its ink edge to edge and holds its content in a 1240px container with a fluid gutter (`gutter`), and breathes with `section-y` top and bottom. The navbar is fixed at 68px, so first posters add `calc(68px + …)` of top padding and every `[id]` target has `scroll-margin-top: 88px`.

Compositions are asymmetric two-column splits rather than centred stacks: hero 1.15fr / 1fr (copy left, art right), section heads 1.3fr / 1fr with the lede bottom-aligned to the headline, closing poster 1.4fr / 1fr. The category wall is a 6-column mosaic with 200px rows and uneven spans (Restaurantes 3×2, Farmacia 1×2, Perfumería 3×1, "Y más" 2×1 in ink to leave the wall open to any business); on phones it collapses to two columns with Restaurantes and "Y más" spanning both. Dos orillas splits the viewport into two equal ink fields with the box straddling the seam. The ecosystem wall is three posters at different heights and angles (−1.2°, 0.8°, −0.6°), as if pasted by hand. "Cómo funciona" is a horizontally scrolling 16mm film strip with scroll-snap on every width, keyboard focusable.

Read mode (legal, support, account deletion) drops the posters for a 720px reading column on paper, with posters reappearing only as boxed accents (teal contact box, sun closing box).

Breakpoints are content-driven: 640px (reading column padding), 700px (ComingSoon box joins the flow), 768px (footer two columns), 900px (main switch: navbar to full-screen menu below, two-column posters and 6-column wall above), 1024px (hero fills the viewport, min(100svh, 960px)), 1100px (wider film frames). Mobile shows exactly the same content as desktop.

## Elevation & Depth

The system is flat paper. Depth is a print effect: a translucent second pass of ink, offset down and to the right with zero blur, as if the screen printer laid the same shape twice. It is reserved for the two figures (the logo box and the phone with the real app) and for the headline registration. Surfaces, posters, cards and buttons sit flat on the paper with no shadow; when a container needs an edge it gets a 2px ink border or inset ring, and the navbar gets a 2px ink rule once the page scrolls.

### Shadow Vocabulary
- **Box pass** (`filter: drop-shadow(10px 14px 0 rgba(18, 73, 57, 0.22))`, 8px 10px at 0.2 to 0.25 for smaller boxes): under the logo box wherever it appears.
- **Phone pass** (`box-shadow: 14px 18px 0 -2px rgba(18, 73, 57, 0.28), 0 32px 64px -28px rgba(18, 73, 57, 0.5)`): the hero phone only; the one place a soft shadow is layered under the ink pass.
- **Scroll rule** (`box-shadow: 0 2px 0 #023133`): the navbar after 8px of scroll.
- **Headline registration** (`text-shadow: 0.045em 0.035em 0 <under-ink>`): see Print title.

### Named Rules
**The Second Pass Rule.** Depth is an offset, unblurred, translucent ink pass under a figure, never a blurred shadow lifting a card. If something needs to stand out, give it a different ink field, not elevation.

## Shapes

Paper is cut straight. Poster fields, ecosystem posters, partner cards, choice cards, the contact box and legal callouts all have square corners (0). Rounding is reserved for objects that are rounded in the real world: tickets (6px, with two 7px half-circle notches punched out of the left and right edges by a CSS mask), text inputs (8px), film-frame windows (4px), the phone (40px outer, 33px screen) and the hero ink trails, which are full pills because they are brush strokes. List bullets in Dos orillas are half-pill dashes (`border-radius: 0 999px 999px 0`), echoing the speed trails of the logo. The logo box is always rotated between −8° and 8°, never straight.

### Named Rules
**The Straight Cut Rule.** If it is paper, it has square corners. Only tickets, inputs, devices and ink trails round.

## Components

### Buttons (tickets)
A ticket is the primary action and the system's handshake: every download and every main CTA is a cinema ticket with a perforated stub.
- **Shape:** 6px corners with a 7px semicircular notch punched out of the middle of each side (`mask: radial-gradient(circle 7px at 0 50%, transparent 98%, #000)` left and right).
- **Default (ink):** Deep Teal Ink fill, paper text, min-height 52px, padding 10px 22px 10px 18px, a 24px inline SVG icon, then a two-line label: caption above ("Descargar en"), ticket-size uppercase word below ("App Store").
- **Tones:** `ticket--paper` (paper on ink fields and in the teal footer), `ticket--teal`, `ticket--orange`. Choose the tone by the field it sits on; the store pair always shows two different tones side by side (ink + paper on light fields).
- **Store tickets:** the App Store and APK pair, min-width 196px, min-height 60px, 1.6rem word, 14px gap, wrapping.
- **Hover / Active:** lifts and tilts (`translateY(-2px) rotate(-1deg)`, 0.25s ease-out), returns flat on press. Focus is the global 3px focus ring offset 3px.
- **Navbar ticket:** "Descargar" at min-height 44px, 18px display uppercase, with a download arrow icon.

### Text buttons
Secondary actions (/negocios, admin) use the plain `.btn`: 6px radius, min-height 48px, padding 12px 24px, Figtree 700.
- **Primary:** ink fill, paper text; hover turns Logo Teal and lifts 2px.
- **Secondary:** transparent with a 2px inset ink ring; hover fills with ink and turns the text paper.
- **Accent:** sun fill, ink text; hover turns orange.
- **Poster link:** inside posters, the CTA is a 24px uppercase display word with a 3px underline offset 6px and an arrow that slides 5px on hover ("Volver al inicio", "Ser mensajero").

### Cards / Containers
- **Poster field:** a flat ink rectangle, square corners, 28px padding on desktop (20px 18px on phones), content pinned to the bottom, an illustration in the top right corner. Text follows the Ink-On-Ink Rule. A paper-colored poster gets a 2px inset ink ring so it does not dissolve into the page.
- **Partner card:** Deep Paper fill, 2px ink border, square, 28px 24px padding, a title-size uppercase heading.
- **Choice card:** Bright Paper fill, 2px ink border, square; on hover or focus it turns sun and tilts half a degree.
- **Boxed accents in Read mode:** contact box (teal field, sun icon tiles 44px, sun labels), callout (Deep Paper with 2px inset ink ring), closing box (sun field with ink button).
- **Shadow strategy:** none (see Elevation & Depth).

### Inputs / Fields
- **Style:** 2px Deep Teal Ink border, 8px radius, Bright Paper fill, Figtree 1rem, padding 12px 14px; labels above in 0.875rem 600 ink; help text 0.8125rem in Soft Ink.
- **Focus:** border turns Logo Teal, plus a 3px teal outline at 40% offset 1px.
- **Error:** border and message in Error Ink; form-level errors are an 8px box with a 2px Error Ink border at 55% over a 10% red wash.
- **Disabled / busy:** 60% opacity with a wait cursor.

### Navigation
- **Bar:** fixed, paper background, 68px, logo box (50px) plus the wordmark "LLEGÓ" in 30px display uppercase; the box nudges 4px right on hover. Links in Figtree 15px 600 ink with a 4px orange bar that wipes in from the left on hover (0.35s). The last item is the "Descargar" ticket. After 8px of scroll a 2px ink rule appears under the bar.
- **Mobile (below 900px):** a 48px hamburger of three 3px ink bars opens a full-screen orange poster that unrolls from the top (`clip-path`, 0.5s ease-out); the links become clamp(36px, 10vw, 64px) display uppercase and the ticket grows to 56px. Escape closes it; the body scroll locks while open.
- **Footer:** a Logo Teal poster with a paper tagline, paper store tickets, two link columns under sun display titles (links get a sun underline on hover), the giant LLEGÓ wordmark in sun at clamp(120px, 30vw, 400px) and 900, and a hairline paper rule above the copyright and a small box.

### Print title (signature)
The registration headline. `PrintTitle` renders each line as a block; the whole heading carries a second ink as a zero-blur `text-shadow` offset by (`--reg-x`, `--reg-y`), default 0.045em / 0.035em (0.05em / 0.04em on the hero). The under-ink is set per field with `under`: paper on orange, orange on paper, sun and deep ink, Shadow Teal on teal. One line can be printed in an accent ink (`accent`, Logo Teal by default). When motion is allowed, a script adds `reg-pending` (offset 0.3em, −0.18em) to every `.print` and removes it once 35% of the heading is visible, so the inks slide into register over 1.1s ease-out and stay with the slight misregistration of a hand pull. With reduced motion or no JavaScript, headings render already registered.

### Poster illustrations
Category art is a 120×120 SVG drawn twice: layer A fills every shape in ink A; layer B draws the detail shapes and 5px round strokes in ink B, offset (4px, 3px) and multiplied. Motifs are Cuban and literal (plate and cutlery, guayabera, jaba, mango, perfume bottle). New categories follow the same two-pass recipe with two of the logo inks.

### Film strip
"Cómo funciona" frames are real app screenshots in a 16mm strip: near-black film base with sprocket holes drawn by repeating radial gradients top and bottom, 264 to 272px frames separated by 2px rules, an orange edge code ("LLEGÓ ▸ 01") in letterspaced display type, an orange light leak screened over the left edge of each window, and a sun title plus 15px caption under each frame. It scrolls horizontally with snap at every width.

### FAQ disclosure
Native `details` rows under a 3px ink top rule, hairline Ink Rule separators, 56px summaries in Figtree 1.05rem 700. The marker is a 32px square ink box: orange with an ink plus when closed, teal with a paper minus when open, drawn as inline SVG.

## Do's and Don'ts

### Do:
- **Do** give every section one flat ink field and pick its text by the Ink-On-Ink Rule (ink on paper, orange, sun and green; paper or display-size sun on teal and deep ink).
- **Do** set poster headlines with `PrintTitle` so they carry the registration under-ink, and choose the under-ink for the field.
- **Do** make every download or primary CTA a ticket, in the tone of the field it sits on.
- **Do** keep paper square (radius 0) and round only tickets (6px), inputs (8px), devices and ink trails.
- **Do** put the logo box in as the figure, rotated a few degrees, crossing a seam, a phone or the edge of the poster, with its offset ink pass.
- **Do** use real app screenshots (`public/img/captura-*`) as the only imagery, framed as a phone or a film frame.
- **Do** draw icons as inline SVG with round caps; fill brand marks, stroke UI icons.
- **Do** gate every motion behind `prefers-reduced-motion: no-preference` and make the resting state the readable, complete one.
- **Do** keep running text at Soft Ink (80%) or Muted Ink (70%) at minimum on paper.

### Don't:
- **Don't** blend inks into gradient fields, put gradient text on headings, or rebuild the dark-gradient delivery landing with a row of identical cards.
- **Don't** lift cards with blurred drop shadows; depth is the offset ink pass on figures only.
- **Don't** round poster fields or cards, and don't make action buttons into full pills.
- **Don't** set Figtree in uppercase or Big Shoulders in sentence case, and don't use Big Shoulders for paragraphs.
- **Don't** put kicker or eyebrow labels or pill badges above headings.
- **Don't** use emoji or text glyphs as icons.
- **Don't** use pure white or pure black on public pages (Apple's sign-in button is the only exception).
- **Don't** use Burnt Orange or Shadow Teal for text, or sun text on teal below display size.
- **Don't** hide content until scroll or show different content on desktop and mobile; registration only moves the under-ink.
- **Don't** bring tickets, posters or registration into the ink-mode admin panels; they inherit type and palette only.

## Motion additions (scroll and fixed components)

- **Ruta del pedido**: the page scroll is the order's trip. A 24px paper band under the navbar carries a dashed teal road; the logo box moves along it (`--p`, 0 to 1) and the house at the end hops when the page ends.
- **Marquesina**: ink band with sun bulbs (two alternating layers, `steps(1)`) and the categories in Big Shoulders sun with an orange under-ink, scrolling at 48s per loop; paused offscreen and static with reduced motion.
- **Pegada de carteles**: posters enter tilted and settle (`--i` stagger of 80ms); on hover the second ink slides further out of register.
- **Proyección**: film frames start dark (brightness 0.12, sepia) and light up one after another (0.28s apart).
- **El mar**: a sun-on-dark-teal wave strip between the two shores; the box crosses it from the abroad side to Cuba, scroll-linked.
- **Barra de descarga** (mobile only): orange fixed bar with two tickets, shown between the hero tickets and the closing poster.

