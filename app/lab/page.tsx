"use client";

import { useState } from "react";
import Sidebar from "../components/sidebar";
import ControlsPanel from "../components/ControlsPanel";
import MissionMetrics from "../components/MetricsDashboard";
import AIInsights from "../components/AiInsights";
import AITrajectoryComponent from "../components/AITrajectory";

export default function TrajectoryPage() {
  const [metrics, setMetrics] = useState<any>({});
  const [insights, setInsights] = useState<string>("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState("simulation");

  const handleSimulation = async (params: any) => {
    try {
      // Call simulation
      const res = await fetch("http://localhost:8000/trajectory/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const simData = await res.json();

      // Update metrics
      setMetrics({
        swarm_count: params.swarm_count,
        delta_v_budget: params.delta_v_budget,
        target_distance_au: params.target_distance_au,
        sim_duration_hours: params.sim_duration_hours,
        target_angle_deg: params.target_angle_deg,
        steps: params.steps,
      });

      // Log it
      setLogs((prev) => [
        ...prev,
        { id: simData.id + Date.now(), message: simData.message, ts: new Date().toISOString() },
      ]);

      // Fetch insights with loading state
      setLoadingInsights(true);
      const aiRes = await fetch("http://localhost:8000/trajectory/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const aiData = await aiRes.json();
      setInsights(aiData.insights);
    } catch (err) {
      console.error("Simulation failed:", err);
      setInsights("AI insights unavailable. Check backend.");
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0b1220" }}>
      <Sidebar />

      {/* Main content */}
      <main style={{ flex: 1, padding: 24, overflowY: "auto", color: "#38bdf8"}}>
        <h1 style={{ fontSize: 28, marginBottom: 16, fontWeight: "500"}}>Mission Simulation Lab</h1>

        {/* Tab Navigation */}
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          marginBottom: "24px",
          borderBottom: "1px solid #374151",
          paddingBottom: "16px"
        }}>
          <button
            onClick={() => setActiveTab("simulation")}
            style={{
              padding: "12px 24px",
              background: activeTab === "simulation" ? "#3b82f6" : "transparent",
              color: activeTab === "simulation" ? "white" : "#9ca3af",
              border: "1px solid #374151",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
          >
            Basic Simulation
          </button>
          <button
            onClick={() => setActiveTab("ai-trajectory")}
            style={{
              padding: "12px 24px",
              background: activeTab === "ai-trajectory" ? "#3b82f6" : "transparent",
              color: activeTab === "ai-trajectory" ? "white" : "#9ca3af",
              border: "1px solid #374151",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
          >
             Trajectory
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "simulation" && (
          <div>
            {/* Simulation controls */}
            <ControlsPanel onSim={handleSimulation} />

            {/* Mission Metrics */}
            {Object.keys(metrics).length > 0 && (
              <section style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 20, marginBottom: 12 }}>Mission Metrics</h2>
                <MissionMetrics metrics={metrics} />
              </section>
            )}

            {/* AI Insights */}
            <div style={{ marginTop: 24 }}>
              {loadingInsights ? (
                <AIInsights insights="typing..." loading={loadingInsights} />
              ) : insights ? (
                <AIInsights insights={insights} loading={loadingInsights} />
              ) : (
                <p style={{ color: "#9ca3af" }}>Run a simulation to get insights.</p>
              )}
            </div>

            {/* Simulation Logs */}
            {logs.length > 0 && (
              <section style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 20, marginBottom: 12 }}>Simulation Logs</h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {logs.map((log) => (
                    <li
                      key={log.id}
                      style={{
                        padding: "8px 12px",
                        background: "#111827",
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                    >
                      <strong>{log.message}</strong> <br />
                      <small style={{ color: "#9ca3af" }}>{log.ts}</small>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {activeTab === "ai-trajectory" && <AITrajectoryComponent />}
      </main>
    </div>
  );
}