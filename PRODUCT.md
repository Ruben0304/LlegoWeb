# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences weigh the same on the website:

- **People in Cuba** who order for themselves from their phone: food, clothes, groceries, farm produce, perfume and more, from businesses near them or in other municipalities.
- **Cubans abroad** who buy and pay for their family on the island.

Secondary audiences: **business owners** who want to sell through Llegó (they join from `/negocios` and run their shop in LlegoBusiness) and **couriers** (Llego Mensajeros). Admin staff use `/tutoriales` and `/business-types`.

## Product Purpose

Llegó is not just a delivery business: it is a family of interactive apps that sets out to modernise, visually, how people buy and sell in Cuba.

- **Llegó (customers, iOS and Android):** find every kind of business, nearby or outside your municipality; order delivery, schedule an order for later, or pick it up in store.
- **LlegoBusiness:** complete order management, catalogue, business settings and finances; businesses create combos, promotional banners and more.
- **Llego Mensajeros:** fast and safe delivery of orders.

The website explains the apps, gets people to download them (App Store, Android APK), signs up businesses and couriers, and hosts support, legal and account-deletion pages that the apps link to.

## Positioning

- One app for every kind of business, not only restaurants, with the reach to order beyond your own municipality.
- Smart search: vector search plus an AI assistant (by voice or text) whose recommendations make finding things faster over time.
- Flexible payments: from abroad or from Cuba, by transfer, in cash, and in foreign currency.
- Scheduled orders and in-store pickup next to delivery.
- A connected ecosystem (customers, businesses, couriers) with a modern visual standard the Cuban market has not seen.

## Operating Context

- Most visitors arrive on a phone, often on expensive or slow mobile data in Cuba; the diaspora arrives on any device.
- Transfers in Cuba go through Transfermóvil; cash on delivery may require ID verification (see `/soporte` and `/privacidad`).
- The Android app is distributed as an APK from this site (`/api/download/android`), not only through a store.

## Capabilities and Constraints

- Content is Spanish only (`lang="es"`).
- Llegó+ is a subscription that is not available yet and has no price: never show prices or benefits for it.
- Coverage (which provinces or cities) is not confirmed: do not state it.
- Legal and support texts are the single source the apps link to; their content changes only on request.
- Stack: Astro 5 + Svelte 5, SSR on Node (Railway).

## Brand Commitments

- Name: **Llegó** (customers), **LlegoBusiness**, **Llego Mensajeros**, **Llegó+**.
- The logo and its identity manual are binding (oct 2026): the hand with the box (`public/img/isotipo.svg`, logos in `public/img/logo-*.svg`), the palette Little Sun Dress `#F9C764`, Tangerine Twist `#F9B41E`, Jade Mussel Green `#176545` and Country Squire `#124939` (at most three at a time), and Montserrat. Layout and the poster system are ours (see DESIGN.md).

## Evidence on Hand

- App screenshots: `public/img/captura-restaurante-hero.webp` (restaurants), `captura-1-hero.webp` (clothing), `captura-2-hero.webp` (wallet in USD and CUP), `captura-3-hero.webp` (a shop profile), each with a `-320` version.
- No real user numbers, ratings, reviews, testimonials, press, or partner logos exist: do not invent any.
- No delivery-time promises beyond the existing copy.

## Product Principles

1. Show the apps working, not adjectives about them.
2. Speak to both sides of the family: whoever orders in Cuba and whoever pays from abroad.
3. Every download path works on a slow phone: light pages, the APK one tap away.
4. One ecosystem: customers, businesses and couriers read as parts of the same Llegó.
5. Honest: no invented figures, coverage, or Llegó+ benefits.

## Accessibility & Inclusion

WCAG 2.1 AA. Many visitors use mid-range Android phones with small screens and costly data: keep pages light and readable in bright daylight.
