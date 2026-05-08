"use client";

import { Target, Eye, CheckCircle, Globe } from "lucide-react";

export default function AboutMission() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground mb-6">
            Our Mission & Vision
          </div>
          <h2 className="text-3xl md:text-4xl font-heading leading-tight tracking-tight mb-6">
            Empowering Malawians to Plan
            <br />
            <span className="text-primary">
              Their Financial Future
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            We believe everyone deserves access to clear, reliable retirement planning tools 
            that respect local economic realities and cultural contexts.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          {/* Mission */}
          <div className="p-8 border rounded-2xl border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide accessible, accurate, and culturally relevant pension projection tools 
              that help Malawians make informed retirement decisions and achieve financial security.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 border rounded-2xl border-border/50 bg-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A future where every Malawian has the confidence and tools to plan effectively 
              for retirement, ensuring dignity and financial independence in their golden years.
            </p>
          </div>

        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-semibold mb-8">Core Values</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                title: "Transparency",
                description: "Clear calculations you can trust",
                icon: CheckCircle
              },
              {
                title: "Accessibility",
                description: "Simple tools for everyone",
                icon: Globe
              },
              {
                title: "Accuracy",
                description: "ML-powered precise projections",
                icon: Target
              },
              {
                title: "Local Focus",
                description: "Built for Malawi's context",
                icon: Globe
              }
            ].map((value, index) => (
              <div key={index} className="p-6 rounded-xl border border-border/50 bg-card">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
