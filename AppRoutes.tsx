import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import YearbookPage from "./pages/YearbookPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />

      {/* stage 기반 페이지를 URL로도 열 수 있게 */}
      <Route path="/intro" element={<App />} />
      <Route path="/studio" element={<App />} />
      <Route path="/mint" element={<App />} />

      <Route path="/yearbook/:year" element={<YearbookPage />} />
      <Route path="/yearbook/:year/mint/:mintId" element={<YearbookPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
