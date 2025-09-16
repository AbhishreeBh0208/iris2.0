"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Globe2,
  Sun,
  Info,
  Rocket,
  FolderOpen,
  Waypoints
} from "lucide-react";

export default function Sidebar() {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [missionsOpen, setMissionsOpen] = useState(false);
  const pathname = usePathname();

  // Utility for active style
  const getLinkStyle = (path: string) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 10px",
    cursor: "pointer",
    borderRadius: "5px",
    background: pathname === path ? "#1f2937" : "transparent",
    color: pathname === path ? "#60a5fa" : "white",
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        width: "auto",
        background: "#111827",
        color: "white",
        height: "100vh",
        padding: "20px 30px",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        IRIS Controls
      </h2>

      {/* Dashboard dropdown */}
      <div>
        <button
          onClick={() => setDashboardOpen(!dashboardOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            textAlign: "left",
            padding: "10px",
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            gap: "10px",
            borderRadius: "5px",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <LayoutDashboard size={18} /> Dashboard ▾
        </button>

        {dashboardOpen && (
          <div style={{ marginLeft: "15px", marginTop: "5px" }}>
            <Link href="/solarsystem">
              <p style={getLinkStyle("/solarsystem")}>
                <Sun size={16} /> Solar System
              </p>
            </Link>
            <Link href="/earthglobe">
              <p style={getLinkStyle("/earthglobe")}>
                <Globe2 size={16} /> Earth
              </p>
            </Link>
          </div>
        )}
      </div>

       <div style={{ marginTop: "20px" }}>
        <Link href="/lab">
          <p
            style={getLinkStyle("/lab")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
            onMouseLeave={(e) => {
              if (pathname !== "/lab") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "white";
              }
            }}
          >
            <Waypoints size={16} /> Lab
          </p>
        </Link>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Link href="/info">
          <p
            style={getLinkStyle("/info")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
            onMouseLeave={(e) => {
              if (pathname !== "/info") {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "white";
              }
            }}
          >
            <Info size={16} /> Mission Info
          </p>
        </Link>
      </div>

      {/* Missions dropdown */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setMissionsOpen(!missionsOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            textAlign: "left",
            padding: "10px",
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            gap: "10px",
            borderRadius: "5px",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Rocket size={18} /> Missions ▾
        </button>

        {missionsOpen && (
          <div style={{ marginLeft: "15px", marginTop: "5px" }}>
            <Link href="/new-missions">
              <p style={getLinkStyle("/new-missions")}>
                <Rocket size={16} /> New Mission
              </p>
            </Link>
            <Link href="/past-missions">
              <p style={getLinkStyle("/past-missions")}>
                <FolderOpen size={16} /> Past Missions
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
