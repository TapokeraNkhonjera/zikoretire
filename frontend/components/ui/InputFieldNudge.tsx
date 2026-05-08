"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  X, 
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface InputFieldNudgeProps {
  type: 'contribution' | 'retirement_age' | 'strategy' | 'inflation' | 'diversification';
  currentValue: string | number;
  suggestedValue: string | number;
  title: string;
  description: string;
  impact: string;
  reasoning: string;
  onApply: () => void;
  onDismiss: () => void;
  className?: string;
}

export default function InputFieldNudge({
  type,
  currentValue,
  suggestedValue,
  title,
  description,
  impact,
  reasoning,
  onApply,
  onDismiss,
  className = ""
}: InputFieldNudgeProps) {
  const [expanded, setExpanded] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'contribution':
        return <Lightbulb className="w-4 h-4" />;
      case 'retirement_age':
        return <Lightbulb className="w-4 h-4" />;
      case 'strategy':
        return <Lightbulb className="w-4 h-4" />;
      case 'inflation':
        return <Lightbulb className="w-4 h-4" />;
      case 'diversification':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className={`relative z-50 ${className}`}>
      <div className="absolute -top-2 -right-2 z-10">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-3 max-w-xs animate-pulse">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="font-semibold text-sm">{title}</span>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs mb-2 opacity-90">{description}</p>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 px-2 text-xs bg-white text-blue-600 hover:bg-gray-100"
              onClick={onApply}
            >
              Apply
            </Button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
              <div className="text-xs">
                <span className="font-medium">Current:</span>
                <span className="ml-1 opacity-90">{currentValue}</span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Suggested:</span>
                <span className="ml-1 font-semibold">{suggestedValue}</span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Impact:</span>
                <span className="ml-1 opacity-90">{impact}</span>
              </div>
              <div className="text-xs bg-white/10 p-2 rounded mt-2">
                <span className="font-medium">Why:</span>
                <p className="mt-1 opacity-90">{reasoning}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Arrow pointing to input */}
        <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-blue-500"></div>
      </div>
    </div>
  );
}
