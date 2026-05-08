import { NextResponse } from "next/server"

const MLBACKEND_URL = process.env.MLBACKEND_URL || "http://127.0.0.1:8000"
const MLBACKEND_TIMEOUT_MS = Number(process.env.MLBACKEND_TIMEOUT_MS || 3000)

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MLBACKEND_TIMEOUT_MS)

  try {
    const res = await fetch(`${MLBACKEND_URL}/api/health/ready`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return NextResponse.json({
        online: false,
        source: "zikoml",
        status: "not_ready",
      })
    }

    return NextResponse.json({
      online: true,
      source: "zikoml",
      status: "ready",
    })
  } catch {
    clearTimeout(timeout)
    return NextResponse.json({
      online: false,
      source: "zikoml",
      status: "unreachable",
    })
  }
}
