# Show the learner's own rating on the dashboard

Depends on: 01, 02

## What

On `/dashboard`, each course card shows the learner's own rating, or a nudge to
rate if they haven't. The course average stays off the dashboard: it's for people
deciding whether to enrol, and dashboard learners already have.

## Details

- Not rated yet: empty stars + "Rate this course" link.
- Rated: "Your rating" + filled stars + "Change" link.
- Both link to `/courses/:slug#rate`, which jumps to the "Rate this course" box.
- Shown on In Progress and Completed cards.
- New `getUserRatingsForCourses(userId, courseIds)` in `ratingService` so it's one
  query for all cards, not one per card.

## Done when

- [ ] Unrated courses show the nudge; rated ones show the learner's score.
- [ ] Link lands on the rating box.
- [ ] Service function has tests.
