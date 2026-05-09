import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, retirementData } = body;

    // Generate ML-based nudges and tips
    const nudges = await generateMLNudges(userId, retirementData);
    
    // Create notifications for each nudge
    const notifications = nudges.map(nudge => ({
      userId: session.user.id,
      title: nudge.title,
      message: nudge.message,
      type: 'ml_nudge',
      read: false,
      linkUrl: nudge.linkUrl,
      linkText: nudge.linkText,
      priority: nudge.priority,
      metadata: {
        category: nudge.category,
        confidence: nudge.confidence,
        actionable: nudge.actionable
      }
    }));

    // Bulk insert notifications
    await prisma.notification.createMany({
      data: notifications
    });

    return NextResponse.json({
      success: true,
      data: {
        nudgesCreated: notifications.length,
        nudges
      }
    });

  } catch (error) {
    console.error("ML Nudge generation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate ML nudges" },
      { status: 500 }
    );
  }
}

async function generateMLNudges(userId: string, retirementData: any) {
  const nudges = [];

  // Contribution optimization nudge
  if (retirementData.contributionRate < 0.15) {
    nudges.push({
      title: "Increase Your Contribution Rate",
      message: "Based on your retirement goals, consider increasing your contribution rate to 15% or more for optimal retirement readiness.",
      category: "contribution_optimization",
      confidence: 0.85,
      actionable: true,
      priority: "high",
      linkUrl: "/dashboard/projection",
      linkText: "Adjust Contributions"
    });
  }

  // Investment diversification nudge
  if (retirementData.diversificationScore < 0.6) {
    nudges.push({
      title: "Diversify Your Portfolio",
      message: "Your portfolio could benefit from better diversification. Consider adding bonds or international funds to reduce risk.",
      category: "investment_optimization",
      confidence: 0.78,
      actionable: true,
      priority: "medium",
      linkUrl: "/dashboard/analytics",
      linkText: "View Analytics"
    });
  }

  // Retirement timeline nudge
  const yearsToRetirement = retirementData.yearsToRetirement || 30;
  if (yearsToRetirement > 25) {
    nudges.push({
      title: "Consider Early Retirement Planning",
      message: "With proper planning, you could retire earlier than projected. Let's explore strategies to accelerate your retirement.",
      category: "timeline_optimization",
      confidence: 0.72,
      actionable: true,
      priority: "medium",
      linkUrl: "/dashboard/projection",
      linkText: "Optimize Timeline"
    });
  }

  // Risk assessment nudge
  if (retirementData.riskScore > 0.7) {
    nudges.push({
      title: "Review Your Risk Profile",
      message: "Your current investment strategy may be too aggressive for your age. Consider rebalancing for better risk-adjusted returns.",
      category: "risk_management",
      confidence: 0.81,
      actionable: true,
      priority: "high",
      linkUrl: "/dashboard/settings",
      linkText: "Update Risk Profile"
    });
  }

  // Tax optimization nudge
  if (retirementData.taxEfficiency < 0.8) {
    nudges.push({
      title: "Tax Optimization Opportunity",
      message: "You may be missing out on tax-advantaged retirement accounts. Consider maximizing your tax benefits.",
      category: "tax_optimization",
      confidence: 0.76,
      actionable: true,
      priority: "medium",
      linkUrl: "/dashboard/analytics",
      linkText: "Tax Tips"
    });
  }

  // Inflation protection nudge
  if (retirementData.inflationProtection < 0.5) {
    nudges.push({
      title: "Inflation Protection Needed",
      message: "Your retirement savings may not be keeping pace with inflation. Consider adding inflation-protected securities.",
      category: "inflation_protection",
      confidence: 0.69,
      actionable: true,
      priority: "medium",
      linkUrl: "/dashboard/analytics",
      linkText: "Learn More"
    });
  }

  // Milestone celebration nudge
  if (retirementData.savingsMilestone) {
    nudges.push({
      title: "🎉 Congratulations on Your Milestone!",
      message: `You've reached ${retirementData.savingsMilestone} of your retirement goal! Keep up the great work.`,
      category: "milestone_celebration",
      confidence: 1.0,
      actionable: false,
      priority: "low",
      linkUrl: "/dashboard/analytics",
      linkText: "View Progress"
    });
  }

  return nudges;
}
