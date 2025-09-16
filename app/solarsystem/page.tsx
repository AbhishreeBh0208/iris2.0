  "use client";

  import { SetStateAction } from "react";
  import { useState } from "react";
  import Sidebar from "../components/sidebar";
  import SolarSystem from "../components/SolarSystemView";
  import SolarStats from "../components/SolarStats";
  import SolarCharts from "../components/SolarCharts";

  export default function SolarSystemPage() {

      const dummyStats = {
        activeMissions: 5,
        avgAltitude: 520,
        coverage: 68,
        deltaV: 0.79
      }

    return (
      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, height: "100vh" }}>
          <SolarSystem />
        </div>

        <div style={{ display: "grid", gap: 24, padding: 16, overflowY: "auto" }}>
          <SolarStats stats={dummyStats} />
          <SolarCharts />
        </div>
      </div>
    );
  }
