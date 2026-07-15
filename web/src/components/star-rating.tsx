"use client";

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}) {
  const cls = size === "sm" ? "star-btn sm" : "star-btn";

  return (
    <div className="star-row" role={readOnly ? "img" : "radiogroup"} aria-label="별점">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        if (readOnly) {
          return (
            <span key={star} className={`${cls} ${filled ? "filled" : ""}`} aria-hidden>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={`${cls} ${filled ? "filled" : ""}`}
            aria-label={`${star}점`}
            aria-checked={filled && star === value}
            role="radio"
            onClick={() => onChange?.(star)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
