"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TrainingState {
  running: boolean;
  last_started_at: string | null;
  last_finished_at: string | null;
  last_status: string;
  last_result: {
    metrics?: {
      mae?: number;
      r2?: number;
    };
    timestamp?: string;
  } | null;
  last_error: string | null;
}

interface MLData {
  mlOnline: boolean;
  telemetryEvents: number;
  training: TrainingState;
}

export default function MLOverview() {
  const [data, setData] = useState<MLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/ml", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch ML status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleTrainModel = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ml", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Training request failed");
      }
      setMessage(json.data?.message ?? "Training request submitted.");
      await fetchStatus();
    } catch (error) {
      setMessage("Failed to trigger training.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading ML controls...</div>;
  }

  const training = data?.training;
  const metrics = training?.last_result?.metrics;

  return (
    <div className="space-y-6 pt-8 pl-8 pr-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          ML Training & Statistics
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor ZikoML status, collected telemetry, and trigger retraining.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">ML Engine</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={data?.mlOnline ? "default" : "secondary"}>
              {data?.mlOnline ? "Online" : "Offline"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Telemetry Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.telemetryEvents ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Collected from simulation runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Last MAE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {typeof metrics?.mae === "number" ? metrics.mae.toFixed(4) : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Last R²</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {typeof metrics?.r2 === "number" ? metrics.r2.toFixed(4) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Train Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Trigger a new training pipeline run using latest dataset and save a fresh versioned model.
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleTrainModel}
              disabled={submitting || Boolean(training?.running)}
            >
              {training?.running ? "Training in progress..." : "Train ZikoML"}
            </Button>
            <Badge variant="outline">Status: {training?.last_status ?? "unknown"}</Badge>
          </div>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          {training?.last_error && (
            <p className="text-sm text-red-600">Last error: {training.last_error}</p>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Last started: {training?.last_started_at ?? "N/A"}</p>
            <p>Last finished: {training?.last_finished_at ?? "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
