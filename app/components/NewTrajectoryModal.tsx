"use client";

import { useState } from "react";
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";

interface FeasibilityResult {
  feasible: boolean;
  reason: string;
  success_probability: number;
  delta_v: number;
  time_of_flight: number;
  fuel_required: number;
}

export default function NewTrajectoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState("Earth");
  const [days, setDays] = useState(30);
  const [swarms, setSwarms] = useState(12);
  const [deltaV, setDeltaV] = useState(0.8);
  const [angle, setAngle] = useState(45);
  const [roleSplit, setRoleSplit] = useState("equal");
  const [propulsionType, setPropulsionType] = useState("chemical");
  
  // New state for feasibility flow
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feasibilityResult, setFeasibilityResult] = useState<FeasibilityResult | null>(null);
  const [missionApproved, setMissionApproved] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleFeasibilityCheck = async () => {
    setIsAnalyzing(true);
    setFeasibilityResult(null);
    
    // Convert current date to Julian Date for intercept epoch
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
    const julianDate = (targetDate.getTime() / 86400000) + 2440587.5;
    
    const params = {
      target_name: target,
      intercept_epoch: julianDate,
      swarm_size: swarms,
      role_split: roleSplit,
      propulsion_type: propulsionType,
    };

    try {
      // Call new feasibility endpoint
      const res = await fetch("http://localhost:8000/api/check-feasibility", {
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
        fuel_required: 0
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
      success_probability: feasibilityResult?.success_probability || 0.75,
      time_of_flight: feasibilityResult?.time_of_flight || days
    };

    try {
      // Call backend simulation endpoint
      const res = await fetch("http://localhost:8000/trajectory/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      // Open in new tab with scenario data
      const url = `/solarsystem`;
      window.open(url, "_blank");
      setIsOpen(false);
      // Reset modal state
      setFeasibilityResult(null);
      setMissionApproved(false);
    } catch (error) {
      console.error("Launch failed:", error);
    } finally {
      setIsLaunching(false);
    }
  };

  const resetModal = () => {
    setFeasibilityResult(null);
    setMissionApproved(false);
    setIsAnalyzing(false);
    setIsLaunching(false);
  };

  return (
    <div>
      <button
        onClick={() => {setIsOpen(true); resetModal();}}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        <Plus size={18} /> New Trajectory
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div style={{ 
            background: "#1f2937", 
            padding: 24, 
            borderRadius: 8, 
            width: 500,
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <h2 style={{ color: "white", marginBottom: 16 }}>Mission Planning Control</h2>

            {/* Mission Parameters Section */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: "#60a5fa", marginBottom: 12 }}>Mission Parameters</h3>
              
              <label style={{ color: "white", display: "block", marginBottom: 4 }}>Target:</label>
              <select 
                value={target} 
                onChange={(e) => setTarget(e.target.value)} 
                style={{ width: "100%", marginBottom: 12, padding: "6px", borderRadius: 4 }}
              >
                <option>Earth</option>
                <option>Mars</option>
                <option>Jupiter</option>
                <option>Saturn</option>
                <option>Venus</option>
                <option>Mercury</option>
              </select>

              <label style={{ color: "white", display: "block", marginBottom: 4 }}>Duration (days):</label>
              <input 
                type="number" 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))} 
                style={{ width: "100%", marginBottom: 12, padding: "6px", borderRadius: 4 }} 
              />

              <label style={{ color: "white", display: "block", marginBottom: 4 }}>Swarm Count:</label>
              <input 
                type="number" 
                value={swarms} 
                onChange={(e) => setSwarms(Number(e.target.value))} 
                style={{ width: "100%", marginBottom: 12, padding: "6px", borderRadius: 4 }} 
              />

              <label style={{ color: "white", display: "block", marginBottom: 4 }}>Propulsion Type:</label>
              <select 
                value={propulsionType} 
                onChange={(e) => setPropulsionType(e.target.value)} 
                style={{ width: "100%", marginBottom: 12, padding: "6px", borderRadius: 4 }}
              >
                <option value="chemical">Chemical</option>
                <option value="ion">Ion Drive</option>
                <option value="nuclear">Nuclear</option>
              </select>

              <label style={{ color: "white", display: "block", marginBottom: 4 }}>Role Distribution:</label>
              <select 
                value={roleSplit} 
                onChange={(e) => setRoleSplit(e.target.value)} 
                style={{ width: "100%", marginBottom: 12, padding: "6px", borderRadius: 4 }}
              >
                <option value="equal">Equal Distribution</option>
                <option value="science-heavy">Science Heavy</option>
                <option value="comm-heavy">Communication Heavy</option>
                <option value="specialized">Specialized Roles</option>
              </select>
            </div>

            {/* Step 1: Feasibility Analysis */}
            {!feasibilityResult && (
              <button
                onClick={handleFeasibilityCheck}
                disabled={isAnalyzing}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: isAnalyzing ? "#6b7280" : "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: isAnalyzing ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                {isAnalyzing ? "🔍 ANALYZING MISSION..." : "🚀 ANALYZE FEASIBILITY"}
              </button>
            )}

            {/* Feasibility Results */}
            {feasibilityResult && (
              <div style={{ 
                marginTop: 16, 
                padding: 16, 
                background: feasibilityResult.feasible ? "#064e3b" : "#7f1d1d",
                borderRadius: 6,
                border: `2px solid ${feasibilityResult.feasible ? "#10b981" : "#ef4444"}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  {feasibilityResult.feasible ? (
                    <CheckCircle size={24} color="#10b981" />
                  ) : (
                    <AlertTriangle size={24} color="#ef4444" />
                  )}
                  <h3 style={{ 
                    color: feasibilityResult.feasible ? "#10b981" : "#ef4444",
                    margin: 0
                  }}>
                    {feasibilityResult.feasible ? "MISSION APPROVED" : "MISSION REJECTED"}
                  </h3>
                </div>

                <p style={{ color: "white", marginBottom: 12 }}>
                  {feasibilityResult.reason}
                </p>

                <div style={{ color: "#d1d5db", fontSize: "14px" }}>
                  <div>Success Probability: {(feasibilityResult.success_probability * 100).toFixed(1)}%</div>
                  <div>Delta-V Required: {feasibilityResult.delta_v.toFixed(2)} km/s</div>
                  <div>Time of Flight: {feasibilityResult.time_of_flight.toFixed(0)} days</div>
                  <div>Fuel Required: {feasibilityResult.fuel_required.toFixed(1)} kg</div>
                </div>

                {/* Step 2: Launch Mission (only if approved) */}
                {missionApproved && (
                  <button
                    onClick={handleLaunch}
                    disabled={isLaunching}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: isLaunching ? "#6b7280" : "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: isLaunching ? "not-allowed" : "pointer",
                      marginTop: 12,
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {isLaunching ? "🚀 LAUNCHING..." : "🚀 LAUNCH MISSION"}
                  </button>
                )}

                {/* Reset button */}
                <button
                  onClick={resetModal}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    marginTop: 8
                  }}
                >
                  Plan New Mission
                </button>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => {setIsOpen(false); resetModal();}}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                color: "#9ca3af",
                border: "none",
                fontSize: "24px",
                cursor: "pointer"
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
