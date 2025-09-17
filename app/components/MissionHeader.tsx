"use client";

interface MissionHeaderProps {
  missionName: string;
  status: string;
  timestamp: string;
}

export default function MissionHeader({
  missionName,
  status,
  timestamp,
}: MissionHeaderProps) {
  return (
    <div
      style={{
        padding: "16px 24px",
        background: "#1e293b",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #334155",
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: "white" }}>{missionName}</h2>
        <p style={{ margin: 0, color: "#9ca3af" }}>
          {timestamp || "Loading time..."}
        </p>
      </div>
      <span
        style={{
          padding: "6px 12px",
          borderRadius: "8px",
          background: status === "Active" ? "#16a34a" : "#ef4444",
          color: "white",
          fontWeight: "bold",
        }}
      >
        {status}
      </span>
    </div>
  );
}
