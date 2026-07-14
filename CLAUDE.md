Saved to memory. Here's the snapshot:

Worth a Pint — Project Snapshot
Purpose
An editorial London pub review site (worthapint.london), solo project by Tom. Focused on independent pubs and giving them a platform against corporate chains. Passion project built from scratch.

Architecture

Frontend: Next.js 16, App Router, TypeScript, Tailwind CSS
Backend/DB: Supabase (PostgreSQL, auth, storage)
Hosting: Vercel (auto-deploys on push)
Repo: GitHub — tomdhuggon-maker/worthapint


Database Schema
pubs — id, created_at, name, address, area, slug, latitude, longitude, google_maps_url
reviews — id, created_at, pub_id, title, body, rating_beer, rating_atmosphere, rating_value, author, published_at
review_images — id, created_at, review_id, url, position
RLS enabled on all tables: public read, authenticated write. Storage bucket: review-images (public).

Implemented Features

Homepage listing pubs ordered by most recent review, with avg rating
Public pub pages (/pubs/[slug]) with reviews, sub-ratings (beer/atmosphere/value), images, and Google Maps link
Public map (/map) showing reviewed pubs as interactive pins, with a linked accessible pub list
Site nav with logo (links home), Map, About, and Contact
About page with editorial copy
Contact form via Formspree → Gmail
Full admin panel: login, dashboard, add pub, add review (multi-image upload), edit review
Supabase auth with session handling working in production

Design language: DM Serif Display + Inter. Off-white (#FAFAF8), near-black ink (#1A1A18), warm red accent (#C8442A). Minimal, editorial — no cards or decorative boxes.

Known Issues
None current.

Roadmap

Grow content — target ~20 pubs to make the map worthwhile.
