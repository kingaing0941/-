"use client";

import { useEffect, useState, useTransition } from "react";
import { StarRating } from "@/components/star-rating";
import { formatMealDate } from "@/lib/dates";

export type EditableReview = {
  id: string;
  mealDate: string;
  rating: number;
  comment: string;
  schoolName: string;
};

export function ReviewEditor({
  review,
  onClose,
  onSaved,
  onDeleted,
}: {
  review: EditableReview;
  onClose: () => void;
  onSaved: (review: EditableReview) => void;
  onDeleted: (id: string) => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setRating(review.rating);
    setComment(review.comment);
    setError("");
  }, [review]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function save() {
    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "수정에 실패했어요.");
        return;
      }
      onSaved({
        ...review,
        rating: data.review.rating,
        comment: data.review.comment,
      });
    });
  }

  function remove() {
    if (!window.confirm("이 리뷰를 삭제할까요?")) return;
    startTransition(async () => {
      setError("");
      const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "삭제에 실패했어요.");
        return;
      }
      onDeleted(review.id);
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-editor-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow">{review.schoolName}</p>
        <h2 id="review-editor-title" className="page-title">
          {formatMealDate(review.mealDate)}
        </h2>
        <p className="muted">리뷰를 수정하거나 삭제할 수 있어요.</p>

        <StarRating value={rating} onChange={setRating} />

        <label className="field">
          <span>한줄평</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={200}
            rows={3}
          />
        </label>

        {error ? <p className="error">{error}</p> : null}

        <div className="modal-actions">
          <button
            type="button"
            className="primary-btn"
            disabled={pending || rating < 1 || comment.trim().length < 1}
            onClick={save}
          >
            저장
          </button>
          <button
            type="button"
            className="danger-btn"
            disabled={pending}
            onClick={remove}
          >
            삭제
          </button>
          <button type="button" className="ghost-btn" disabled={pending} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
