import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

interface RSIIndicatorProps {
  rsi: number;
}

export default function RSIIndicator({ rsi }: RSIIndicatorProps) {

  const percentage = Math.min(
    rsi * 100,
    100
  );

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Retirement Readiness
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        <Progress value={percentage} />

        <p className="text-sm text-muted-foreground">

          {percentage < 50 &&
            "Your retirement readiness is low."}

          {percentage >= 50 &&
            percentage < 80 &&
            "You're making progress toward retirement."}

          {percentage >= 80 &&
            "You're on track for retirement!"}

        </p>

      </CardContent>

    </Card>
  );
}