// pages/YearbookPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

type YearbookPayload = {
  mintId?: string;
  year?: string;
  imageUrl?: string | null;
  description?: string | null;
  wish?: string | null;
  createdAt?: string | null;
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function YearbookPage() {
  const navigate = useNavigate();
  const { year, mintId } = useParams();
  const location = useLocation();

  // 1) 가장 우선: navigate(url, { state })로 넘어온 데이터
  const statePayload = (location.state as YearbookPayload | null) ?? null;

  // 2) fallback: localStorage에서 복구 (새로고침/공유 대응용)
  const storageKey = useMemo(() => {
    // mintId 있으면 그걸로, 없으면 최신으로
    if (year && mintId) return `yearbook:${year}:mint:${mintId}`;
    if (year) return `yearbook:${year}:latest`;
    return `yearbook:latest`;
  }, [year, mintId]);

  const [payload, setPayload] = useState<YearbookPayload>(() => {
    return (
      statePayload ??
      safeJsonParse<YearbookPayload>(localStorage.getItem(storageKey)) ??
      {
        year: year ?? "2025",
        mintId: mintId ?? undefined,
        imageUrl: null,
        description: null,
        wish: null,
        createdAt: null,
      }
    );
  });

  // statePayload 들어오면 localStorage에도 저장(이 페이지가 “결과 페이지” 역할을 하게)
  useEffect(() => {
    if (!statePayload) return;

    const merged: YearbookPayload = {
      ...payload,
      ...statePayload,
      year: statePayload.year ?? year ?? payload.year,
      mintId: statePayload.mintId ?? mintId ?? payload.mintId,
    };

    setPayload(merged);

    // mintId 있는 경우: 해당 mint 키로 저장
    const keyByMint =
      (year && (statePayload.mintId ?? mintId))
        ? `yearbook:${year}:mint:${statePayload.mintId ?? mintId}`
        : storageKey;

    localStorage.setItem(keyByMint, JSON.stringify(merged));

    // 최신 key도 같이 업데이트(편의)
    if (year) {
      localStorage.setItem(`yearbook:${year}:latest`, JSON.stringify(merged));
    }
    localStorage.setItem(`yearbook:latest`, JSON.stringify(merged));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statePayload, year, mintId]);

  // 페이지 직접 진입(= statePayload 없음)일 때 localStorage에서 다시 읽어오기
  useEffect(() => {
    if (statePayload) return;
    const saved = safeJsonParse<YearbookPayload>(localStorage.getItem(storageKey));
    if (saved) setPayload(saved);
  }, [statePayload, storageKey]);

  const headerYear = payload.year ?? year ?? "2025";
  const headerMint = payload.mintId ?? mintId;

  const hasImage = Boolean(payload.imageUrl);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#FFDFA6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(860px, 100%)" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontFamily: "serif", fontSize: 44, lineHeight: 1, marginBottom: 6 }}>
              Year Book
            </div>
            <div style={{ opacity: 0.65, fontSize: 14 }}>
              EST {headerYear}
              {headerMint ? ` · Mint ${headerMint}` : ""}
            </div>
          </div>

          <button
            onClick={() => navigate("/studio")}
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid rgba(255,223,166,0.25)",
              background: "transparent",
              color: "#FFDFA6",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Back to Studio
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            border: "1px solid rgba(255,223,166,0.12)",
            borderRadius: 18,
            padding: 18,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* Image block */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,223,166,0.10)",
            }}
          >
            {hasImage ? (
              <img
                src={payload.imageUrl as string}
                alt="Minted artwork"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div style={{ opacity: 0.6, textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 16, marginBottom: 6 }}>No image data found.</div>
                <div style={{ fontSize: 13 }}>
                  If you just minted, come here via the mint flow so this page can receive the
                  result payload.
                </div>
              </div>
            )}
          </div>

          {/* Meta */}
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {payload.description ? (
              <div style={{ opacity: 0.9, lineHeight: 1.5 }}>
                {payload.description}
              </div>
            ) : (
              <div style={{ opacity: 0.5, lineHeight: 1.5 }}>
                (No description)
              </div>
            )}

            {payload.wish ? (
              <div style={{ opacity: 0.75, lineHeight: 1.5 }}>
                <span style={{ opacity: 0.8 }}>2026 Wish: </span>
                {payload.wish}
              </div>
            ) : null}

            {payload.createdAt ? (
              <div style={{ opacity: 0.55, fontSize: 13 }}>
                Created: {payload.createdAt}
              </div>
            ) : null}
          </div>
        </div>

        {/* Helper row */}
        <div style={{ marginTop: 10, opacity: 0.45, fontSize: 12 }}>
          Tip: this page uses router state first, then localStorage fallback for refresh/share.
        </div>
      </div>
    </div>
  );
}
