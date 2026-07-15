"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NicknameForm } from "@/components/nickname-form";
import {
  ReviewEditor,
  type EditableReview,
} from "@/components/review-editor";
import { StarRating } from "@/components/star-rating";
import { formatMealDate } from "@/lib/dates";
import { routes } from "@/lib/routes";

type ProfileData = {
  user: {
    name: string | null;
    image: string | null;
    schoolName: string | null;
    xp: number;
    level: number;
    progress: {
      percent: number;
      into: number;
      next: number;
      remaining: number;
    };
  };
  stats: {
    reviewCount: number;
    averageRating: number;
    ratingDistribution: { star: number; count: number }[];
    monthlyAverage: { month: string; average: number; count: number }[];
  };
  reviews: EditableReview[];
};

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}년 ${Number(m)}월`;
}

export function ProfilePanel() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<EditableReview | null>(null);
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  function loadProfile() {
    setLoading(true);
    fetch("/api/profile")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "프로필 조회 실패");
        setData(json);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "프로필 조회 실패");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const monthGroups = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, EditableReview[]>();
    for (const review of data.reviews) {
      const key = review.mealDate.slice(0, 7);
      const list = map.get(key) ?? [];
      list.push(review);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, reviews]) => ({
        month,
        reviews: reviews.sort((a, b) => b.mealDate.localeCompare(a.mealDate)),
      }));
  }, [data]);

  useEffect(() => {
    if (!openMonth && monthGroups[0]) {
      setOpenMonth(monthGroups[0].month);
    }
  }, [monthGroups, openMonth]);

  if (loading) return <p className="muted">프로필 불러오는 중…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  const { user, stats } = data;

  return (
    <section className="panel profile-panel">
      <div className="profile-head">
        <div className="avatar fallback">{(user.name ?? "?").slice(0, 1)}</div>
        <div className="profile-head-text">
          <h1 className="page-title">{user.name ?? "사용자"}</h1>
          <p className="muted">{user.schoolName ?? "학교 미선택"}</p>
          <button
            type="button"
            className="text-btn"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "수정 닫기" : "프로필 수정"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="edit-block">
          <NicknameForm
            mode="edit"
            initialName={user.name ?? ""}
            onSaved={(name) => {
              setData((prev) =>
                prev ? { ...prev, user: { ...prev.user, name } } : prev,
              );
              setEditing(false);
              router.refresh();
            }}
          />
        </div>
      ) : null}

      <div className="xp-card">
        <div className="xp-top">
          <strong>Lv.{user.level}</strong>
          <span>
            {user.xp} XP · 다음 레벨까지 {user.progress.remaining}
          </span>
        </div>
        <div className="xp-track" aria-hidden>
          <div className="xp-fill" style={{ width: `${user.progress.percent}%` }} />
        </div>
      </div>

      <div className="stat-row">
        <div>
          <span className="muted">리뷰</span>
          <strong>{stats.reviewCount}</strong>
        </div>
        <div>
          <span className="muted">평균 별점</span>
          <strong>{stats.averageRating.toFixed(1)}</strong>
        </div>
      </div>

      <div className="chart-block">
        <h2>월별 평균 별점</h2>
        {stats.monthlyAverage.length === 0 ? (
          <p className="muted">아직 분석할 리뷰가 없어요.</p>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.monthlyAverage}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} width={28} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0F766E" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="chart-block">
        <h2>별점 분포</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
              <XAxis dataKey="star" tickFormatter={(v) => `${v}점`} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
              <Tooltip />
              <Bar dataKey="count" fill="#E8A317" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="review-history">
        <h2>내가 남긴 리뷰</h2>
        {monthGroups.length === 0 ? (
          <p className="muted">아직 작성한 리뷰가 없습니다.</p>
        ) : (
          <div className="month-groups">
            {monthGroups.map(({ month, reviews }) => {
              const open = openMonth === month;
              return (
                <section key={month} className="month-group">
                  <button
                    type="button"
                    className="month-toggle"
                    aria-expanded={open}
                    onClick={() => setOpenMonth(open ? null : month)}
                  >
                    <span>{monthLabel(month)}</span>
                    <span className="muted">
                      {reviews.length}개 · {open ? "접기" : "펼치기"}
                    </span>
                  </button>
                  {open ? (
                    <ul>
                      {reviews.map((review) => (
                        <li key={review.id}>
                          <button
                            type="button"
                            className="review-item review-item-btn"
                            onClick={() => setSelected(review)}
                          >
                            <div className="review-item-top">
                              <strong>{formatMealDate(review.mealDate)}</strong>
                              <StarRating value={review.rating} readOnly size="sm" />
                            </div>
                            <p>{review.comment}</p>
                            <span className="review-hint">탭해서 수정 · 삭제</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href={routes.schools}
        className="ghost-btn"
        style={{ display: "block", textAlign: "center" }}
      >
        학교 변경
      </Link>

      {selected ? (
        <ReviewEditor
          review={selected}
          onClose={() => setSelected(null)}
          onSaved={(review) => {
            setData((prev) => {
              if (!prev) return prev;
              const reviews = prev.reviews.map((r) =>
                r.id === review.id ? review : r,
              );
              const averageRating =
                reviews.length === 0
                  ? 0
                  : Math.round(
                      (reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length) *
                        10,
                    ) / 10;
              return {
                ...prev,
                reviews,
                stats: {
                  ...prev.stats,
                  averageRating,
                  reviewCount: reviews.length,
                  ratingDistribution: [1, 2, 3, 4, 5].map((star) => ({
                    star,
                    count: reviews.filter((r) => r.rating === star).length,
                  })),
                },
              };
            });
            setSelected(null);
            router.refresh();
          }}
          onDeleted={(id) => {
            setData((prev) => {
              if (!prev) return prev;
              const reviews = prev.reviews.filter((r) => r.id !== id);
              const averageRating =
                reviews.length === 0
                  ? 0
                  : Math.round(
                      (reviews.reduce((sum, r) => sum + r.rating, 0) /
                        reviews.length) *
                        10,
                    ) / 10;
              return {
                ...prev,
                reviews,
                stats: {
                  ...prev.stats,
                  averageRating,
                  reviewCount: reviews.length,
                  ratingDistribution: [1, 2, 3, 4, 5].map((star) => ({
                    star,
                    count: reviews.filter((r) => r.rating === star).length,
                  })),
                },
              };
            });
            setSelected(null);
            router.refresh();
          }}
        />
      ) : null}
    </section>
  );
}
