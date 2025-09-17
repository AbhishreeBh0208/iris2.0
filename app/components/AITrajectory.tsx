"use client";

import { useState } from "react";
import { Rocket, Target, Gauge, Users, Fuel, Calculator, BarChart3, MapPin } from "lucide-react";

interface MissionParams {
  target_name: string;
  intercept_epoch: number;
  swarm_size: number;
  role_split: string;
  propulsion_type: string;
}

interface TrajectoryData {
  status: string;
  mission_id: string;
  calculations: {
    delta_v: number;
    time_of_flight: number;
    fuel_required: number;
    success_probability: number;
  };
  trajectory_points: number;
  trajectory_file: string;
}

export default function AITrajectoryComponent() {
  const [missionParams, setMissionParams] = useState<MissionParams>({
    target_name: "2I/Borisov",
    intercept_epoch: 2458765.5,
    swarm_size: 12,
    role_split: "balanced",
    propulsion_type: "chemical"
  });

  const [trajectoryData, setTrajectoryData] = useState<TrajectoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSimulation = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URL}/ai_trajectory/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(missionParams),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTrajectoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate trajectory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ 
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        border: "1px solid #334155"
      }}>
        <h2 style={{ 
          color: "#f1f5f9", 
          marginBottom: "24px", 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          fontSize: "24px",
          fontWeight: "600"
        }}>
          <Rocket size={28} style={{ color: "#60a5fa" }} />
          AI Trajectory Simulation
        </h2>

        {/* Mission Parameters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
          gap: "20px",
          marginBottom: "24px"
        }}>
          <div>
            <label style={{ color: "#cbd5e1", marginBottom: "8px", display: "block" }}>
              <Target size={16} style={{ display: "inline", marginRight: "8px" }} />
              Target Name
            </label>
            <input
              type="text"
              value={missionParams.target_name}
              onChange={(e) => setMissionParams({...missionParams, target_name: e.target.value})}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#334155",
                color: "#f1f5f9",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ color: "#cbd5e1", marginBottom: "8px", display: "block" }}>
              <Calculator size={16} style={{ display: "inline", marginRight: "8px" }} />
              Intercept Epoch (JD)
            </label>
            <input
              type="number"
              value={missionParams.intercept_epoch}
              onChange={(e) => setMissionParams({...missionParams, intercept_epoch: parseFloat(e.target.value)})}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#334155",
                color: "#f1f5f9",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ color: "#cbd5e1", marginBottom: "8px", display: "block" }}>
              <Users size={16} style={{ display: "inline", marginRight: "8px" }} />
              Swarm Size
            </label>
            <input
              type="number"
              value={missionParams.swarm_size}
              onChange={(e) => setMissionParams({...missionParams, swarm_size: parseInt(e.target.value)})}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#334155",
                color: "#f1f5f9",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ color: "#cbd5e1", marginBottom: "8px", display: "block" }}>
              <BarChart3 size={16} style={{ display: "inline", marginRight: "8px" }} />
              Role Split
            </label>
            <select
              value={missionParams.role_split}
              onChange={(e) => setMissionParams({...missionParams, role_split: e.target.value})}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#334155",
                color: "#f1f5f9",
                fontSize: "14px"
              }}
            >
              <option value="balanced">Balanced</option>
              <option value="exploration">Exploration</option>
              <option value="science">Science</option>
              <option value="communication">Communication</option>
            </select>
          </div>

          <div>
            <label style={{ color: "#cbd5e1", marginBottom: "8px", display: "block" }}>
              <Fuel size={16} style={{ display: "inline", marginRight: "8px" }} />
              Propulsion Type
            </label>
            <select
              value={missionParams.propulsion_type}
              onChange={(e) => setMissionParams({...missionParams, propulsion_type: e.target.value})}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#334155",
                color: "#f1f5f9",
                fontSize: "14px"
              }}
            >
              <option value="chemical">Chemical</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="ion">Ion</option>
            </select>
          </div>
        </div>

        {/* Simulate Button */}
        <button
          onClick={handleSimulation}
          disabled={loading}
          style={{
            background: loading ? "#475569" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            border: "none",
            padding: "14px 28px",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s ease"
          }}
        >
          <Rocket size={18} />
          {loading ? "Generating Trajectory..." : "Generate AI Trajectory"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: "#dc2626",
          color: "white",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #b91c1c"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Display */}
      {trajectoryData && (
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #10b981"
        }}>
          <h3 style={{ 
            color: "#ecfdf5", 
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <MapPin size={24} />
            Mission: {trajectoryData.mission_id}
          </h3>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "16px",
            marginBottom: "20px"
          }}>
            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              padding: "16px", 
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ color: "#a7f3d0", fontSize: "12px", marginBottom: "4px" }}>DELTA-V</div>
              <div style={{ color: "#ecfdf5", fontSize: "24px", fontWeight: "bold" }}>
                {trajectoryData.calculations.delta_v} km/s
              </div>
            </div>

            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              padding: "16px", 
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ color: "#a7f3d0", fontSize: "12px", marginBottom: "4px" }}>MISSION TIME</div>
              <div style={{ color: "#ecfdf5", fontSize: "24px", fontWeight: "bold" }}>
                {trajectoryData.calculations.time_of_flight.toFixed(1)} days
              </div>
            </div>

            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              padding: "16px", 
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ color: "#a7f3d0", fontSize: "12px", marginBottom: "4px" }}>FUEL REQUIRED</div>
              <div style={{ color: "#ecfdf5", fontSize: "24px", fontWeight: "bold" }}>
                {trajectoryData.calculations.fuel_required} kg
              </div>
            </div>

            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              padding: "16px", 
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ color: "#a7f3d0", fontSize: "12px", marginBottom: "4px" }}>SUCCESS RATE</div>
              <div style={{ color: "#ecfdf5", fontSize: "24px", fontWeight: "bold" }}>
                {(trajectoryData.calculations.success_probability * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ 
              background: "rgba(255,255,255,0.1)", 
              padding: "16px", 
              borderRadius: "8px",
              textAlign: "center"
            }}>
              <div style={{ color: "#a7f3d0", fontSize: "12px", marginBottom: "4px" }}>TRAJECTORY POINTS</div>
              <div style={{ color: "#ecfdf5", fontSize: "24px", fontWeight: "bold" }}>
                {trajectoryData.trajectory_points}
              </div>
            </div>
          </div>

          <div style={{ 
            background: "rgba(255,255,255,0.1)", 
            padding: "16px", 
            borderRadius: "8px",
            marginTop: "16px"
          }}>
            <div style={{ color: "#a7f3d0", fontSize: "12px", marginBottom: "8px" }}>STATUS</div>
            <div style={{ color: "#ecfdf5", fontSize: "16px" }}>
              
              {trajectoryData.status.toUpperCase()} - Trajectory data generated and saved
            </div>
            <div style={{ color: "#a7f3d0", fontSize: "12px", marginTop: "8px" }}>
              Data saved to: {trajectoryData.trajectory_file.split('\\').pop()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
