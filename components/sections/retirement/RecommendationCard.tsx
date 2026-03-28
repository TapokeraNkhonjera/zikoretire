import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecommendationCardProps {
  rsi: number;
}

export default function RecommendationCard({ rsi }: RecommendationCardProps) {

  let message = "";

  if (rsi < 0.5) {

    message =
      "Increase your monthly contributions to improve retirement readiness.";

  } else if (rsi < 0.8) {

    message =
      "You're progressing well. Consider slightly increasing savings.";

  } else {

    message =
      "Excellent! You're well prepared for retirement.";

  }

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Recommendations
        </CardTitle>
      </CardHeader>

      <CardContent>

        <p>
          {message}
        </p>

      </CardContent>

    </Card>
  );
}