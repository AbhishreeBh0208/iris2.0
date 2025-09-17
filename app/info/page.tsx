"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import MissionHeader from "../components/MissionHeader";
import MissionStats from "../components/MissionStats";
import MissionTimeline from "../components/MissionTimeline";
import MissionLogs from "../components/MissionLogs";

export default function MissionInfoPage() {
  const missionName = "IRIS Nanosat Intercept Mission";
  const status = "Active";

  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    // Update timestamp every second
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "#0f172a",
        }}
      >
        <MissionHeader
          missionName={missionName}
          status={status}
          timestamp={timestamp}
        />
        <MissionStats
          stats={[
            { label: "Velocity", value: 7.8, unit: "km/s" },
            { label: "Altitude", value: 550, unit: "km" },
            { label: "Inclination", value: 45, unit: "°" },
          ]}
        />
        <MissionTimeline />
        <MissionLogs />
      </div>
    </div>
  );
}
