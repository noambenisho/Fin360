import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  Button,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const fetchData = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [usersRes, profilesRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/profiles`, { headers }),
      ]);

      if (!usersRes.ok || !profilesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const users = await usersRes.json();
      const profiles = await profilesRes.json();

      console.log("Users:", users);
      console.log("Profiles:", profiles);

      setUsers(users);
      setProfiles(profiles);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    await fetch(`${API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  const handleChangeRole = async (id, newRole) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    await fetch(`${API_URL}/admin/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });
    fetchData();
  };

  const handleDeleteProfile = async (id) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    await fetch(`${API_URL}/admin/profiles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Users Table */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Users</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u._id, e.target.value)}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDeleteUser(u._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Profiles Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Profiles</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Income</TableCell>
              <TableCell>Expenses</TableCell>
              <TableCell>Savings</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.userId?.email}</TableCell>
                <TableCell>{p.monthlyIncome}</TableCell>
                <TableCell>{p.monthlyExpenses}</TableCell>
                <TableCell>{p.savings}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    onClick={() => handleDeleteProfile(p._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
