import SimulationForm from "@/components/sections/retirement/SimulationForm";

export default function SimulationPage() {
  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Retirement Simulation
      </h1>

      <SimulationForm />

    </div>
  );
}