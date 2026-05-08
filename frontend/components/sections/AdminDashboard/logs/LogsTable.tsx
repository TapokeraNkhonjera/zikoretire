"use client";

import { useState } from "react";
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

interface Log {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  status: string;
}

interface LogsTableProps {
  logs: Log[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const start = (page - 1) * pageSize;
  const paginatedLogs = logs.slice(start, start + pageSize);
  const totalPages = Math.ceil(logs.length / pageSize);

  function getStatusVariant(status: string) {
    if (status === "Success") return "default";
    if (status === "Warning") return "secondary";
    return "outline";
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Event Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Scroll container — balanced height */}
        <div className="overflow-y-auto max-h-[520px]">
          <Table className="w-full min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead className="w-[180px]">Log Type</TableHead>
                <TableHead>Event Message</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell className="max-w-[500px]">
                    {log.message}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No system logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {logs.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {start + 1}–{Math.min(start + pageSize, logs.length)} of {logs.length} logs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}