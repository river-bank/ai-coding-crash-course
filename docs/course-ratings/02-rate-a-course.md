# Learners rate a course on the course page

Depends on: 01

## What

On `/courses/:slug`, an enrolled learner sees a "Rate this course" box with five
clickable stars in the right-hand sidebar, under the progress card.

## Details

- Clicking a star posts to an `action` in `app/routes/courses.$slug.tsx`
  (`intent=rate`, `rating=1..5`) using a fetcher, so the page doesn't reload.
- The box shows the learner's current score filled in, and "Thanks — you rated
  this N stars" after saving. Clicking another star changes it.
- Not shown to: signed-out visitors, people not enrolled, the course's instructor.
- The action re-checks all of that on the server (sign-in, enrolment, 1–5) and
  returns 400/401/403 as appropriate.
- Stars are buttons with `aria-label="Rate N stars"` so they work with a keyboard
  and screen reader.

## Done when

- [ ] Enrolled learner can rate, see their score, and change it.
- [ ] Non-enrolled visitor and instructor don't see the box, and a hand-made POST is rejected.
