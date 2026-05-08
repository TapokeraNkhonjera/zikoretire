"use client";

export default function AboutTeam() {
  const team = [
    {
      name: "Dr. Sarah Banda",
      role: "Founder & CEO",
      expertise: "Financial Technology & Actuarial Science",
      image: "/team/sarah.jpg"
    },
    {
      name: "James Phiri",
      role: "CTO & ML Engineer",
      expertise: "Machine Learning & Data Science",
      image: "/team/james.jpg"
    },
    {
      name: "Grace Mwale",
      role: "Head of Product",
      expertise: "UX Design & Product Strategy",
      image: "/team/grace.jpg"
    },
    {
      name: "Michael Tembo",
      role: "Finance Director",
      expertise: "Pension Fund Management",
      image: "/team/michael.jpg"
    }
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 text-xs border rounded-full text-muted-foreground mb-6">
            Leadership Team
          </div>
          <h2 className="text-3xl md:text-4xl font-heading leading-tight tracking-tight mb-6">
            Meet the Experts Behind
            <br />
            <span className="text-primary">
              ZikoRetire
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Our diverse team combines expertise in finance, technology, and local market knowledge 
            to deliver the best retirement planning experience for Malawians.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <div className="w-16 h-16 rounded-full bg-primary/20" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                  {member.role.split(' ')[0]}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
              <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
              <p className="text-xs text-muted-foreground">{member.expertise}</p>
            </div>
          ))}
        </div>

        {/* Advisors */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-semibold mb-8">Advisory Board</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Prof. Joseph Kachikoti",
                title: "Economic Advisor",
                org: "University of Malawi"
              },
              {
                name: "Mrs. Ellen Moyo",
                title: "Pension Regulation Expert",
                org: "Reserve Bank of Malawi"
              },
              {
                name: "Dr. Samuel Nkhoma",
                title: "Technology Advisor",
                org: "Malawi ICT Association"
              }
            ].map((advisor, index) => (
              <div key={index} className="p-6 rounded-xl border border-border/50 bg-card">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-6 h-6 rounded-full bg-primary" />
                </div>
                <h4 className="font-semibold mb-1">{advisor.name}</h4>
                <p className="text-sm text-primary font-medium mb-1">{advisor.title}</p>
                <p className="text-xs text-muted-foreground">{advisor.org}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
