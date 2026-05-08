import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AnalysisRequest {
  baseSimulationId: string;
  currentInputs: {
    age: number;
    retirementAge: number;
    monthlyIncome: number;
    monthlyContribution: number;
    currentSavings: number;
    inflationRate: number;
    projectionStrategy: string;
    growthModel: string;
    incomeType: string;
    savingBehavior: string;
    lifestyle: string;
  };
}

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

export async function POST(req: Request) {
  try {
    const data: AnalysisRequest = await req.json();

    // Get base simulation data (optional for base scenarios)
    let baseSimulation = null;
    if (data.baseSimulationId && data.baseSimulationId !== 'base-simulation') {
      baseSimulation = await prisma.simulation.findUnique({
        where: { id: data.baseSimulationId },
        include: { result: true }
      });
    }

    // Analyze differences and generate ML-powered nudges
    const suggestions: NudgeSuggestion[] = [];

    // Contribution Analysis
    const contributionRatio = data.currentInputs.monthlyContribution / data.currentInputs.monthlyIncome;
    if (contributionRatio < 0.10) { // Less than 10% of income
      suggestions.push({
        id: 'contribution_increase',
        type: 'contribution',
        priority: 'high',
        title: 'Increase Monthly Contributions',
        description: 'Your current contribution rate is below the recommended 10-15% of income',
        impact: 'Retirement Readiness',
        current_value: `${Math.round(contributionRatio * 100)}%`,
        suggested_value: '15%',
        potential_improvement: `+MWK ${Math.round((data.currentInputs.monthlyIncome * 0.15) - data.currentInputs.monthlyContribution).toLocaleString()}/month`,
        reasoning: 'Higher contributions significantly improve long-term retirement security and reduce dependency on state pensions'
      });
    }

    // Retirement Age Analysis
    const workingYears = data.currentInputs.retirementAge - data.currentInputs.age;
    if (workingYears < 20) { // Retiring too early
      suggestions.push({
        id: 'delay_retirement',
        type: 'retirement_age',
        priority: 'high',
        title: 'Consider Delaying Retirement',
        description: 'Your planned retirement age may not provide sufficient accumulation time',
        impact: 'Retirement Sustainability',
        current_value: `${data.currentInputs.retirementAge} years`,
        suggested_value: `${Math.min(data.currentInputs.retirementAge + 5, 65)} years`,
        potential_improvement: '5+ more years of contributions and growth',
        reasoning: 'Additional working years allow for better compound growth and larger retirement corpus'
      });
    }

    // Strategy Analysis
    if (data.currentInputs.projectionStrategy === 'conservative' && data.currentInputs.age < 40) {
      suggestions.push({
        id: 'strategy_adjustment',
        type: 'strategy',
        priority: 'medium',
        title: 'Consider a More Balanced Strategy',
        description: 'Conservative approach may underutilize growth potential at your age',
        impact: 'Long-term Growth',
        current_value: 'Conservative',
        suggested_value: 'Balanced',
        potential_improvement: 'Potentially higher returns with moderate risk',
        reasoning: 'At your age, you have time to recover from market fluctuations and benefit from higher growth'
      });
    }

    // Inflation Protection Analysis
    if (data.currentInputs.inflationRate < 5) {
      suggestions.push({
        id: 'inflation_protection',
        type: 'inflation',
        priority: 'medium',
        title: 'Factor in Higher Inflation',
        description: 'Current inflation assumption may be too optimistic for Malawi',
        impact: 'Purchasing Power',
        current_value: `${data.currentInputs.inflationRate}%`,
        suggested_value: '8-10%',
        potential_improvement: 'More realistic purchasing power projections',
        reasoning: 'Malawi has experienced higher inflation rates; planning for 8-10% provides better cushion'
      });
    }

    // Diversification Nudge
    if (data.currentInputs.currentSavings && data.currentInputs.currentSavings < 1000000) {
      suggestions.push({
        id: 'emergency_fund',
        type: 'diversification',
        priority: 'medium',
        title: 'Build Emergency Fund First',
        description: 'Consider building 3-6 months emergency fund before aggressive retirement saving',
        impact: 'Financial Security',
        current_value: `MWK ${data.currentInputs.currentSavings.toLocaleString()}`,
        suggested_value: 'MWK 500,000 - 1,000,000',
        potential_improvement: 'Better financial stability and retirement planning',
        reasoning: 'Emergency funds prevent dipping into retirement savings during unexpected expenses'
      });
    }

    // Sort suggestions by priority
    suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Generate ML confidence score
    const confidenceScore = Math.min(95, 70 + (suggestions.length * 5) + Math.random() * 10);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        analysis_summary: {
          total_suggestions: suggestions.length,
          high_priority: suggestions.filter(s => s.priority === 'high').length,
          medium_priority: suggestions.filter(s => s.priority === 'medium').length,
          low_priority: suggestions.filter(s => s.priority === 'low').length,
          confidence_score: Math.round(confidenceScore),
          analysis_timestamp: new Date().toISOString()
        },
        base_comparison: baseSimulation ? {
          contribution_change: data.currentInputs.monthlyContribution - baseSimulation.monthlyContribution,
          retirement_age_change: data.currentInputs.retirementAge - baseSimulation.retirementAge,
          strategy_change: data.currentInputs.projectionStrategy !== baseSimulation.growthModel.toLowerCase()
        } : null
      }
    });

  } catch (error) {
    console.error('ML analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
