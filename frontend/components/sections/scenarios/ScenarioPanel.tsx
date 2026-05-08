"use client";

import { useState, useEffect } from "react";
import ProjectionForm from "../projection/ProjectionForm";
import ProjectionResults, { ProjectionResult } from "../projection/ProjectionResults";
import { ProjectionInputs } from "@/types/ProjectionInputs";
import { ScenarioItem } from "@/types/scenario";
import { hasOverrides } from "./scenario-utils";
import NudgeSuggestions from "@/components/ui/NudgeSuggestions";
import InputFieldNudge from "@/components/ui/InputFieldNudge";
import { useSettings } from "@/contexts/SettingsContext";

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
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());
  const { settings } = useSettings();

  const currentInputs: ProjectionInputs = isBase ? baseInputs : scenario?.inputs || baseInputs;
  const currentResults = isBase ? localResults : scenario?.results || null;

  const analyzeWithML = async () => {
    console.log('analyzeWithML called', { isBase, baseInputs, scenarioId: scenario?.id });
    
    if (!isBase || !baseInputs) {
      console.log('Early return: !isBase || !baseInputs');
      return;
    }

    setAnalyzing(true);
    try {
      const requestBody = {
        baseSimulationId: scenario?.id || 'base-simulation',
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
      };
      
      console.log('Sending ML analysis request:', requestBody);
      
      const response = await fetch('/api/ml/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('ML analysis response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ML analysis response data:', data);
        setSuggestions(data.data.suggestions);
        console.log('Suggestions set:', data.data.suggestions);
      } else {
        console.error('ML analysis failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('ML analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    const updatedInputs = { ...currentInputs };
    
    switch (suggestion.type) {
      case 'contribution':
        updatedInputs.monthlyContribution = String(Math.round(Number(currentInputs.monthlyIncome) * 0.15));
        break;
      case 'retirement_age':
        updatedInputs.retirementAge = String(Math.min(Number(suggestion.suggested_value), 65));
        break;
      case 'strategy':
        updatedInputs.projectionStrategy = String(suggestion.suggested_value) as ProjectionInputs['projectionStrategy'];
        break;
      case 'inflation':
        updatedInputs.inflationRate = String(suggestion.suggested_value);
        break;
    }

    handleChange(updatedInputs);
  };

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

  const handleChange = (data: ProjectionInputs) => {
    if (!isBase && scenario) {
      onChange(scenario.id, data);
    }
  };

  const handleDismissNudge = (suggestionId: string) => {
    setDismissedNudges(prev => new Set([...prev, suggestionId]));
  };

  const getActiveInlineNudges = () => {
    if (!settings.inlineNudgesEnabled || !suggestions) return [];
    
    return suggestions.filter(suggestion => 
      !dismissedNudges.has(suggestion.id) && 
      ['contribution', 'retirement_age', 'strategy', 'inflation'].includes(suggestion.type)
    );
  };

  const renderInlineNudge = (fieldType: string, inputElement: React.ReactNode) => {
    const activeNudges = getActiveInlineNudges();
    const nudge = activeNudges.find(s => s.type === fieldType);
    
    if (!nudge) return inputElement;
    
    return (
    <div className="relative md:flex md:flex-col md:items-start">
        {inputElement}
        <InputFieldNudge
          type={nudge.type}
          currentValue={nudge.current_value}
          suggestedValue={nudge.suggested_value}
          title={nudge.title}
          description={nudge.description}
          impact={nudge.impact}
          reasoning={nudge.reasoning}
          onApply={() => applySuggestion(nudge)}
          onDismiss={() => handleDismissNudge(nudge.id)}
          className="mt-2"
        />
      </div>
    );
  };

  // Trigger ML analysis when component mounts or inputs change for base scenario
  useEffect(() => {
    console.log('useEffect triggered', { isBase, baseInputs });
    if (isBase && baseInputs) {
      console.log('Calling analyzeWithML from useEffect');
      analyzeWithML();
    }
  }, [isBase, baseInputs]);

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <div className="p-4 sm:p-6 border bg-card rounded-2xl">
        <div className="relative">
          <ProjectionForm
            inputs={currentInputs}
            setInputs={handleChange}
            onCalculate={handleRun}
            onReset={() => {}}
            isLoading={loading}
          />
        </div>

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

      <div className="p-6 border bg-card rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Processing scenario with ML and fail-safe checks...
          </div>
        ) : (
          <div className="space-y-6">
            {isBase && settings.suggestionCardsEnabled && suggestions && (
              <NudgeSuggestions
                suggestions={suggestions}
                isLoading={analyzing}
                onApplySuggestion={applySuggestion}
              />
            )}

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
