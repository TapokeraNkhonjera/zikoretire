import { prisma } from "@/prisma/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

async function getSimulations() {
  const simulations =
    await prisma.simulation.findMany({
      include: {
        result: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return simulations;
}

export default async function HistoryPage() {
  const simulations =
    await getSimulations();

  return (
    <div className="p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>
            Simulation History
          </CardTitle>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>
                  Date
                </TableHead>

                <TableHead>
                  Monthly Income
                </TableHead>

                <TableHead>
                  Projected Value
                </TableHead>

                <TableHead>
                  RSI Score
                </TableHead>

                <TableHead>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {simulations.map(
                (sim) => {

                  const result =
                    sim.result;

                  return (
                    <TableRow
                      key={sim.id}
                    >

                      <TableCell>
                        {sim.createdAt.toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        MWK {sim.monthlyIncome.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        MWK {result?.projectedValue.toLocaleString()}
                      </TableCell>

                      <TableCell>
                        {result?.rsiScore.toFixed(1)}%
                      </TableCell>

                      <TableCell>

                        <Badge
                          variant={
                            result?.readinessLevel === "Ready"
                              ? "default"
                              : result?.readinessLevel === "Moderate"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {result?.readinessLevel}
                        </Badge>

                      </TableCell>

                    </TableRow>
                  );
                }
              )}

            </TableBody>

          </Table>

        </CardContent>

      </Card>

    </div>
  );
}