"use client";

import { useState } from "react";
import ProjectionForm from "../projection/ProjectionForm";
import ProjectionResults, { ProjectionResult } from "../projection/ProjectionResults";
import { ProjectionInputs } from "@/types/ProjectionInputs";
import { ScenarioItem } from "@/types/scenario";
import { hasOverrides } from "./scenario-utils";
import NudgeSuggestions from "@/components/ui/NudgeSuggestions";

interface ScenarioPanelProps {
  isBase: boolean;
  baseInputs: ProjectionInputs;
  scenario: ScenarioItem | null;
  onChange: (id: string, data: ProjectionInputs) => void;
  onUpdateResult: (id: string, result: ProjectionResult) => void;
  onAddScenario: () => void;
  onSave: () => void;
}

export default function ScenarioPanel({
  isBase,
  baseInputs,
  scenario,
  onChange,
  onUpdateResult,
  onAddScenario,
  onSave,
}: ScenarioPanelProps) {
  const [localResults, setLocalResults] = useState<ProjectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Current inputs
  const currentInputs: ProjectionInputs = isBase ? baseInputs : scenario?.inputs || baseInputs;
  const currentResults = isBase ? localResults : scenario?.results || null;

  // ML Analysis function
  const analyzeWithML = async () => {
    if (!isBase || !baseInputs) return;

    setAnalyzing(true);
    try {
      const response = await fetch('/api/ml/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseSimulationId: scenario?.id || '',
          currentInputs: {
            age: Number(currentInputs.currentAge),
            retirementAge: Number(currentInputs.retirementAge),
            monthlyIncome: Number(currentInputs.monthlyIncome),
            monthlyContribution: Number(currentInputs.monthlyContribution),
            currentSavings: Number(currentInputs.currentSavings || 0),
            inflationRate: Number(currentInputs.inflationRate || 0),
            projectionStrategy: currentInputs.projectionStrategy,
            growthModel: currentInputs.growthModel,
            incomeType: currentInputs.incomeType,
            savingBehavior: currentInputs.savingBehavior,
            lifestyle: "moderate"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error('ML analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Apply suggestion function
  const applySuggestion = (suggestion: any) => {
    const updatedInputs = { ...currentInputs };
    
    switch (suggestion.type) {
      case 'contribution':
        updatedInputs.monthlyContribution = Math.round(Number(currentInputs.monthlyIncome) * 0.15);
        break;
      case 'retirement_age':
        updatedInputs.retirementAge = Math.min(Number(suggestion.suggested_value), 65);
        break;
      case 'strategy':
        updatedInputs.projectionStrategy = String(suggestion.suggested_value);
        break;
      case 'inflation':
        updatedInputs.inflationRate = Number(suggestion.suggested_value);
        break;
    }

    handleChange(updatedInputs);
  };

  // Run simulation function
  const handleRun = async () => {
    if (!isBase) {
      const valid = hasOverrides(baseInputs, currentInputs);
      if (!valid) {
        setError("Modify at least one field to create a scenario.");
        return;
      }
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(currentInputs.currentAge),
          retirementAge: Number(currentInputs.retirementAge),
          monthlyIncome: Number(currentInputs.monthlyIncome),
          monthlyContribution: Number(currentInputs.monthlyContribution),
          currentSavings: Number(currentInputs.currentSavings || 0),
          inflationRate: Number(currentInputs.inflationRate || 0),
          projectionStrategy: currentInputs.projectionStrategy,
          growthModel: currentInputs.growthModel,
          incomeType: currentInputs.incomeType,
          savingBehavior: currentInputs.savingBehavior,
          lifestyle: "moderate"
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error();
      }

      const result: ProjectionResult = {
        projectedSavings: data.data.projectedSavings,
        estimatedMonthlyIncome: data.data.estimatedMonthlyIncome,
        inflationAdjustedValue: data.data.inflationAdjustedValue,
        rsiScore: data.data.rsiScore,
        meta: data.data.meta
      };

      if (isBase) {
        setLocalResults(result);
      } else if (scenario) {
        onUpdateResult(scenario.id, result);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (data: ProjectionInputs) => {
    if (!isBase && scenario) {
      onChange(scenario.id, data);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LEFT: FORM */}
      <div className="p-6 border bg-card rounded-2xl">
        <ProjectionForm
          inputs={currentInputs}
          setInputs={handleChange}
          onCalculate={handleRun}
          onReset={() => {}}
          isLoading={loading}
        />

        {!isBase && (
          <p className="mt-3 text-xs text-muted-foreground">
            Only modified values override the base simulation.
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {/* RIGHT: RESULTS */}
      <div className="p-6 border bg-card rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Processing scenario with ML and fail-safe checks...
          </div>
        ) : (
          <div className="space-y-6">
            {/* ML Suggestions */}
            {isBase && suggestions && (
              <NudgeSuggestions
                suggestions={suggestions}
                isLoading={analyzing}
                onApplySuggestion={applySuggestion}
              />
            )}

            {/* Projection Results */}
            <ProjectionResults
              results={currentResults}
              isDirty={false}
              onSave={onSave}
              saveLabel={isBase ? "Update Base Simulation" : "Save Scenario"}
              onAddScenario={onAddScenario}
            />
          </div>
        )}
      </div>
    </div>
  );
}
