import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function YearbookPage() {
  const navigate = useNavigate();
  const { year, mintId } = useParams();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#FFDFA6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "serif", fontSize: 48, margin: 0 }}>
          Year Book
        </h1>
        <p style={{ opacity: 0.6 }}>
          EST {year} {mintId ? `· Mint ${mintId}` : ""}
        </p>

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: 24,
            padding: "10px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,223,166,0.3)",
            background: "transparent",
            color: "#FFDFA6",
            cursor: "pointer",
          }}
        >
          Back to Studio
        </button>
      </div>
    </div>
  );
}
