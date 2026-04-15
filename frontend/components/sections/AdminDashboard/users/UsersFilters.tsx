"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UsersFilters() {

  return (

    <div className="w-full flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      {/* SEARCH */}

      <Input
        placeholder="Search users by name or email..."
        className="w-full md:max-w-sm"
      />



      {/* FILTER BUTTONS */}

      <div className="flex gap-2">

        <Button variant="outline">
          All
        </Button>

        <Button variant="outline">
          Admins
        </Button>

        <Button variant="outline">
          Users
        </Button>

      </div>

    </div>

  );

}