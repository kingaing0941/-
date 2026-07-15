"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/star-rating";
import { celebrateLevelUp, celebrateReview } from "@/lib/celebrate";
import { formatMealDate, todayYmd } from "@/lib/dates";

type Meal = {
  date: string;
  mealType: string;
  dishes: string[];
  calories?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  mealDate: string;
};

export function MealBoard({ initialDate }: { initialDate?: string }) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate ?? todayYmd());
  const [schoolName, setSchoolName] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setMessage("");

    fetch(`/api/meals?date=${date}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "급식 조회 실패");
        setSchoolName(data.schoolName ?? "");
        setMeals(data.meals ?? []);
        setReview(data.review ?? null);
        setRating(data.review?.rating ?? 0);
        setComment(data.review?.comment ?? "");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "급식 조회 실패");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [date]);

  function submitReview() {
    startTransition(async () => {
      setError("");
      setMessage("");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealDate: date, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "리뷰 저장 실패");
        return;
      }
      setReview(data.review);
      router.refresh();
      if (data.xpGained > 0) {
        if (data.leveledUp) {
          celebrateLevelUp();
          setMessage(
            `+${data.xpGained} XP · 레벨 ${data.user.level}로 올랐어요!`,
          );
        } else {
          celebrateReview();
          setMessage(`+${data.xpGained} XP 적립`);
        }
      } else {
        setMessage("리뷰가 수정되었습니다.");
      }
    });
  }

  return (
    <section className="panel">
      <div className="meal-head">
        <div>
          <p className="eyebrow">{schoolName || "급식"}</p>
          <h1 className="page-title">{formatMealDate(date)}</h1>
        </div>
        <label className="date-field">
          <span>날짜</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>

      {loading ? <p className="muted">급식을 불러오는 중…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && meals.length === 0 ? (
        <div className="empty-meal">
          <p>이 날의 급식 정보가 없어요.</p>
          <p className="muted">주말·공휴일이거나 아직 등록되지 않았을 수 있어요.</p>
        </div>
      ) : null}

      <div className="meal-grid">
        {meals.map((meal) => (
          <article key={`${meal.date}-${meal.mealType}`} className="meal-block">
            <div className="meal-block-head">
              <h2>{meal.mealType}</h2>
              {meal.calories ? <span>{meal.calories}</span> : null}
            </div>
            <ul>
              {meal.dishes.map((dish) => (
                <li key={dish}>{dish}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {meals.length > 0 ? (
        <div className="review-box">
          <h2>리뷰 남기기</h2>
          <p className="muted">별점과 한줄평을 남기면 경험치가 쌓여요.</p>

          <StarRating value={rating} onChange={setRating} />

          <label className="field">
            <span>한줄평</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="오늘 급식은 어땠나요?"
            />
          </label>

          <button
            type="button"
            className="primary-btn"
            disabled={pending || rating < 1 || comment.trim().length < 1}
            onClick={submitReview}
          >
            {review ? "리뷰 수정" : "리뷰 등록"}
          </button>

          {message ? <p className="success">{message}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
