# Course star ratings — plan

## What we're building

Learners on a course can give it 1 to 5 stars. Anyone looking at the course
(enrolled or not, signed in or not) sees the average stars and how many people
rated it. Ratings are anonymous: no names, no review text, nobody can see who
gave which score.

## Decisions (defaults picked; change if wrong)

| Question | Decision |
| --- | --- |
| Who can rate? | Only learners enrolled on the course. The course's instructor can't rate their own course. |
| How many ratings per learner? | One per course. Rating again replaces the old score. |
| Anonymous how? | We store the user id with the rating so we can stop double-voting and show you your own score. It is never shown to anyone else, and only the average and count leave the server. |
| Written reviews? | No, stars only. |
| Where is the average shown? | Course page header (next to lesson count) and on each card in the Browse Courses list. |
| No ratings yet? | Show "No ratings yet" on the course page; show nothing on the card. |
| Rounding | Average shown to one decimal place, e.g. 4.3 ★ (12 ratings). |

## Tickets

1. [01 — Ratings table and service](01-ratings-data-layer.md)
2. [02 — Learners rate a course on the course page](02-rate-a-course.md)
3. [03 — Show average stars on the course page and course list](03-show-average.md)
4. [04 — Seed demo ratings](04-seed-ratings.md)
5. [05 — Learner's own rating on the dashboard](05-dashboard-your-rating.md)

01 has to land first. 02 and 03 both depend on it and can be done in either
order. 04 is independent of 02/03.
