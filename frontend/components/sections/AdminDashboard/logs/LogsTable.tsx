"use client";

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

import { Button } from "@/components/ui/button";

/* ===============================
   MOCK LOG DATA
================================ */

const mockLogs = [

  {
    id: "1",
    timestamp: "2026-04-12 09:45",
    type: "Simulation",
    message: "Retirement projection generated",
    status: "Success",
  },

  {
    id: "2",
    timestamp: "2026-04-12 10:02",
    type: "ML Prediction",
    message: "Prediction confidence calculated",
    status: "Success",
  },

  {
    id: "3",
    timestamp: "2026-04-12 10:30",
    type: "System",
    message: "Database backup completed",
    status: "Success",
  },

  {
    id: "4",
    timestamp: "2026-04-12 11:14",
    type: "Warning",
    message: "High response latency detected",
    status: "Warning",
  },

  {
    id: "5",
    timestamp: "2026-04-12 11:45",
    type: "User Activity",
    message: "New user registered",
    status: "Success",
  },

  {
    id: "6",
    timestamp: "2026-04-12 12:10",
    type: "System",
    message: "Scheduled backup verified",
    status: "Success",
  },

  {
    id: "7",
    timestamp: "2026-04-12 12:42",
    type: "Warning",
    message: "Temporary API latency spike",
    status: "Warning",
  },

  {
    id: "8",
    timestamp: "2026-04-12 13:05",
    type: "Simulation",
    message: "Projection recalculated",
    status: "Success",
  },

];

/* ===============================
   STATUS COLORS
================================ */

function getStatusVariant(status: string) {

  if (status === "Success") return "default";
  if (status === "Warning") return "secondary";

  return "outline";

}

/* ===============================
   COMPONENT
================================ */

export default function LogsTable() {

  return (

    <Card className="w-full">

      <CardHeader>

        <CardTitle>

          System Event Logs

        </CardTitle>

      </CardHeader>

      <CardContent>

        {/* Scroll container — balanced height */}

        <div className="overflow-y-auto max-h-[520px]">

          <Table className="w-full min-w-[1100px]">

            <TableHeader>

              <TableRow>

                <TableHead className="w-[200px]">
                  Timestamp
                </TableHead>

                <TableHead className="w-[180px]">
                  Log Type
                </TableHead>

                <TableHead>
                  Event Message
                </TableHead>

                <TableHead className="w-[140px]">
                  Status
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {mockLogs.map((log) => (

                <TableRow key={log.id}>

                  <TableCell>

                    {log.timestamp}

                  </TableCell>

                  <TableCell>

                    {log.type}

                  </TableCell>

                  <TableCell className="max-w-[500px]">

                    {log.message}

                  </TableCell>

                  <TableCell>

                    <Badge
                      variant={getStatusVariant(log.status)}
                    >

                      {log.status}

                    </Badge>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </div>

        {/* Pagination */}

        <div className="flex justify-between items-center mt-6">

          <p className="text-sm text-muted-foreground">

            Showing 1–8 of 125 logs

          </p>

          <div className="flex gap-2">

            <Button
              variant="outline"
              size="sm"
            >

              Previous

            </Button>

            <Button
              variant="outline"
              size="sm"
            >

              Next

            </Button>

          </div>

        </div>

      </CardContent>

    </Card>

  );

}