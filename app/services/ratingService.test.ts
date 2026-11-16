import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData } from "~/test/setup";
import * as schema from "~/db/schema";

let testDb: ReturnType<typeof createTestDb>;
let base: ReturnType<typeof seedBaseData>;

vi.mock("~/db", () => ({
  get db() {
    return testDb;
  },
}));

// Import after mock so the module picks up our test db
import {
  rateCourse,
  getUserRating,
  getCourseRatingSummary,
  getRatingSummariesForCourses,
  getUserRatingsForCourses,
  isValidRating,
} from "./ratingService";
import { enrollUser } from "./enrollmentService";

function createStudent(n: number) {
  return testDb
    .insert(schema.users)
    .values({
      name: `Student ${n}`,
      email: `student${n}@example.com`,
      role: schema.UserRole.Student,
    })
    .returning()
    .get();
}

function createCourse(slug: string) {
  return testDb
    .insert(schema.courses)
    .values({
      title: slug,
      slug,
      description: "Another course",
      instructorId: base.instructor.id,
      categoryId: base.category.id,
      status: schema.CourseStatus.Published,
    })
    .returning()
    .get();
}

describe("ratingService", () => {
  beforeEach(() => {
    testDb = createTestDb();
    base = seedBaseData(testDb);
  });

  describe("isValidRating", () => {
    it("accepts whole numbers 1 to 5", () => {
      for (const n of [1, 2, 3, 4, 5]) expect(isValidRating(n)).toBe(true);
    });

    it("rejects out-of-range, fractional and non-number values", () => {
      for (const n of [0, 6, -1, 2.5, NaN, "3", null, undefined]) {
        expect(isValidRating(n)).toBe(false);
      }
    });
  });

  describe("rateCourse", () => {
    it("saves a rating for an enrolled learner", () => {
      enrollUser(base.user.id, base.course.id, false, false);

      const saved = rateCourse(base.user.id, base.course.id, 4);
      expect(saved.rating).toBe(4);
      expect(getUserRating(base.user.id, base.course.id)).toBe(4);
    });

    it("replaces the learner's earlier rating instead of adding another", () => {
      enrollUser(base.user.id, base.course.id, false, false);

      rateCourse(base.user.id, base.course.id, 2);
      rateCourse(base.user.id, base.course.id, 5);

      expect(getUserRating(base.user.id, base.course.id)).toBe(5);
      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: 5,
        count: 1,
      });
    });

    it("throws when the learner is not enrolled", () => {
      expect(() => rateCourse(base.user.id, base.course.id, 4)).toThrowError(
        "Only enrolled learners can rate this course"
      );
    });

    it.each([0, 6, 2.5])("throws for invalid rating %s", (rating) => {
      enrollUser(base.user.id, base.course.id, false, false);

      expect(() =>
        rateCourse(base.user.id, base.course.id, rating)
      ).toThrowError("Rating must be a whole number from 1 to 5");
    });
  });

  describe("getUserRating", () => {
    it("returns null when the learner hasn't rated", () => {
      expect(getUserRating(base.user.id, base.course.id)).toBeNull();
    });
  });

  describe("getCourseRatingSummary", () => {
    it("returns null average and zero count when nobody has rated", () => {
      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: null,
        count: 0,
      });
    });

    it("averages all ratings, rounded to one decimal place", () => {
      const ratings = [5, 4, 4];
      const students = [base.user, createStudent(2), createStudent(3)];
      students.forEach((s, i) => {
        enrollUser(s.id, base.course.id, false, false);
        rateCourse(s.id, base.course.id, ratings[i]);
      });

      // (5 + 4 + 4) / 3 = 4.333...
      expect(getCourseRatingSummary(base.course.id)).toEqual({
        average: 4.3,
        count: 3,
      });
    });
  });

  describe("getRatingSummariesForCourses", () => {
    it("returns a summary for each course, including unrated ones", () => {
      const course2 = createCourse("course-2");
      const course3 = createCourse("course-3");
      const student2 = createStudent(2);

      enrollUser(base.user.id, base.course.id, false, false);
      enrollUser(student2.id, base.course.id, false, false);
      enrollUser(base.user.id, course2.id, false, false);
      rateCourse(base.user.id, base.course.id, 5);
      rateCourse(student2.id, base.course.id, 2);
      rateCourse(base.user.id, course2.id, 3);

      const summaries = getRatingSummariesForCourses([
        base.course.id,
        course2.id,
        course3.id,
      ]);

      expect(summaries.get(base.course.id)).toEqual({ average: 3.5, count: 2 });
      expect(summaries.get(course2.id)).toEqual({ average: 3, count: 1 });
      expect(summaries.get(course3.id)).toEqual({ average: null, count: 0 });
    });

    it("returns an empty map for no course ids", () => {
      expect(getRatingSummariesForCourses([]).size).toBe(0);
    });
  });

  describe("getUserRatingsForCourses", () => {
    it("returns only this learner's ratings, keyed by course", () => {
      const course2 = createCourse("course-2");
      const course3 = createCourse("course-3");
      const student2 = createStudent(2);

      for (const c of [base.course, course2, course3]) {
        enrollUser(base.user.id, c.id, false, false);
      }
      enrollUser(student2.id, course3.id, false, false);
      rateCourse(base.user.id, base.course.id, 5);
      rateCourse(base.user.id, course2.id, 2);
      rateCourse(student2.id, course3.id, 1);

      const ratings = getUserRatingsForCourses(base.user.id, [
        base.course.id,
        course2.id,
        course3.id,
      ]);

      expect(ratings.get(base.course.id)).toBe(5);
      expect(ratings.get(course2.id)).toBe(2);
      expect(ratings.has(course3.id)).toBe(false);
    });

    it("returns an empty map for no course ids", () => {
      expect(getUserRatingsForCourses(base.user.id, []).size).toBe(0);
    });
  });
});
