# Course ratings: table and service

## What

Add a `course_ratings` table and a `ratingService` that the pages can call.

## Details

- New table `course_ratings`: `id`, `user_id` → users, `course_id` → courses,
  `rating` (integer), `created_at`, `updated_at`.
- Unique index on (`user_id`, `course_id`) so one learner has one rating per course.
- Drizzle migration generated with `npm run db:generate`.
- `app/services/ratingService.ts`:
  - `rateCourse(userId, courseId, rating)` — checks the rating is a whole number
    1–5 and that the user is enrolled; inserts, or updates if they already rated.
  - `getUserRating(userId, courseId)` — the learner's own score, or `null`.
  - `getCourseRatingSummary(courseId)` — `{ average, count }`; average is `null`
    when nobody has rated.
  - `getRatingSummariesForCourses(courseIds)` — same, for many courses in one query
    (for the course list).

## Done when

- [ ] Migration creates the table with the unique index.
- [ ] Rating 0, 6, 2.5 or not enrolled throws a clear error.
- [ ] Rating twice replaces the first score, doesn't add a second row.
- [ ] Summary returns the right average and count; `null` / 0 when empty.
- [ ] Tests in `app/services/ratingService.test.ts` cover all of the above.
