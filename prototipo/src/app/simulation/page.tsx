import { SimulationDashboard } from "@/components/simulation/simulation-dashboard";
import { simulationDashboard } from "@/lib/simulation-dashboard-data";

export default function SimulationPage() {
  return (
    <main className="page-shell page-shell--wide sim-page">
      <SimulationDashboard data={simulationDashboard} />
    </main>
  );
}
