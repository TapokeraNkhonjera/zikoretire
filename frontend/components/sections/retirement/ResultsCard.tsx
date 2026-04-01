import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResultsCardProps {
  data: {
    estimatedSavings: number;
    yearsToRetirement: number;
    rsi: number;
  };
}

export default function ResultsCard({ data }: ResultsCardProps) {

  return (
    <Card>

      <CardHeader>
        <CardTitle>
          Retirement Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>
          <p className="text-sm text-muted-foreground">
            Estimated Savings
          </p>

          <p className="text-xl font-bold">
            MWK {data.estimatedSavings.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Years to Retirement
          </p>

          <p className="text-xl font-bold">
            {data.yearsToRetirement} Years
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            RSI Score
          </p>

          <p className="text-xl font-bold">
            {(data.rsi * 100).toFixed(1)}%
          </p>
        </div>

      </CardContent>

    </Card>
  );
}