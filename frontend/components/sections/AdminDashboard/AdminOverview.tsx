"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminOverview() {

  return (

    <div className="grid gap-6 md:grid-cols-3">

      <Card>
        <CardHeader>
          <CardTitle>
            Total Users
          </CardTitle>
        </CardHeader>

        <CardContent>

          <p className="text-3xl font-bold">
            124
          </p>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Total Simulations
          </CardTitle>
        </CardHeader>

        <CardContent>

          <p className="text-3xl font-bold">
            3,542
          </p>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            System Status
          </CardTitle>
        </CardHeader>

        <CardContent>

          <p className="font-semibold text-green-600">
            Running
          </p>

        </CardContent>
      </Card>

    </div>

  );

}