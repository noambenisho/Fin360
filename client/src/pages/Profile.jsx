// client/src/pages/Profile.jsx
import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Divider, Avatar, CircularProgress, Alert, Tabs, Tab
} from "@mui/material";
import { Email, Phone, MonetizationOn } from "@mui/icons-material";

import * as userService from "../services/userService";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

export default function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // user + profile states
  const [user, setUser] = useState(null);
  const [userForm, setUserForm] = useState({ firstName: "", lastName: "", email: "" });

  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    phone: "",
    yearlySavingsGoal: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    savings: "",
    monthlyInvestment: ""
  });

  // change password states
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // backend returns { user, profile }
        const me = await userService.getUser();

        const u = me.user || me;
        const p = me.profile || {};

        setUser({
          _id: u._id || u.id,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || ""
        });

        setUserForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || ""
        });

        setProfile(p || null);
        setProfileForm({
          phone: p.phone || "",
          yearlySavingsGoal: p.yearlySavingsGoal != null ? String(p.yearlySavingsGoal) : "",
          monthlyIncome: p.monthlyIncome != null ? String(p.monthlyIncome) : "",
          monthlyExpenses: p.monthlyExpenses != null ? String(p.monthlyExpenses) : "",
          savings: p.savings != null ? String(p.savings) : "",
          monthlyInvestment: p.monthlyInvestment != null ? String(p.monthlyInvestment) : ""
        });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUserChange = (e) =>
    setUserForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleProfileChange = (e) =>
    setProfileForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const handleTabChange = (_e, v) => setTabValue(v);

  // Save BOTH user + profile
  const handleSaveAll = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        // personal
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        // financial (omit if empty to avoid overwriting)
        phone: profileForm.phone || undefined,
        yearlySavingsGoal:
          profileForm.yearlySavingsGoal === "" ? undefined : Number(profileForm.yearlySavingsGoal),
        monthlyIncome:
          profileForm.monthlyIncome === "" ? undefined : Number(profileForm.monthlyIncome),
        monthlyExpenses:
          profileForm.monthlyExpenses === "" ? undefined : Number(profileForm.monthlyExpenses),
        savings:
          profileForm.savings === "" ? undefined : Number(profileForm.savings),
        monthlyInvestment:
          profileForm.monthlyInvestment === "" ? undefined : Number(profileForm.monthlyInvestment),
      };

      const { user: updatedUser, profile: updatedProfile } = await userService.updateUser(payload);

      setUser({
        _id: (user?._id) || updatedUser?._id,
        firstName: updatedUser?.firstName ?? userForm.firstName,
        lastName: updatedUser?.lastName ?? userForm.lastName,
        email: updatedUser?.email ?? userForm.email
      });

      const p = updatedProfile || {};
      setProfile(p);
      setProfileForm({
        phone: p.phone || "",
        yearlySavingsGoal: p.yearlySavingsGoal != null ? String(p.yearlySavingsGoal) : "",
        monthlyIncome: p.monthlyIncome != null ? String(p.monthlyIncome) : "",
        monthlyExpenses: p.monthlyExpenses != null ? String(p.monthlyExpenses) : "",
        savings: p.savings != null ? String(p.savings) : "",
        monthlyInvestment: p.monthlyInvestment != null ? String(p.monthlyInvestment) : ""
      });

      setSuccessMessage("Saved user and profile successfully");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // Change password handler
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm(s => ({ ...s, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("Please fill all password fields.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    try {
      setPwLoading(true);
      await userService.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess("Password updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(""), 2500);
    } catch (err) {
      setPwError(err?.response?.data?.msg || err?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <br/>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Profile Information" />
        <Tab label="Change Password" />
        <Tab label="Financial Summary" />
      </Tabs>

      {/* Tab 0 - combined personal + financial edit */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Avatar sx={{ width: 120, height: 120, mb: 2 }}>
                  {((user?.firstName || " ")[0] || "") + ((user?.lastName || " ")[0] || "")}
                </Avatar>
                <Typography variant="h5">{user?.firstName} {user?.lastName}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  <Email fontSize="small" sx={{ mr: 1 }} />
                  {user?.email}
                </Typography>
                <Typography color="text.secondary">
                  <Phone fontSize="small" sx={{ mr: 1 }} />
                  {profile?.phone || "Not provided"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Edit Personal & Financial</Typography>
                <form onSubmit={handleSaveAll}>
                  <Grid container spacing={2}>
                    {/* User fields */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={userForm.firstName}
                        onChange={handleUserChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={userForm.lastName}
                        onChange={handleUserChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Email"
                        name="email"
                        value={userForm.email}
                        onChange={handleUserChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                    {/* Profile fields */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Financial Fields (saved to Profile)</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Yearly Savings Goal"
                        name="yearlySavingsGoal"
                        type="number"
                        value={profileForm.yearlySavingsGoal}
                        onChange={handleProfileChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Monthly Income"
                        name="monthlyIncome"
                        type="number"
                        value={profileForm.monthlyIncome}
                        onChange={handleProfileChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Monthly Expenses"
                        name="monthlyExpenses"
                        type="number"
                        value={profileForm.monthlyExpenses}
                        onChange={handleProfileChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Current Savings"
                        name="savings"
                        type="number"
                        value={profileForm.savings}
                        onChange={handleProfileChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Monthly Investment"
                        name="monthlyInvestment"
                        type="number"
                        value={profileForm.monthlyInvestment}
                        onChange={handleProfileChange}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button type="submit" variant="contained">Save Personal & Financial</Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1 - Change password */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ mt: 2, maxWidth: 520 }}>
          <CardContent component="form" onSubmit={handleChangePassword}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>

            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
            {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={pwForm.newPassword}
                  onChange={handlePwChange}
                  fullWidth
                  required
                  helperText="At least 6 characters"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={handlePwChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={pwLoading}>
                  {pwLoading ? "Updating..." : "Update Password"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2 - Financial summary read-only */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Financial Status</Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <MonetizationOn color="primary" sx={{ mr: 1 }} />
                  Yearly Savings Goal: {profile?.yearlySavingsGoal ? `$${Number(profile.yearlySavingsGoal).toLocaleString()}` : "Not set"}
                </Typography>
                <Typography>
                  Current progress: ${Number(profile?.savings || 0).toLocaleString()} ({profile?.yearlySavingsGoal ? `${Math.min(((profile.savings || 0) / profile.yearlySavingsGoal) * 100, 100).toFixed(1)}%` : "0%"})
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Summary</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>Monthly Income: ${Number(profile?.monthlyIncome || 0).toLocaleString()}</Typography>
                <Typography>Monthly Expenses: ${Number(profile?.monthlyExpenses || 0).toLocaleString()}</Typography>
                <Typography>Current Savings: ${Number(profile?.savings || 0).toLocaleString()}</Typography>
                <Typography>Monthly Investment: ${Number(profile?.monthlyInvestment || 0).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
