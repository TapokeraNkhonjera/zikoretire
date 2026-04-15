"use client";

import UsersStats from "./UsersStats";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";

export default function UsersOverview() {

  return (

    <div className="space-y-8 pt-8 pl-8">

      {/* ===============================
         SECTION: PAGE TITLE
      =============================== */}

      <div>

        <h1 className="text-2xl font-semibold text-foreground">
          User Management
        </h1>

        <p className="text-sm text-muted-foreground">
          View, manage roles, and monitor user activity.
        </p>

      </div>



      {/* ===============================
         SECTION: USER STATS
      =============================== */}

      <UsersStats />



      {/* ===============================
         SECTION: FILTERS
      =============================== */}

      <UsersFilters />



      {/* ===============================
         SECTION: USERS TABLE
      =============================== */}

      <UsersTable />

    </div>

  );

}