import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Edit, Trash2, Users } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ScrollArea } from "../components/ui/scroll-area";
import { motion } from "framer-motion";

interface User {
  id: number;
  email: string;
  password?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface Organization {
  id: number;
  name: string;
}

interface OrganizationUser {
  id: number;
  user_id: number;
  organization_id: number;
  role?: string;
  user?: User;
}

const UserManagementTable: React.FC = () => {
  const [organizationUsers, setOrganizationUsers] = useState<
    OrganizationUser[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    const getOrganizationData = () => {
      const orgData = localStorage.getItem("organization");
      if (!orgData) {
        throw new Error("Organization data not found. Please log in again.");
      }
      try {
        return JSON.parse(orgData) as Organization;
      } catch {
        throw new Error("Invalid organization data. Please log in again.");
      }
    };

    const fetchOrganizationUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const organization = getOrganizationData();
        setCurrentOrganization(organization);

        // Fetch organization users from the join table
        const response = await axios.get<OrganizationUser[]>(
          `${API_BASE_URL}/organization-users/${organization.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        //console.log("API Response:", response.data);
        setOrganizationUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching organization users:", err);

        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || err.message;
          setError(`Failed to fetch users: ${errorMessage}`);

          if (err.response?.status === 401) {
            localStorage.clear();
            window.location.href = "/login";
          }
        } else {
          setError(`An unexpected error occurred: ${(err as Error).message}`);
        }
        setLoading(false);
      }
    };

    fetchOrganizationUsers();
  }, []);

  const handleRemoveUser = async (organizationUserId: number) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Remove user from organization (not deleting the user)
      await axios.delete(
        `${API_BASE_URL}/organization-users/${organizationUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrganizationUsers(
        organizationUsers.filter((ou) => ou.id !== organizationUserId)
      );
      setError(null);
    } catch (err) {
      console.error("Error removing user from organization:", err);

      if (axios.isAxiosError(err)) {
        setError(
          `Failed to remove user: ${err.response?.data?.message || err.message}`
        );
      } else {
        setError(
          `An unexpected error occurred while removing user: ${
            (err as Error).message
          }`
        );
      }
    }
  };

  const renderUserRoleBadge = (role: string = "USER") => {
    const roleColors: Record<string, string> = {
      USER: "bg-blue-100 text-blue-800",
      ADMIN: "bg-yellow-100 text-yellow-800",
      OWNER: "bg-green-100 text-green-800",
    };

    const color = roleColors[role] || roleColors["USER"];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {role || "User"}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg bg-white dark:bg-gray-900">
      <CardHeader className="border-b border-gray-200 p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <Users className="mr-3 h-6 w-6" />
            {currentOrganization?.name} - Users ({organizationUsers.length})
          </CardTitle>
        </motion.div>
      </CardHeader>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CardContent className="p-4">
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizationUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No users found for this organization
                  </TableCell>
                </TableRow>
              ) : (
                organizationUsers.map((orgUser) => (
                  <TableRow key={orgUser.id}>
                    <TableCell>{orgUser.user?.email}</TableCell>
                    <TableCell>{renderUserRoleBadge(orgUser.role)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" className="mr-2">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveUser(orgUser.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserManagementTable;
