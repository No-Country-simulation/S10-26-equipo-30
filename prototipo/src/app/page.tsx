import type { Metadata } from "next";
import { DashboardSession } from "@/components/simulation/dashboard-session";
import { SimulationDashboard } from "@/components/simulation/simulation-dashboard";
import { simulationDashboard } from "@/lib/simulation-dashboard-data";

export const metadata: Metadata = {
  title: "NoCountry · Simulación",
};

export default function Home() {
  return (
    <main className="page-shell sim-page">
      <DashboardSession />
      <SimulationDashboard data={simulationDashboard} />
    </main>
  );
}
