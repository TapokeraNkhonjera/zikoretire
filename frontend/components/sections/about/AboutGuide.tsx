"use client";

import { Rocket, BarChart3, Zap, Settings, TrendingUp, Bot, Target, Lock, Smartphone, Lightbulb, AlertCircle } from "lucide-react";

export default function AboutGuide() {
  const guides = [
    {
      title: "Getting Started",
      description: "Learn how to create your first retirement projection",
      steps: [
        "Create an account or sign in",
        "Enter your personal information (age, retirement age, income)",
        "Set your monthly contribution amount",
        "Choose your projection strategy",
        "Review your personalized results"
      ],
      icon: Rocket
    },
    {
      title: "Understanding Your Results",
      description: "Make sense of your projection data and insights",
      steps: [
        "RSI Score: Retirement Sustainability Index (0-100%)",
        "Projected Savings: Inflation-adjusted future value",
        "Monthly Income: Estimated retirement income",
        "ML Insights: Personalized recommendations",
        "Risk Factors: Areas to improve"
      ],
      icon: BarChart3
    },
    {
      title: "Optimizing Your Plan",
      description: "Strategies to improve your retirement readiness",
      steps: [
        "Increase monthly contributions gradually",
        "Consider delaying retirement if possible",
        "Diversify investment strategies",
        "Monitor inflation impact regularly",
        "Review and adjust annually"
      ],
      icon: Zap
    },
    {
      title: "Advanced Features",
      description: "Unlock powerful tools for comprehensive planning",
      steps: [
        "Save multiple scenarios for comparison",
        "Use ML-powered risk assessment",
        "Access detailed sustainability analysis",
        "Export reports for financial advisors",
        "Set up alerts and notifications"
      ],
      icon: Settings
    }
  ];

  const features = [
    {
      title: "Inflation-Adjusted Calculations",
      description: "All projections account for Malawi's inflation rates, ensuring your future purchasing power is accurately estimated.",
      icon: TrendingUp
    },
    {
      title: "ML-Powered Insights",
      description: "Our machine learning models analyze your data to provide personalized recommendations and risk assessments.",
      icon: Bot
    },
    {
      title: "Multiple Projection Strategies",
      description: "Choose from conservative, balanced, aggressive, or specialized strategies tailored to your goals.",
      icon: Target
    },
    {
      title: "Secure Data Storage",
      description: "Your financial data is encrypted and stored securely, with regular backups and privacy protection.",
      icon: Lock
    },
    {
      title: "Real-Time Updates",
      description: "Get instant calculations and updates as market conditions and economic factors change.",
      icon: Zap
    },
    {
      title: "Mobile Responsive",
      description: "Access your retirement plans anywhere, anytime with our fully responsive mobile interface.",
      icon: Smartphone
    }
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground mb-6">
            User Guide & Features
          </div>
          <h2 className="text-3xl md:text-4xl font-heading leading-tight tracking-tight mb-6">
            How to Use
            <span className="text-primary">
              ZikoRetire
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Everything you need to know about planning your retirement with our comprehensive platform.
          </p>
        </div>

        {/* User Guides */}
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-center">Step-by-Step Guides</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <div key={index} className="p-6 border rounded-2xl border-border/50 bg-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <guide.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">{guide.title}</h4>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                </div>
                <ol className="space-y-2">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {stepIndex + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-2xl font-semibold mb-8 text-center">Platform Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-20 p-8 rounded-2xl border border-border/50 bg-card">
          <h3 className="text-xl font-semibold mb-6 text-center">Pro Tips for Better Planning</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
            <h4 className="font-medium text-primary flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Best Practices
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Start planning as early as possible</li>
              <li>• Be realistic about your retirement goals</li>
              <li>• Review your plan annually</li>
              <li>• Consider inflation impact regularly</li>
              <li>• Diversify your retirement savings</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-primary flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Common Mistakes to Avoid
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Underestimating healthcare costs</li>
              <li>• Ignoring inflation effects</li>
              <li>• Starting too late</li>
              <li>• Being too conservative with investments</li>
              <li>• Not updating your plan regularly</li>
            </ul>
          </div>
          </div>
        </div>

      </div>
    </section>
  );
}
