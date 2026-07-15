"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { routes } from "@/lib/routes";

export function NicknameForm({
  mode = "welcome",
  initialName = "",
  nextPath,
  onSaved,
}: {
  mode?: "welcome" | "edit";
  initialName?: string;
  nextPath?: string;
  onSaved?: (name: string) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      setError("");
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "저장에 실패했어요.");
        return;
      }

      const saved = data.user?.name ?? name.trim();

      if (mode === "edit") {
        onSaved?.(saved);
        router.refresh();
        return;
      }

      router.push(nextPath ?? routes.schools);
      router.refresh();
    });
  }

  return (
    <section className={mode === "welcome" ? "welcome-card" : "edit-nick"}>
      {mode === "welcome" ? (
        <>
          <p className="eyebrow">{APP_TAGLINE}</p>
          <h1 className="page-title">{APP_NAME}</h1>
          <p className="page-lead">
            시작하기 전에 닉네임을 정해 주세요.
            <br />
            나중에 프로필에서 언제든 바꿀 수 있어요.
          </p>
        </>
      ) : (
        <h2>닉네임 수정</h2>
      )}

      <label className="field">
        <span>닉네임</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 급식평론가"
          maxLength={12}
          autoFocus={mode === "welcome"}
        />
      </label>

      {error ? <p className="error">{error}</p> : null}

      <button
        type="button"
        className="primary-btn"
        disabled={pending || name.trim().length < 2}
        onClick={submit}
      >
        {mode === "welcome" ? "시작하기" : "저장"}
      </button>
    </section>
  );
}
