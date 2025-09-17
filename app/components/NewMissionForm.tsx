"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Target, Zap, Users, Clock } from "lucide-react";

interface FeasibilityResult {
  feasible: boolean;
  reason: string;
  success_probability: number;
  delta_v: number;
  time_of_flight: number;
  fuel_required: number;
}

export default function NewMissionForm() {
  const [target, setTarget] = useState("Earth");
  const [days, setDays] = useState(30);
  const [swarms, setSwarms] = useState(12);
  const [deltaV, setDeltaV] = useState(0.8);
  const [angle, setAngle] = useState(45);
  const [roleSplit, setRoleSplit] = useState("equal");
  const [propulsionType, setPropulsionType] = useState("chemical");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feasibilityResult, setFeasibilityResult] = useState<FeasibilityResult | null>(null);
  const [missionApproved, setMissionApproved] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleFeasibilityCheck = async () => {
    setIsAnalyzing(true);
    setFeasibilityResult(null);

    const currentDate = new Date();
    const targetDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
    const julianDate = targetDate.getTime() / 86400000 + 2440587.5;

    const params = {
      target_name: target,
      intercept_epoch: julianDate,
      swarm_size: swarms,
      role_split: roleSplit,
      propulsion_type: propulsionType,
    };

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      setFeasibilityResult(data);
      setMissionApproved(data.feasible);
    } catch (error) {
      console.error("Feasibility check failed:", error);
      setFeasibilityResult({
        feasible: false,
        reason: "Failed to connect to mission control systems. Please try again.",
        success_probability: 0,
        delta_v: 0,
        time_of_flight: 0,
        fuel_required: 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunch = async () => {
    if (!missionApproved) return;

    setIsLaunching(true);

    const params = {
      target,
      days,
      swarm_count: swarms,
      delta_v_budget: deltaV,
      target_angle_deg: angle,
      success_probability: feasibilityResult?.success_probability ?? 0.75,
      time_of_flight: feasibilityResult?.time_of_flight ?? days,
    };

    try {
      const res = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URL}/api/launch-mission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      // For now: open SolarSystem in new tab
      const url = `/solarsystem`;
      window.open(url, "_blank");

      resetForm();
    } catch (error) {
      console.error("Launch failed:", error);
    } finally {
      setIsLaunching(false);
    }
  };

  const resetForm = () => {
    setFeasibilityResult(null);
    setMissionApproved(false);
    setIsAnalyzing(false);
    setIsLaunching(false);
  };

  return (
    <div style={{ padding: "32px", color: "white", maxWidth: "800px", margin: "0 auto", background: "#0b1220" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "8px",
            background: "linear-gradient(45deg, #60a5fa, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Mission Planning Control
        </h1>
        <p style={{ color: "#9ca3af", fontSize: "16px" }}>
          Design and analyze space missions with real-time feasibility assessment
        </p>
      </div>

      {/* Mission Parameters */}
      <div
        style={{
          background: "#1f2937",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid #374151",
        }}
      >
        <h2 style={{ color: "#60a5fa", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Target size={20} />
          Mission Parameters
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Target Destination */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Target Destination:</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #4b5563",
                background: "#374151",
                color: "white",
              }}
            >
              <option>Earth</option>
              <option>Mars</option>
              <option>Jupiter</option>
              <option>Saturn</option>
              <option>Venus</option>
              <option>Mercury</option>
            </select>
          </div>

          {/* Mission Duration */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Mission Duration (days):</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #4b5563",
                background: "#374151",
                color: "white",
              }}
            />
          </div>

          {/* Swarm Size */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Swarm Size:</label>
            <input
              type="number"
              value={swarms}
              onChange={(e) => setSwarms(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #4b5563",
                background: "#374151",
                color: "white",
              }}
            />
          </div>

          {/* Propulsion System */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Propulsion System:</label>
            <select
              value={propulsionType}
              onChange={(e) => setPropulsionType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #4b5563",
                background: "#374151",
                color: "white",
              }}
            >
              <option value="chemical">Chemical Propulsion</option>
              <option value="ion">Ion Drive</option>
              <option value="nuclear">Nuclear Thermal</option>
            </select>
          </div>

          {/* Role Distribution */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Role Distribution:</label>
            <select
              value={roleSplit}
              onChange={(e) => setRoleSplit(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #4b5563",
                background: "#374151",
                color: "white",
              }}
            >
              <option value="equal">Equal Distribution</option>
              <option value="science-heavy">Science Heavy</option>
              <option value="comm-heavy">Communication Heavy</option>
              <option value="specialized">Specialized Roles</option>
            </select>
          </div>

          {/* Delta-V */}
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Delta-V Budget (km/s):</label>
            <input
              type="number"
              step="0.01"
              value={deltaV}
              onChange={(e) => setDeltaV(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #4b5563",
                background: "#374151",
                color: "white",
              }}
            />
          </div>
        </div>
      </div>

      {/* Step 1: Feasibility Analysis */}
      {!feasibilityResult && (
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={handleFeasibilityCheck}
            disabled={isAnalyzing}
            style={{
              width: "100%",
              padding: "16px",
              background: isAnalyzing ? "#6b7280" : "linear-gradient(45deg, #f59e0b, #d97706)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {isAnalyzing ? "ANALYZING MISSION FEASIBILITY..." : "ANALYZE MISSION FEASIBILITY"}
          </button>
        </div>
      )}

      {/* Feasibility Results */}
      {feasibilityResult && (
        <div
          style={{
            background: feasibilityResult.feasible ? "#064e3b" : "#7f1d1d",
            padding: "24px",
            borderRadius: "12px",
            border: `2px solid ${feasibilityResult.feasible ? "#10b981" : "#ef4444"}`,
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            {feasibilityResult.feasible ? (
              <CheckCircle size={32} color="#10b981" />
            ) : (
              <AlertTriangle size={32} color="#ef4444" />
            )}
            <h2 style={{ color: feasibilityResult.feasible ? "#10b981" : "#ef4444", margin: 0, fontSize: "24px" }}>
              {feasibilityResult.feasible ? "MISSION APPROVED" : "MISSION REJECTED"}
            </h2>
          </div>

          <p style={{ color: "white", marginBottom: "20px" }}>{feasibilityResult.reason}</p>

          {/* Mission Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <span>Success Probability</span>
              <div>{((feasibilityResult.success_probability ?? 0) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span>Delta-V Required</span>
              <div>{(feasibilityResult.delta_v ?? 0).toFixed(2)} km/s</div>
            </div>
            <div>
              <span>Time of Flight</span>
              <div>{(feasibilityResult.time_of_flight ?? 0).toFixed(0)} days</div>
            </div>
            <div>
              <span>Fuel Required</span>
              <div>{(feasibilityResult.fuel_required ?? 0).toFixed(1)} kg</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            {missionApproved && (
              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: isLaunching ? "#6b7280" : "linear-gradient(45deg, #10b981, #059669)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isLaunching ? "not-allowed" : "pointer",
                }}
              >
                {isLaunching ? " LAUNCHING..." : "LAUNCH MISSION"}
              </button>
            )}

            <button
              onClick={resetForm}
              style={{
                flex: missionApproved ? 0.5 : 1,
                padding: "16px",
                background: "#374151",
                color: "white",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Plan New Mission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
