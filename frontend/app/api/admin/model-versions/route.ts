import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const modelVersions = await prisma.mLModelVersion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      data: {
        modelVersions,
        total: modelVersions.length,
        latest: modelVersions[0] || null
      }
    });
  } catch (error) {
    console.error("ADMIN MODEL VERSIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load model versions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { version, modelType, status, accuracyR2, accuracyMse, trainingSamples } = body;

    const modelVersion = await prisma.mLModelVersion.create({
      data: {
        version,
        modelType,
        status,
        accuracyR2,
        accuracyMse,
        trainingSamples
      }
    });

    return NextResponse.json({
      success: true,
      data: modelVersion,
      message: "Model version recorded successfully"
    });
  } catch (error) {
    console.error("ADMIN MODEL VERSIONS CREATE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create model version" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const versionId = searchParams.get('id');

    if (!versionId) {
      return NextResponse.json(
        { success: false, message: "Version ID required" },
        { status: 400 }
      );
    }

    await prisma.mLModelVersion.delete({
      where: { id: versionId }
    });

    return NextResponse.json({
      success: true,
      message: "Model version deleted successfully"
    });
  } catch (error) {
    console.error("ADMIN MODEL VERSIONS DELETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete model version" },
      { status: 500 }
    );
  }
}
