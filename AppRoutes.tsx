// AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import YearbookPage from "./pages/YearbookPage";
import type { AppStage } from "./types";

// App.tsx의 stage 중에서 “App이 화면을 그리는 stage”만 라우트로 매핑
// (yearbook은 YearbookPage 라우트가 따로 있으니 제외)
type RouteStage = Exclude<AppStage, "yearbook">;

function AppStageRoute({ stage }: { stage: RouteStage }) {
  return <App routeStage={stage} />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* App 내부 stage로 렌더 (브릿지 단계) */}
      <Route path="/" element={<AppStageRoute stage="wallet-entry" />} />
      <Route path="/intro" element={<AppStageRoute stage="intro" />} />
      <Route path="/studio" element={<AppStageRoute stage="studio" />} />
      <Route path="/mint" element={<AppStageRoute stage="mint" />} />

      {/* Yearbook은 “페이지”로 분리 */}
      <Route path="/yearbook/:year" element={<YearbookPage />} />
      <Route path="/yearbook/:year/mint/:mintId" element={<YearbookPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
