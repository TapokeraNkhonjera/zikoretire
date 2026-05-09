import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const {
      age,
      retirementAge,
      monthlyIncome,
      monthlyContribution,
      currentSavings,
      inflationRate,
      growthModel,
      incomeType,
      savingBehavior,
      includeIrregular,
      extraContribution,
      lifestyle,
      name,
    } = data

    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Create simulation with name
    const simulation = await prisma.simulation.create({
      data: {
        userId: session.user.id,
        age,
        retirementAge,
        monthlyIncome,
        monthlyContribution,
        currentSavings,
        inflationRate,
        growthModel,
        incomeType,
        savingBehavior,
        includeIrregular,
        extraContribution,
        lifestyle,
        name: name || `Retirement Planning ${new Date().getFullYear()}`,
      },
    })

    // Years to retirement
    const yearsToRetirement =
      retirementAge - age;

    console.log("Incoming Data:", data);

    // Monthly investment return (assumed 8%)
    const annualReturnRate = 0.08;
    const monthlyRate =
      annualReturnRate / 12;

    const totalMonths =
      yearsToRetirement * 12;

    // Future Value of Monthly Contributions
    const futureValueContributions =
      monthlyContribution *
      (
        (Math.pow(
          1 + monthlyRate,
          totalMonths
        ) - 1) /
        monthlyRate
      );

    // Future Value of Current Savings
    const futureValueSavings =
      currentSavings *
      Math.pow(
        1 + monthlyRate,
        totalMonths
      );

    const estimatedSavings =
      futureValueContributions +
      futureValueSavings;

    // Adjust for Inflation
    const inflationDecimal =
      inflationRate / 100;

    const inflationAdjustedSavings =
      estimatedSavings *
      Math.pow(
        1 - inflationDecimal,
        yearsToRetirement
      );

    // Lifestyle multiplier
    let lifestyleFactor = 1;

    if (lifestyle === "basic")
      lifestyleFactor = 0.7;

    if (lifestyle === "moderate")
      lifestyleFactor = 1;

    if (lifestyle === "comfortable")
      lifestyleFactor = 1.3;

    // Retirement Sufficiency Index
    const requiredSavings =
      monthlyIncome *
      12 *
      yearsToRetirement *
      lifestyleFactor;

    const rsi =
      inflationAdjustedSavings /
      requiredSavings;

    return NextResponse.json({

      success: true,

      data: {

        estimatedSavings:
          Math.round(
            inflationAdjustedSavings
          ),

        rsi,

        yearsToRetirement,

      },

    });

  }

  catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Simulation failed",
      },
      { status: 500 }
    );

  }

}