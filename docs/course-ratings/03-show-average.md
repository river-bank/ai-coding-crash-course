# Show average stars on the course page and course list

Depends on: 01

## What

Show "★ 4.3 (12 ratings)" so people deciding whether to enrol can see what
previous learners thought.

## Details

- Course page (`/courses/:slug`): in the header row next to instructor, lesson
  count and duration. Shows "No ratings yet" when the count is 0.
- Course list (`/courses`): on each card's footer. Hidden when the count is 0.
  Uses `getRatingSummariesForCourses` so it's one query, not one per card.
- Visible to everyone, signed in or not.
- Shared `StarRating` display component in `app/components/star-rating.tsx`
  (partly filled stars for averages like 4.3).
- Never shows who rated.

## Done when

- [ ] Average and count show on both pages and match the database.
- [ ] Average updates straight after a learner rates (ticket 02).
