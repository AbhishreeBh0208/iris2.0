"use client";

import Sidebar from "../components/sidebar";
import NewMissionForm from "../components/NewMissionForm";

export default function PastMissionsPage() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, background: "#0b1220", height: "100vh", overflowY: "auto" }}>
        <NewMissionForm />
      </div>
    </div>
  );
}
