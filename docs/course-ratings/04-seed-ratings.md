# Seed demo ratings

Depends on: 01

## What

`npm run db:seed` adds a few ratings from the seeded students so the feature is
visible straight away in dev.

## Details

- Add `course_ratings` to the `DROP TABLE` list in `scripts/seed.ts`.
- Only enrolled students rate (matches the seeded enrolments).
- Leave at least one enrolled student unrated on each course, so you can switch
  to them in DevUI and try rating.

## Done when

- [ ] After a fresh seed, both seeded courses show an average and count.
