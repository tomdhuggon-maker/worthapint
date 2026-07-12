# Worth a Pint

[Worth a Pint](https://www.worthapint.london/) is an independent London pub review site by brothers Tom and Chris. It highlights pubs that contribute something valuable to their communities and celebrates places worth seeking out for a drink.

## What the site includes

- A public homepage ordered by each pub's latest published review
- Individual pub pages with ratings, reviews, photographs, and map links
- About and contact pages
- A private admin area for adding pubs and creating or editing reviews
- Multiple image uploads backed by Supabase Storage

## Technology

- Next.js 16 with the App Router and TypeScript
- React 19 and Tailwind CSS 4
- Supabase for PostgreSQL, authentication, and image storage
- Vercel for hosting and automatic production deployments
- GitHub for source control

## Local setup

### 1. Install the project

Clone the repository, open it in VS Code, and install its packages:

```powershell
npm install
```

### 2. Add environment variables

Create `.env.local` in the project root:

```text
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not commit `.env.local`. Environment files are excluded by `.gitignore`.

### 3. Start the development site

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful commands

```powershell
npm run dev
```

Starts the local development site.

```powershell
npm run lint
```

Checks code quality and accessibility rules.

```powershell
npm test
```

Runs the automated tests.

```powershell
npm run build
```

Creates a production build and performs Next.js checks.

## Supabase configuration

The application expects these tables:

- `pubs`: `id`, `created_at`, `name`, `address`, `area`, `slug`, `latitude`, `longitude`, `google_maps_url`
- `reviews`: `id`, `created_at`, `pub_id`, `title`, `body`, `rating_beer`, `rating_atmosphere`, `rating_value`, `author`, `published_at`
- `review_images`: `id`, `created_at`, `review_id`, `url`, `position`

It also expects a public Storage bucket named `review-images`.

Row Level Security is enabled. Public visitors need read access, while writes must be limited to the intended admin user. New Auth registrations and anonymous sign-ins should remain disabled unless the authorization model is deliberately changed.

## Project structure

```text
app/
  admin/                 Private content-management pages
  pubs/[slug]/           Public pub and review pages
  about/                 About page
  contact/               Contact form
  components/            Shared interface components
lib/
  supabase-*.ts          Browser and server Supabase clients
  review-images.ts       Image validation and naming rules
proxy.ts                 Supabase session refresh
tests/                   Automated tests
```

## Publishing changes

Vercel deploys the `main` branch automatically. After checking changes locally:

```powershell
git add -A
git commit -m "describe the change"
git push
```

Check the Vercel dashboard and wait for the deployment status to become **Ready** before checking the production site.

## Current roadmap

- Grow the collection of reviewed pubs
- Add a public map using the coordinates stored for each pub
- Continue improving the admin experience and automated coverage
