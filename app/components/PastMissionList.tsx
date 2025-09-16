"use client";

import PastMissionCard from "./PastMissionCard";

const dummyMissions = [
  {
    id: "1",
    name: "Alpha-1 Earth LEO Test",
    date: "2025-07-02",
    swarmCount: 24,
    deltaV: 0.5,
    duration: 48,
    outcome: "Success",
    insights:
      "Swarm maintained stable formation with efficient delta-v usage.",
    swarmHealth: [
      { status: "Active", value: 20 },
      { status: "Lost", value: 2 },
      { status: "Inactive", value: 2 },
    ],
    velocityOverTime: [
      { step: 0, velocity: 7.6 },
      { step: 1, velocity: 7.7 },
      { step: 2, velocity: 7.65 },
      { step: 3, velocity: 7.68 },
    ],
  },
  {
    id: "2",
    name: "Mars Transfer Trial",
    date: "2025-08-15",
    swarmCount: 12,
    deltaV: 1.2,
    duration: 120,
    outcome: "Partial Failure",
    insights:
      "Half of the swarm deviated due to insufficient delta-v reserves.",
    swarmHealth: [
      { status: "Active", value: 6 },
      { status: "Lost", value: 4 },
      { status: "Inactive", value: 2 },
    ],
    velocityOverTime: [
      { step: 0, velocity: 11.2 },
      { step: 1, velocity: 11.4 },
      { step: 2, velocity: 11.1 },
      { step: 3, velocity: 10.9 },
    ],
  },
];

export default function PastMissionsList() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ color: "#38bdf8", marginBottom: 16, fontSize: "28px", fontWeight: 500 }}>Past Missions</h2>
      {dummyMissions.map((mission) => (
        <PastMissionCard key={mission.id} mission={mission} />
      ))}
    </div>
  );
}