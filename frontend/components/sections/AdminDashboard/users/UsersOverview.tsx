"use client";

import { useEffect, useState } from "react";
import UsersStats from "./UsersStats";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  simulations: number;
  joined: string;
}

interface UsersStatsData {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
}

export default function UsersOverview() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Search filter state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        
        if (json.success) {
          setUsers(json.data.users);
          setFilteredUsers(json.data.users);
          setStats(json.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch admin users data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Simplified filtering logic to connect the search if UsersFilters allows it
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  if (loading) {
    return <div className="p-8">Loading users...</div>;
  }

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
      {stats && <UsersStats stats={stats} />}

      {/* ===============================
         SECTION: FILTERS
      =============================== */}
      <UsersFilters />

      {/* ===============================
         SECTION: USERS TABLE
      =============================== */}
      <UsersTable users={filteredUsers} />
    </div>
  );
}