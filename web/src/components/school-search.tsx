"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

type School = {
  officeCode: string;
  schoolCode: string;
  schoolName: string;
  region: string;
  address: string;
};

export function SchoolSearch({ currentSchool }: { currentSchool?: string | null }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [schools, setSchools] = useState<School[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setSchools([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`/api/schools?q=${encodeURIComponent(deferredQuery)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "검색 실패");
        setSchools(data.schools);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "검색 실패");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [deferredQuery]);

  function selectSchool(school: School) {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/schools/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(school),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "학교 선택 실패");
        return;
      }
      router.push(routes.today);
      router.refresh();
    });
  }

  return (
    <section className="panel">
      <h1 className="page-title">학교 선택</h1>
      <p className="page-lead">
        학교 이름을 검색한 뒤 선택하면, 해당 학교 급식을 볼 수 있어요.
      </p>

      {currentSchool ? (
        <p className="current-school">현재: {currentSchool}</p>
      ) : null}

      <label className="field">
        <span>학교명 검색</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 서울고등학교"
          autoComplete="off"
        />
      </label>

      {loading ? <p className="muted">검색 중…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <ul className="school-list">
        {schools.map((school) => (
          <li key={`${school.officeCode}-${school.schoolCode}`}>
            <button
              type="button"
              className="school-item"
              disabled={pending}
              onClick={() => selectSchool(school)}
            >
              <strong>{school.schoolName}</strong>
              <span>
                {school.region}
                {school.address ? ` · ${school.address}` : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && deferredQuery.trim().length >= 2 && schools.length === 0 ? (
        <p className="muted">검색 결과가 없습니다.</p>
      ) : null}
    </section>
  );
}
