"use client"

import { useState } from "react"
import Link from "next/link"

export default function StrategiesPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  const strategies = [
    {
      id: "conservative",
      name: "Conservative Strategy",
      description: "Lower growth assumptions with higher inflation sensitivity for safer long-term stability",
      whoFor: "Risk-averse individuals, those close to retirement, or anyone prioritizing capital preservation",
      calculations: {
        returnRate: "6% annual return (15% lower than balanced)",
        inflationAdjustment: "+3% inflation buffer",
        contributionMultiplier: "100% of contributions",
        riskLevel: "Low",
        timeHorizon: "Best for 10+ years to retirement"
      },
      pros: [
        "Higher safety margin against market downturns",
        "Better protection against inflation surprises",
        "More predictable retirement income",
        "Lower stress during volatile markets"
      ],
      cons: [
        "Lower overall retirement savings",
        "May require higher contributions to reach goals",
        "Potentially missed growth opportunities",
        "Longer accumulation period needed"
      ],
      malawiContext: "Particularly valuable in Malawi's inflation-sensitive economy where purchasing power preservation is crucial for retirees"
    },
    {
      id: "balanced",
      name: "Balanced Strategy",
      description: "Moderate growth assumptions with balanced risk management for steady retirement planning",
      whoFor: "Most individuals seeking a balanced approach between growth and safety",
      calculations: {
        returnRate: "8% annual return (baseline)",
        inflationAdjustment: "Standard inflation rate",
        contributionMultiplier: "100% of contributions",
        riskLevel: "Medium",
        timeHorizon: "Suitable for any time horizon"
      },
      pros: [
        "Good balance of growth and safety",
        "Reasonable retirement projections",
        "Suitable for most risk tolerances",
        "Industry-standard assumptions"
      ],
      cons: [
        "May not optimize for specific situations",
        "Vulnerable to moderate market swings",
        "Requires regular monitoring"
      ],
      malawiContext: "Well-suited for Malawi's growing economy with moderate inflation expectations"
    },
    {
      id: "aggressive",
      name: "Aggressive Strategy",
      description: "Higher growth assumptions with increased volatility for better long-term upside potential",
      whoFor: "Young investors, high-income earners, or those comfortable with market risk",
      calculations: {
        returnRate: "10.8% annual return (35% higher than balanced)",
        inflationAdjustment: "-1% inflation adjustment (assumes lower inflation)",
        contributionMultiplier: "100% of contributions",
        riskLevel: "High",
        timeHorizon: "Best for 15+ years to retirement"
      },
      pros: [
        "Highest potential retirement savings",
        "Best chance of early retirement goals",
        "Outperforms in strong markets",
        "Builds substantial wealth over time"
      ],
      cons: [
        "High volatility and risk",
        "Potential for significant losses",
        "Requires strong emotional discipline",
        "May underperform in poor markets"
      ],
      malawiContext: "Suitable for Malawians investing in high-growth sectors like technology, mining, or export businesses"
    },
    {
      id: "informal",
      name: "Informal Worker Strategy",
      description: "Designed for inconsistent monthly contributions with skipped months and income volatility",
      whoFor: "Informal sector workers, freelancers, small business owners, seasonal workers",
      calculations: {
        returnRate: "7.2% annual return (10% lower due to irregular patterns)",
        inflationAdjustment: "+2% inflation buffer",
        contributionMultiplier: "85% of planned contributions",
        riskLevel: "Medium-High",
        timeHorizon: "Accounts for contribution gaps"
      },
      pros: [
        "Realistic for informal economy",
        "Accounts for missed contributions",
        "Better matches actual saving patterns",
        "Includes income volatility factors"
      ],
      cons: [
        "Lower overall projections",
        "Requires higher nominal contributions",
        "May extend retirement timeline",
        "More complex to track"
      ],
      malawiContext: "Essential for Malawi's large informal sector where 85% of workers have irregular income patterns"
    },
    {
      id: "seasonal",
      name: "Seasonal Income Strategy",
      description: "Optimized for seasonal income patterns with fluctuating contribution cycles",
      whoFor: "Farmers, tourism workers, construction workers, anyone with seasonal business cycles",
      calculations: {
        returnRate: "7.6% annual return (5% lower due to seasonality)",
        inflationAdjustment: "+1% inflation buffer",
        contributionMultiplier: "90% of planned contributions",
        riskLevel: "Medium",
        timeHorizon: "Accounts for seasonal income gaps"
      },
      pros: [
        "Matches seasonal cash flow reality",
        "Better planning for lean months",
        "Accounts for peak earning periods",
        "More accurate yearly projections"
      ],
      cons: [
        "Lower average annual returns",
        "Complex to manage budget",
        "Requires discipline in peak seasons",
        "May need emergency savings buffer"
      ],
      malawiContext: "Perfect for Malawi's agricultural sector where income follows planting/harvest cycles and tourism patterns"
    },
    {
      id: "inflation_stress",
      name: "Inflation Stress Strategy",
      description: "Simulates high inflation environments showing purchasing power erosion effects",
      whoFor: "Everyone - this is a stress test to understand inflation vulnerability",
      calculations: {
        returnRate: "6.4% annual return (20% lower due to inflation drag)",
        inflationAdjustment: "+8% inflation stress test",
        contributionMultiplier: "100% of contributions",
        riskLevel: "High (inflation risk)",
        timeHorizon: "Tests retirement resilience"
      },
      pros: [
        "Shows worst-case inflation scenarios",
        "Helps plan for inflation protection",
        "Identifies vulnerability early",
        "Better emergency planning"
      ],
      cons: [
        "Very conservative projections",
        "May discourage saving efforts",
        "Assumes worst economic conditions",
        "Not for everyday planning"
      ],
      malawiContext: "Crucial for Malawi where inflation has historically reached 30%+ and currency devaluation is a real risk"
    },
    {
      id: "contribution_growth",
      name: "Contribution Growth Strategy",
      description: "Models increasing yearly contributions with salary growth and promotions",
      whoFor: "Young professionals, career climbers, anyone expecting income growth",
      calculations: {
        returnRate: "8% annual return (baseline)",
        inflationAdjustment: "Standard inflation rate",
        contributionMultiplier: "Starts at 100%, grows 7% annually",
        riskLevel: "Medium",
        timeHorizon: "Optimistic growth trajectory"
      },
      pros: [
        "Accounts for career progression",
        "Higher final retirement savings",
        "Realistic for young professionals",
        "Motivates increased saving"
      ],
      cons: [
        "Assumes consistent career growth",
        "May not materialize as planned",
        "Complex to project accurately",
        "Requires income stability"
      ],
      malawiContext: "Suitable for Malawi's growing formal sector where career advancement and salary increases are becoming more common"
    },
    {
      id: "early_retirement",
      name: "Early Retirement Strategy",
      description: "Higher pressure planning with shorter accumulation period for early retirement goals",
      whoFor: "Those aiming to retire before 60, high-income earners, aggressive savers",
      calculations: {
        returnRate: "8.8% annual return (10% higher to compensate shorter timeline)",
        inflationAdjustment: "Standard inflation rate",
        contributionMultiplier: "120% of contributions (requires higher saving rate)",
        riskLevel: "High (time pressure)",
        timeHorizon: "5 years shorter than standard"
      },
      pros: [
        "Achieves early retirement goals",
        "Higher growth assumptions",
        "Motivates aggressive saving",
        "Builds substantial wealth quickly"
      ],
      cons: [
        "Requires very high savings rate",
        "High contribution burden",
        "Less time for compound growth",
        "High stress if goals missed"
      ],
      malawiContext: "Ambitious but achievable for Malawian professionals in high-paying sectors or with multiple income streams"
    },
    {
      id: "sustainability",
      name: "Pension Sustainability Strategy",
      description: "Estimates retirement income duration and long-term pension sustainability",
      whoFor: "Everyone - shows how long retirement savings will last",
      calculations: {
        returnRate: "7.6% annual return (5% conservative for sustainability)",
        inflationAdjustment: "+1.5% inflation buffer",
        contributionMultiplier: "100% of contributions",
        riskLevel: "Medium",
        timeHorizon: "Focuses on retirement duration"
      },
      pros: [
        "Shows realistic retirement duration",
        "Helps plan withdrawal rates",
        "Identifies sustainability gaps",
        "Better long-term planning"
      ],
      cons: [
        "May show shorter retirement than hoped",
        "Conservative assumptions",
        "Requires careful budgeting",
        "Complex sustainability calculations"
      ],
      malawiContext: "Vital for Malawi where pension systems are developing and personal retirement sustainability is crucial"
    }
  ]

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link 
          href="/dashboard/projection" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7l-7-7m14 14l7-7" />
          </svg>
          Back to Projection Calculator
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Pension Projection Strategies
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understand how each strategy works and choose the one that best fits your situation
          </p>
        </div>
      </div>

      {!selectedStrategy ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <div 
              key={strategy.id}
              onClick={() => setSelectedStrategy(strategy.id)}
              className="bg-card border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-primary/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${
                  strategy.id === 'balanced' ? 'bg-blue-500' :
                  strategy.id === 'conservative' ? 'bg-green-500' :
                  strategy.id === 'aggressive' ? 'bg-red-500' :
                  strategy.id === 'informal' ? 'bg-orange-500' :
                  strategy.id === 'seasonal' ? 'bg-yellow-500' :
                  strategy.id === 'inflation_stress' ? 'bg-purple-500' :
                  strategy.id === 'contribution_growth' ? 'bg-indigo-500' :
                  strategy.id === 'early_retirement' ? 'bg-pink-500' :
                  'bg-teal-500'
                }`} />
                <h3 className="text-lg font-semibold">{strategy.name}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {strategy.description}
              </p>
              
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Best for:</span> {strategy.whoFor}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedStrategy(null)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7l-7-7m14 14l7-7" />
              </svg>
              Back to All Strategies
            </button>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStrategyData?.id === 'balanced' ? 'bg-blue-100 text-blue-800' :
              selectedStrategyData?.id === 'conservative' ? 'bg-green-100 text-green-800' :
              selectedStrategyData?.id === 'aggressive' ? 'bg-red-100 text-red-800' :
              selectedStrategyData?.id === 'informal' ? 'bg-orange-100 text-orange-800' :
              selectedStrategyData?.id === 'seasonal' ? 'bg-yellow-100 text-yellow-800' :
              selectedStrategyData?.id === 'inflation_stress' ? 'bg-purple-100 text-purple-800' :
              selectedStrategyData?.id === 'contribution_growth' ? 'bg-indigo-100 text-indigo-800' :
              selectedStrategyData?.id === 'early_retirement' ? 'bg-pink-100 text-pink-800' :
              'bg-teal-100 text-teal-800'
            }`}>
              {selectedStrategyData?.name}
            </div>
          </div>

          {selectedStrategyData && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Strategy Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedStrategyData.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Who This Strategy Is For</h3>
                  <p className="text-muted-foreground">
                    {selectedStrategyData.whoFor}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Malawi Context</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      {selectedStrategyData.malawiContext}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">How It's Calculated</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    {Object.entries(selectedStrategyData.calculations).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span className="text-sm font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Advantages</h3>
                  <div className="space-y-2">
                    {selectedStrategyData.pros.map((pro, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                        <span className="text-sm">{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Considerations</h3>
                  <div className="space-y-2">
                    {selectedStrategyData.cons.map((con, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                        <span className="text-sm">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/dashboard/projection"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try This Strategy
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m0 5l-5-5m6 0V3a2 2 0 002-2h4a2 2 0 002 2v14a2 2 0 002-2h-4a2 2 0 00-2-2V3z" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
