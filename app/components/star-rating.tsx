import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "~/lib/utils";

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Read-only stars. Supports partial fill, e.g. 4.3 fills 4 stars and 30% of the fifth.
 */
export function StarDisplay({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {STARS.map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)));
        return (
          <span key={star} className="relative inline-block size-[1em]">
            <Star className="absolute inset-0 size-full text-muted-foreground/40" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="size-[1em] fill-amber-400 text-amber-400" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * "★★★★☆ 4.3 (12 ratings)" — or "No ratings yet".
 */
export function RatingSummary({
  average,
  count,
  className,
  hideWhenEmpty = false,
}: {
  average: number | null;
  count: number;
  className?: string;
  hideWhenEmpty?: boolean;
}) {
  if (count === 0 || average === null) {
    if (hideWhenEmpty) return null;
    return (
      <span className={cn("flex items-center gap-1.5", className)}>
        <StarDisplay value={0} />
        No ratings yet
      </span>
    );
  }

  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      <StarDisplay value={average} />
      <span className="font-medium text-foreground">{average.toFixed(1)}</span>
      <span>
        ({count} {count === 1 ? "rating" : "ratings"})
      </span>
    </span>
  );
}

/**
 * Clickable 1–5 stars. Each star is a submit button named "rating".
 */
export function StarInput({
  value,
  disabled,
}: {
  value: number | null;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shown = hovered ?? value ?? 0;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(null)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="submit"
          name="rating"
          value={star}
          disabled={disabled}
          aria-label={`Rate ${star} ${star === 1 ? "star" : "stars"}`}
          aria-pressed={value === star}
          onMouseEnter={() => setHovered(star)}
          onFocus={() => setHovered(star)}
          onBlur={() => setHovered(null)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <Star
            className={cn(
              "size-7",
              star <= shown
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/50"
            )}
          />
        </button>
      ))}
    </div>
  );
}
