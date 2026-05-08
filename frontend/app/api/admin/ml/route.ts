import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

const MLBACKEND_URL = process.env.MLBACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [healthRes, modelStatusRes, trainRes] = await Promise.all([
      fetch(`${MLBACKEND_URL}/api/health/ready`, { cache: "no-store" }),
      fetch(`${MLBACKEND_URL}/api/models/status`, { cache: "no-store" }),
      fetch(`${MLBACKEND_URL}/api/train-status`, { cache: "no-store" }),
    ]);

    const healthOnline = healthRes.ok;
    const modelStatusData = modelStatusRes.ok ? await modelStatusRes.json() : null;
    const trainData = trainRes.ok ? await trainRes.json() : null;

    return NextResponse.json({
      success: true,
      data: {
        mlOnline: healthOnline,
        modelStatus: modelStatusData?.models ?? {},
        telemetryEvents: trainData?.telemetry_events ?? 0,
        training: trainData?.training ?? {
          running: false,
          last_status: "unknown",
          last_result: null,
          last_error: null,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN ML STATUS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load ML status" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(`${MLBACKEND_URL}/api/train-model`, {
      method: "POST",
    });

    const payload = await res.json();
    return NextResponse.json({
      success: res.ok,
      data: payload,
    });
  } catch (error) {
    console.error("ADMIN ML TRAIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to trigger ML training" },
      { status: 500 }
    );
  }
}
