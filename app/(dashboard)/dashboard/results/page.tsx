"use client";

import { useEffect, useState } from "react";

import ResultsCard from "@/components/retirement/ResultsCard";
import RSIIndicator from "@/components/retirement/RSIIndicator";
import GrowthChart from "@/components/retirement/GrowthChart";
import RecommendationCard from "@/components/retirement/RecommendationCard";

export default function ResultsPage() {

  const [data, setData] = useState<{
    estimatedSavings: number;
    yearsToRetirement: number;
    rsi: number;
  } | null>(null);

  useEffect(() => {

    const stored =
      localStorage.getItem("simulationResult");

    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(JSON.parse(stored));
    }

  }, []);

  if (!data) {
    return (
      <div className="p-6">
        Loading results...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Retirement Results
      </h1>

      <ResultsCard data={data} />

      <RSIIndicator rsi={data.rsi} />

      <GrowthChart data={data} />

      <RecommendationCard rsi={data.rsi} />

    </div>
  );
}