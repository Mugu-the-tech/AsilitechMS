import React, { useState, useEffect } from 'react';
import axios, { } from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { 
  Edit, 
  Trash2, 
  Users 
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ScrollArea } from '../components/ui/scroll-area';
import { motion } from "framer-motion";

const enum UserRoles {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

interface User {
  id: string;
  email: string;
  role?: UserRoles | null;
  organizationId: string;
  createdAt: string;
}

// Define a specific error response interface
interface ErrorResponse {
  message: string;
}

const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use BACKEND_URL from .env, fallback to localhost if not set
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const API_ENDPOINTS = {
    users: '/auth'
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const orgData = localStorage.getItem('organization');
        
        if (!orgData) {
          throw new Error('Organization data not found');
        }

        const organization = JSON.parse(orgData);

        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.users}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            organizationId: organization.id
          }
        });

        // Ensure only users from the current organization are displayed
        const filteredUsers = response.data.filter(
          (user: User) => user.organizationId === organization.id
        );

        // Ensure each user has a valid role
        const processedUsers = filteredUsers.map((user: User) => ({
          ...user,
          role: user.role || UserRoles.MEMBER
        }));

        setUsers(processedUsers);
        setLoading(false);
      } catch (err) {
        // Type-guard for AxiosError
        if (axios.isAxiosError<ErrorResponse>(err)) {
          setError(
            err.response?.data?.message || 
            err.message || 
            'Failed to fetch users'
          );
        } else {
          // Handle non-axios errors
          setError('An unexpected error occurred');
        }
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove the deleted user from the state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      // Type-guard for AxiosError
      if (axios.isAxiosError<ErrorResponse>(err)) {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Failed to delete user'
        );
      } else {
        // Handle non-axios errors
        setError('An unexpected error occurred');
      }
    }
  };

  const renderUserRoleBadge = (role: UserRoles) => {
    const roleColors = {
      [UserRoles.MEMBER]: 'bg-blue-100 text-blue-800',
      [UserRoles.ADMIN]: 'bg-yellow-100 text-yellow-800',
      [UserRoles.OWNER]: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
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
            User Management
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
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.role && renderUserRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" className="mr-2">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
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