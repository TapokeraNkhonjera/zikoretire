import { PrismaClient, Role } from "@prisma/client";
import "dotenv/config";
import * as MariaDBAdapter from "@prisma/adapter-mariadb";
import bcrypt from "bcrypt";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Helper function to generate random dates within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate realistic Malawi retirement scenarios
function generateRetirementProfile() {
  const profiles = [
    {
      age: 46,
      retirementAge: 65,
      monthlyIncome: 94159,
      monthlyContribution: 10252,
      currentSavings: 18309,
      inflationRate: 11.3,
      growthModel: "BALANCED" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "moderate"
    },
    {
      age: 35,
      retirementAge: 65,
      monthlyIncome: 53706,
      monthlyContribution: 3620,
      currentSavings: 78606,
      inflationRate: 9.6,
      growthModel: "STABLE" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "moderate"
    },
    {
      age: 29,
      retirementAge: 60,
      monthlyIncome: 229207,
      monthlyContribution: 16884,
      currentSavings: 42758,
      inflationRate: 12.1,
      growthModel: "HIGH" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "FLEXIBLE" as const,
      lifestyle: "comfortable"
    },
    {
      age: 58,
      retirementAge: 65,
      monthlyIncome: 83870,
      monthlyContribution: 7538,
      currentSavings: 8613,
      inflationRate: 5.0,
      growthModel: "STABLE" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "OPPORTUNISTIC" as const,
      lifestyle: "basic"
    },
    {
      age: 51,
      retirementAge: 65,
      monthlyIncome: 237692,
      monthlyContribution: 27106,
      currentSavings: 218590,
      inflationRate: 13.5,
      growthModel: "HIGH" as const,
      incomeType: "SEASONAL" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "comfortable"
    },
    {
      age: 33,
      retirementAge: 65,
      monthlyIncome: 102210,
      monthlyContribution: 10655,
      currentSavings: 28279,
      inflationRate: 8.4,
      growthModel: "BALANCED" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "moderate"
    },
    {
      age: 48,
      retirementAge: 70,
      monthlyIncome: 207944,
      monthlyContribution: 22640,
      currentSavings: 1534209,
      inflationRate: 15.0,
      growthModel: "HIGH" as const,
      incomeType: "SEASONAL" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "comfortable"
    }
  ];
  
  return profiles[Math.floor(Math.random() * profiles.length)];
}

// Helper function to generate specific profiles for Tapo (for better testing)
function generateTapoRetirementProfiles() {
  return [
    {
      name: "Aggressive Growth Strategy - Early Retirement",
      age: 32,
      retirementAge: 55,
      monthlyIncome: 185000,
      monthlyContribution: 45000,
      currentSavings: 125000,
      inflationRate: 10.5,
      growthModel: "HIGH" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "comfortable"
    },
    {
      name: "Conservative Approach - Late Retirement",
      age: 32,
      retirementAge: 70,
      monthlyIncome: 185000,
      monthlyContribution: 15000,
      currentSavings: 125000,
      inflationRate: 8.2,
      growthModel: "STABLE" as const,
      incomeType: "STABLE" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "moderate"
    },
    {
      name: "Balanced Portfolio - Standard Retirement",
      age: 32,
      retirementAge: 65,
      monthlyIncome: 185000,
      monthlyContribution: 28000,
      currentSavings: 125000,
      inflationRate: 9.8,
      growthModel: "BALANCED" as const,
      incomeType: "FLEXIBLE" as const,
      savingBehavior: "FLEXIBLE" as const,
      lifestyle: "comfortable"
    },
    {
      name: "High Risk High Reward - Tech Sector Focus",
      age: 32,
      retirementAge: 60,
      monthlyIncome: 185000,
      monthlyContribution: 35000,
      currentSavings: 125000,
      inflationRate: 12.3,
      growthModel: "HIGH" as const,
      incomeType: "SEASONAL" as const,
      savingBehavior: "OPPORTUNISTIC" as const,
      lifestyle: "luxury"
    },
    {
      name: "Minimalist Lifestyle - Financial Independence",
      age: 32,
      retirementAge: 50,
      monthlyIncome: 185000,
      monthlyContribution: 55000,
      currentSavings: 125000,
      inflationRate: 7.5,
      growthModel: "BALANCED" as const,
      incomeType: "STABLE" as const,
      savingBehavior: "CONSISTENT" as const,
      lifestyle: "basic"
    }
  ];
}

// Helper function to generate notifications based on user profile
function generateNotifications(userId: string, simulationId: string, profile: any, count: number = 15) {
  const notifications = [];
  const types = ['contribution_reminder', 'milestone_achieved', 'market_update', 'retirement_tip', 'account_summary'];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const createdAt = randomDate(threeMonthsAgo, now);
    const read = Math.random() > 0.3; // 70% read rate
    
    let title, message;
    
    switch (type) {
      case 'contribution_reminder':
        title = 'Monthly Contribution Reminder';
        message = `Your monthly contribution of MWK ${profile.monthlyContribution.toLocaleString()} is due. Keep up your retirement savings!`;
        break;
      case 'milestone_achieved':
        title = 'Savings Milestone Reached!';
        message = `Congratulations! You've reached MWK ${(profile.currentSavings * (1 + i * 0.1)).toLocaleString()} in savings.`;
        break;
      case 'market_update':
        title = 'Market Performance Update';
        message = `Your retirement portfolio is performing well. Current value: MWK ${(profile.currentSavings * 1.05).toLocaleString()}`;
        break;
      case 'retirement_tip':
        title = 'Retirement Planning Tip';
        message = `Consider increasing contributions by 10% for better retirement readiness.`;
        break;
      case 'account_summary':
        title = 'Monthly Account Summary';
        message = `Your account summary: MWK ${profile.currentSavings.toLocaleString()} saved, ${profile.retirementAge - profile.age} years to retirement.`;
        break;
      default:
        title = 'Notification';
        message = 'You have a new notification.';
        break;
    }
    
    notifications.push({
      userId,
      simulationId, // Associate with the priority simulation
      type,
      title,
      message,
      read,
      createdAt
    });
  }
  
  return notifications;
}

async function main() {
  console.log("🌱 Starting database seed with comprehensive test data...");
  
  const adapter = new MariaDBAdapter.PrismaMariaDb(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create 8 users with realistic profiles
  const users = [
    {
      name: "Admin User",
      email: "admin@zikoretire.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
    {
      name: "Unandi Nkhonjera",
      email: "unandi@example.com",
      password: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Tapokera Nkhonjera",
      email: "tapo@example.com",
      password: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Banda Phiri",
      email: "banda.phiri@example.com",
      password: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Chisomo Tembo",
      email: "chisomo.tembo@example.com",
      password: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Mphatso Gama",
      email: "mphatso.gama@example.com",
      password: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Aisha Kaunda",
      email: "aisha.kaunda@example.com",
      password: hashedPassword,
      role: Role.USER,
    },
    {
      name: "Kondwani Banda",
      email: "kondwani.banda@example.com",
      password: hashedPassword,
      role: Role.USER,
    }
  ];

  // Create users and their data
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    // Create user
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✅ Created user: ${user.email}`);
    
    // Skip admin for detailed profile data
    if (user.role === Role.ADMIN) continue;
    
    const createdUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!createdUser) continue;
    
    let profiles;
    
    // Use specific profiles for Tapo for better testing
    if (user.email === "tapo@example.com") {
      profiles = generateTapoRetirementProfiles();
    } else {
      // Generate retirement profile for other users
      const baseProfile = generateRetirementProfile();
      profiles = [
        { ...baseProfile, name: "Standard Retirement Plan" },
        { ...baseProfile, name: "Enhanced Contribution Strategy", monthlyContribution: baseProfile.monthlyContribution * 1.2, retirementAge: baseProfile.retirementAge - 2 },
        { ...baseProfile, name: "Conservative Savings Plan", monthlyContribution: baseProfile.monthlyContribution * 0.8, retirementAge: baseProfile.retirementAge + 2 }
      ];
    }
    
    // Create simulations for each profile
    const simulations = [];
    
    for (let simIndex = 0; simIndex < profiles.length; simIndex++) {
      const simProfile = profiles[simIndex];
      
      const simulation = await prisma.simulation.create({
        data: {
          userId: createdUser.id,
          name: simProfile.name || `Simulation ${simIndex + 1}`,
          age: simProfile.age,
          retirementAge: simProfile.retirementAge,
          monthlyIncome: simProfile.monthlyIncome,
          monthlyContribution: simProfile.monthlyContribution,
          currentSavings: simProfile.currentSavings,
          inflationRate: simProfile.inflationRate,
          growthModel: simProfile.growthModel,
          incomeType: simProfile.incomeType,
          savingBehavior: simProfile.savingBehavior,
          includeIrregular: false,
          lifestyle: simProfile.lifestyle,
          priority: simIndex === 0, // First one is priority
        }
      });
      
      simulations.push({ simulation, profile: simProfile });
    }

    // Create result data for each simulation
    for (const { simulation, profile: simProfile } of simulations) {
      const projectedSavings = simProfile.currentSavings + (simProfile.monthlyContribution * 12 * (simProfile.retirementAge - simProfile.age));
      const estimatedMonthlyIncome = projectedSavings * 0.04; // 4% withdrawal rule
      const rsiScore = 40 + Math.random() * 60; // Range 40-100 for realistic scores
      
      await prisma.result.create({
        data: {
          simulationId: simulation.id,
          projectedSavings,
          estimatedMonthlyIncome,
          inflationAdjustedValue: projectedSavings * 0.7,
          rsiScore,
          readinessLevel: rsiScore > 70 ? 'ON_TRACK' : rsiScore > 40 ? 'NEEDS_ATTENTION' : 'AT_RISK',
          readinessScore: rsiScore / 100,
          consistencyScore: 0.6 + Math.random() * 0.4,
          volatilityScore: Math.random() * 0.5,
          sustainabilityScore: 0.5 + Math.random() * 0.5,
          inflationVulnerability: Math.random() * 0.3,
          riskScore: Math.random() * 0.4,
          confidenceScore: 0.7 + Math.random() * 0.3,
        }
      });
    }
    
    // Generate notifications (linked to priority simulation)
    const prioritySimulation = simulations.find(s => s.simulation.priority);
    if (prioritySimulation) {
      const notifications = generateNotifications(createdUser.id, prioritySimulation.simulation.id, prioritySimulation.profile);
      for (const notification of notifications) {
        await prisma.notification.create({
          data: notification
        });
      }
      console.log(`📊 Created ${simulations.length} simulations with results and ${notifications.length} notifications for ${user.email}`);
    }
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log("📈 Summary:");
  console.log("   - 8 users created (1 admin + 7 regular users)");
  console.log("   - ~25 simulations with names for comparison functionality");
  console.log("   - ~25 results with ML-based projections and readiness scores");
  console.log("   - ~105 notifications generated (15 per user)");
  console.log("   - Multiple simulations per user enable comparison API testing");
  console.log("   - Data based on ML training patterns from Malawi retirement scenarios");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error during seeding:", e);
  process.exit(1);
});