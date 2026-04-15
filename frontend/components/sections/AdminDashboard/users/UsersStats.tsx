"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Users,
  ShieldCheck,
  Activity,
  UserPlus,
} from "lucide-react";

export default function UsersStats() {

  return (

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      {/* TOTAL USERS */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between pb-2">

          <CardTitle className="text-sm font-medium text-muted-foreground">

            Total Users

          </CardTitle>

          <Users className="w-4 h-4 text-primary" />

        </CardHeader>

        <CardContent>

          <div className="text-3xl font-bold">

            124

          </div>

          <p className="text-xs text-muted-foreground mt-1">

            Registered accounts

          </p>

        </CardContent>

      </Card>



      {/* ADMIN USERS */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between pb-2">

          <CardTitle className="text-sm font-medium text-muted-foreground">

            Admin Users

          </CardTitle>

          <ShieldCheck className="w-4 h-4 text-primary" />

        </CardHeader>

        <CardContent>

          <div className="text-3xl font-bold">

            3

          </div>

          <p className="text-xs text-muted-foreground mt-1">

            With elevated access

          </p>

        </CardContent>

      </Card>



      {/* ACTIVE USERS */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between pb-2">

          <CardTitle className="text-sm font-medium text-muted-foreground">

            Active Users

          </CardTitle>

          <Activity className="w-4 h-4 text-primary" />

        </CardHeader>

        <CardContent>

          <div className="text-3xl font-bold">

            38

          </div>

          <p className="text-xs text-muted-foreground mt-1">

            Logged in recently

          </p>

        </CardContent>

      </Card>



      {/* NEW USERS */}

      <Card>

        <CardHeader className="flex flex-row items-center justify-between pb-2">

          <CardTitle className="text-sm font-medium text-muted-foreground">

            New This Month

          </CardTitle>

          <UserPlus className="w-4 h-4 text-primary" />

        </CardHeader>

        <CardContent>

          <div className="text-3xl font-bold">

            12

          </div>

          <p className="text-xs text-muted-foreground mt-1">

            Recent registrations

          </p>

        </CardContent>

      </Card>

    </div>

  );

}