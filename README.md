# Website-Hanny

Personal website for Hanny: part portfolio, part timeline, part skills matrix, fully caffeinated.

## What This Site Does
- Landing page with a typewriter intro, holiday-aware greeting, and Matrix-style bit-rain background.
- Clickable portrait that bounces when you do.
- Skills page with directional hover reveals and modal drill-downs.
- Highlights timeline from 2019 to today with photos and narrative milestones.
- Portfolio gallery with project cards, links, and "private/maintenance" labels.
- Footer with contact shortcuts, contact vCard, and my email link.

## Key Routes
- `/` Home + intro
- `/my-skills` Skills grid and modals (data: `src/skilldata.json`)
- `/highlights` Timeline of milestones (data: `src/highlights.json`)
- `/portfolio` Project gallery (data: `src/app/portfolio/page.tsx`)

## Tech Used (No Flex, Just Facts)
- Next.js App Router + React
- Tailwind CSS for layout and styling
- Framer Motion for animations
- Bootstrap Icons
- `@shuimo-design/lunar` for lunar holiday greetings

## Local Dev
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open `http://localhost:3000`

## Customize Content
- Home page copy and hero: `src/app/page.tsx`
- Portfolio items: `src/app/portfolio/page.tsx`
- Timeline entries: `src/highlights.json`
- Skills matrix: `src/skilldata.json`
- Global nav/footer: `src/components/navbar.tsx` and `src/components/footer.tsx`

## Notes
- The greeting changes based on server date, including lunar and seasonal holidays.
- The site is intentionally a little playful; professionalism with a wink >v-
