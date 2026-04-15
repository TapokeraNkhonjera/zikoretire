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

/* ======================
   Mock Data
====================== */

const mockUsers = [

  {
    id: "1",
    name: "John Banda",
    email: "john@example.com",
    role: "USER",
    status: "ACTIVE",
    simulations: 12,
    joined: "2025-11-02",
  },

  {
    id: "2",
    name: "Mary Phiri",
    email: "mary@example.com",
    role: "ADMIN",
    status: "ACTIVE",
    simulations: 45,
    joined: "2025-06-14",
  },

  {
    id: "3",
    name: "Peter Mwale",
    email: "peter@example.com",
    role: "USER",
    status: "ARCHIVED",
    simulations: 3,
    joined: "2025-08-05",
  },

  {
    id: "4",
    name: "Grace Zulu",
    email: "grace@example.com",
    role: "USER",
    status: "ACTIVE",
    simulations: 8,
    joined: "2026-01-10",
  },

];

/* ====================== */

export default function UsersTable() {

  /* Pagination */

  const [page, setPage] = useState(1);

  const pageSize = 4;

  const start =
    (page - 1) * pageSize;

  const paginatedUsers =
    mockUsers.slice(
      start,
      start + pageSize
    );

  const totalPages =
    Math.ceil(
      mockUsers.length / pageSize
    );

  return (

    <Card className="w-full">

      <CardHeader>

        <CardTitle>
          Users List
        </CardTitle>

      </CardHeader>



      <CardContent className="w-full overflow-x-auto">

        {/* Balanced Width */}

        <Table className="w-full min-w-[1000px]">

          <TableHeader>

            <TableRow>

              <TableHead>Name</TableHead>

              <TableHead>Email</TableHead>

              <TableHead>Role</TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Simulations</TableHead>

              <TableHead>Joined</TableHead>

              <TableHead>Actions</TableHead>

            </TableRow>

          </TableHeader>



          <TableBody>

            {paginatedUsers.map((user) => (

              <TableRow key={user.id}>

                {/* Name */}

                <TableCell className="font-medium">
                  {user.name}
                </TableCell>



                {/* Email */}

                <TableCell>
                  {user.email}
                </TableCell>



                {/* Role */}

                <TableCell>

                  <Badge
                    variant={
                      user.role === "ADMIN"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>

                </TableCell>



                {/* Status */}

                <TableCell>

                  <Badge
                    variant={
                      user.status === "ACTIVE"
                        ? "default"
                        : "outline"
                    }
                  >
                    {user.status}
                  </Badge>

                </TableCell>



                {/* Simulations */}

                <TableCell>
                  {user.simulations}
                </TableCell>



                {/* Joined */}

                <TableCell>
                  {user.joined}
                </TableCell>



                {/* Actions */}

                <TableCell>

                  <div className="flex gap-2">

                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Role
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                    >
                      Archive
                    </Button>

                  </div>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>



        {/* Pagination */}

        <div className="flex items-center justify-end gap-2 mt-6">

          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() =>
              setPage(page - 1)
            }
          >
            Prev
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={
              page === totalPages
            }
            onClick={() =>
              setPage(page + 1)
            }
          >
            Next
          </Button>

        </div>

      </CardContent>

    </Card>

  );

}