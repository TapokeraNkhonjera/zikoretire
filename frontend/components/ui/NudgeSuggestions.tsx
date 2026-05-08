"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Shield, 
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface NudgeSuggestion {
  id: string;
  type: 'contribution' | 'retirement_age' | 'strategy' | 'inflation' | 'diversification';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  current_value: number | string;
  suggested_value: number | string;
  potential_improvement: string;
  reasoning: string;
}

interface NudgeSuggestionsProps {
  suggestions: NudgeSuggestion[];
  onApplySuggestion?: (suggestion: NudgeSuggestion) => void;
  isLoading?: boolean;
}

export default function NudgeSuggestions({ 
  suggestions, 
  onApplySuggestion, 
  isLoading = false 
}: NudgeSuggestionsProps) {
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());

  const toggleExpansion = (id: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getIcon = (type: NudgeSuggestion['type']) => {
    switch (type) {
      case 'contribution':
        return <TrendingUp className="w-5 h-5" />;
      case 'retirement_age':
        return <Target className="w-5 h-5" />;
      case 'strategy':
        return <Lightbulb className="w-5 h-5" />;
      case 'inflation':
        return <Shield className="w-5 h-5" />;
      case 'diversification':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: NudgeSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: NudgeSuggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="p-6 border border-border/50 rounded-xl bg-card">
        <div className="text-center text-muted-foreground">
          <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No specific suggestions for this scenario.</p>
          <p className="text-xs mt-2">Your current settings appear to be well-optimized!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">ML-Powered Suggestions</h3>
          <p className="text-sm text-muted-foreground">
            Personalized recommendations to improve your retirement plan
          </p>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  {getIcon(suggestion.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityBadge(suggestion.priority)}`}>
                    {suggestion.priority.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleExpansion(suggestion.id)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                {expandedSuggestions.has(suggestion.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="text-sm mb-3">{suggestion.description}</p>

            {/* Expanded Content */}
            {expandedSuggestions.has(suggestion.id) && (
              <div className="space-y-3 border-t pt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Current Value:</span>
                    <span className="text-muted-foreground ml-1">{suggestion.current_value}</span>
                  </div>
                  <div>
                    <span className="font-medium">Suggested:</span>
                    <span className="text-primary ml-1 font-semibold">{suggestion.suggested_value}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Potential Improvement:</span>
                  <span className="text-green-600 ml-1">{suggestion.potential_improvement}</span>
                </div>

                <div className="text-sm bg-muted/50 p-3 rounded-lg">
                  <span className="font-medium">ML Reasoning:</span>
                  <p className="text-muted-foreground mt-1">{suggestion.reasoning}</p>
                </div>

                {onApplySuggestion && (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => onApplySuggestion(suggestion)}
                  >
                    Apply This Suggestion
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-6 border border-border/50 rounded-xl bg-card">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-sm text-muted-foreground">
              Analyzing your scenario with AI...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
