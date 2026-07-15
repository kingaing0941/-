"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { StarRating } from "@/components/star-rating";
import { formatMealDate } from "@/lib/dates";

type PublicReview = {
  id: string;
  schoolName: string;
  mealDate: string;
  rating: number;
  comment: string;
  authorName: string;
  authorLevel: number;
};

type SchoolStat = {
  schoolCode: string;
  schoolName: string;
  averageRating: number | null;
  reviewCount: number;
};

export function ExploreBoard() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [schools, setSchools] = useState<SchoolStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setReviews([]);
      setSchools([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/explore?q=${encodeURIComponent(deferredQuery)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "검색 실패");
        setReviews(data.reviews ?? []);
        setSchools(data.schools ?? []);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "검색 실패");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [deferredQuery]);

  return (
    <section className="panel">
      <h1 className="page-title">리뷰 둘러보기</h1>
      <p className="page-lead">
        학교명·닉네임·한줄평으로 다른 사람의 공개 리뷰를 찾아볼 수 있어요.
      </p>

      <label className="field">
        <span>검색</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 서울고 / 닉네임 / 맛있"
          autoComplete="off"
        />
      </label>

      {loading ? <p className="muted">검색 중…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {schools.length > 0 ? (
        <div className="explore-schools">
          <h2>학교 평균 별점</h2>
          <ul className="school-list">
            {schools.map((school) => (
              <li key={school.schoolCode} className="school-stat-card">
                <strong>{school.schoolName}</strong>
                <span>
                  {school.averageRating != null
                    ? `평균 ★ ${school.averageRating}`
                    : "별점 없음"}
                  {` · 공개 리뷰 ${school.reviewCount}개`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="explore-reviews">
        <h2>공개 리뷰</h2>
        {deferredQuery.trim().length >= 2 && !loading && reviews.length === 0 ? (
          <p className="muted">검색 결과가 없습니다.</p>
        ) : null}
        <ul className="explore-list">
          {reviews.map((review) => (
            <li key={review.id} className="review-item">
              <div className="review-item-top">
                <strong>{review.schoolName}</strong>
                <StarRating value={review.rating} readOnly size="sm" />
              </div>
              <p className="muted">
                {formatMealDate(review.mealDate)} · {review.authorName} · Lv.
                {review.authorLevel}
              </p>
              <p>{review.comment}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
