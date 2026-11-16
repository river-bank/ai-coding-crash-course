import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "~/db";
import { courseRatings } from "~/db/schema";
import { isUserEnrolled } from "~/services/enrollmentService";

// ─── Rating Service ───
// Anonymous 1–5 star course ratings. Only aggregate data (average + count)
// should ever be shown to other users; userId is kept to enforce one rating
// per learner and to show learners their own score.
// Uses positional parameters (project convention).

export const MIN_RATING = 1;
export const MAX_RATING = 5;

export type RatingSummary = {
  average: number | null;
  count: number;
};

export function isValidRating(rating: unknown): rating is number {
  return (
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= MIN_RATING &&
    rating <= MAX_RATING
  );
}

export function rateCourse(userId: number, courseId: number, rating: number) {
  if (!isValidRating(rating)) {
    throw new Error(
      `Rating must be a whole number from ${MIN_RATING} to ${MAX_RATING}`
    );
  }

  if (!isUserEnrolled(userId, courseId)) {
    throw new Error("Only enrolled learners can rate this course");
  }

  const now = new Date().toISOString();

  return db
    .insert(courseRatings)
    .values({ userId, courseId, rating, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: [courseRatings.userId, courseRatings.courseId],
      set: { rating, updatedAt: now },
    })
    .returning()
    .get();
}

export function getUserRating(userId: number, courseId: number) {
  const row = db
    .select({ rating: courseRatings.rating })
    .from(courseRatings)
    .where(
      and(
        eq(courseRatings.userId, userId),
        eq(courseRatings.courseId, courseId)
      )
    )
    .get();

  return row?.rating ?? null;
}

function toSummary(average: number | null, count: number): RatingSummary {
  return {
    average:
      count > 0 && average !== null ? Math.round(average * 10) / 10 : null,
    count,
  };
}

export function getCourseRatingSummary(courseId: number): RatingSummary {
  const row = db
    .select({
      average: sql<number | null>`avg(${courseRatings.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(courseRatings)
    .where(eq(courseRatings.courseId, courseId))
    .get();

  return toSummary(row?.average ?? null, row?.count ?? 0);
}

export function getRatingSummariesForCourses(
  courseIds: number[]
): Map<number, RatingSummary> {
  const summaries = new Map<number, RatingSummary>();
  for (const id of courseIds) {
    summaries.set(id, { average: null, count: 0 });
  }
  if (courseIds.length === 0) return summaries;

  const rows = db
    .select({
      courseId: courseRatings.courseId,
      average: sql<number | null>`avg(${courseRatings.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(courseRatings)
    .where(inArray(courseRatings.courseId, courseIds))
    .groupBy(courseRatings.courseId)
    .all();

  for (const row of rows) {
    summaries.set(row.courseId, toSummary(row.average, row.count));
  }

  return summaries;
}
