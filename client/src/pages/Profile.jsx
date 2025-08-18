// client/src/pages/Profile.jsx
import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Card, CardContent, Grid,
  Divider, Avatar, CircularProgress, Alert, Tabs, Tab
} from "@mui/material";
import { Email, Phone, MonetizationOn } from "@mui/icons-material";

import * as userService from "../services/userService";
import * as profileService from "../services/profileService";

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

export default function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // user (from /api/user/profile)
  const [user, setUser] = useState(null);
  const [userForm, setUserForm] = useState({ firstName: "", lastName: "", email: "" });

  // profile (from /api/profiles/:userId)
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    phone: "",
    yearlySavingsGoal: "",
    monthlyIncome: "",
    monthlyExpenses: "",
    savings: "",
    monthlyInvestment: ""
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const me = await userService.getUser();
        const uid = me._id || me.id || me._doc?._id;
        setUser({ _id: uid, firstName: me.firstName || "", lastName: me.lastName || "", email: me.email || "" });
        setUserForm({ firstName: me.firstName || "", lastName: me.lastName || "", email: me.email || "" });

        if (uid) {
          try {
            const p = await profileService.getProfileByUserId(uid);
            setProfile(p);
            setProfileForm({
              phone: p.phone || "",
              yearlySavingsGoal: p.yearlySavingsGoal != null ? String(p.yearlySavingsGoal) : "",
              monthlyIncome: p.monthlyIncome != null ? String(p.monthlyIncome) : "",
              monthlyExpenses: p.monthlyExpenses != null ? String(p.monthlyExpenses) : "",
              savings: p.savings != null ? String(p.savings) : "",
              monthlyInvestment: p.monthlyInvestment != null ? String(p.monthlyInvestment) : ""
            });
          } catch (errProfile) {
            // אם אין פרופיל — נשאיר ריק; המשתמש יכול ליצור אותו
            setProfile(null);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUserChange = (e) => setUserForm(s => ({ ...s, [e.target.name]: e.target.value }));
  const handleProfileChange = (e) => setProfileForm(s => ({ ...s, [e.target.name]: e.target.value }));
  const handleTabChange = (_e, v) => setTabValue(v);

  // single handler to save BOTH user + profile
  const handleSaveAll = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      // 1) update user (name/email)
      const userPayload = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email
      };
      const updatedUserResp = await userService.updateUser(userPayload);
      // server might return { user, profile } or user only
      const newUser = updatedUserResp?.user || updatedUserResp || {};
      setUser(prev => ({ _id: prev?._id || newUser._id || prev?._id, firstName: newUser.firstName || userForm.firstName, lastName: newUser.lastName || userForm.lastName, email: newUser.email || userForm.email }));
      setUserForm({ firstName: newUser.firstName || userForm.firstName, lastName: newUser.lastName || userForm.lastName, email: newUser.email || userForm.email });

      // 2) prepare profile payload (convert numeric fields)
      const payload = {
        phone: profileForm.phone || "",
        yearlySavingsGoal: profileForm.yearlySavingsGoal === "" ? 0 : Number(profileForm.yearlySavingsGoal),
        monthlyIncome: profileForm.monthlyIncome === "" ? 0 : Number(profileForm.monthlyIncome),
        monthlyExpenses: profileForm.monthlyExpenses === "" ? 0 : Number(profileForm.monthlyExpenses),
        savings: profileForm.savings === "" ? 0 : Number(profileForm.savings),
        monthlyInvestment: profileForm.monthlyInvestment === "" ? 0 : Number(profileForm.monthlyInvestment)
      };

      // If server returned profile in user update — use it; else call profile endpoints
      let finalProfile = updatedUserResp?.profile || null;
      if (!finalProfile) {
        const uid = user?._id || newUser._id;
        if (!uid) throw new Error("No user id available to update profile");

        try {
          finalProfile = await profileService.updateProfileByUserId(uid, payload);
        } catch (errUpdate) {
          // אם update החזיר 404/לא קיים — צור חדש
          const status = errUpdate?.response?.status;
          if (status === 404 || !profile) {
            finalProfile = await profileService.createProfile({ userId: uid, ...payload });
          } else {
            throw errUpdate;
          }
        }
      }

      // update local state with finalProfile
      if (finalProfile) {
        setProfile(finalProfile);
        setProfileForm({
          phone: finalProfile.phone || "",
          yearlySavingsGoal: finalProfile.yearlySavingsGoal != null ? String(finalProfile.yearlySavingsGoal) : "",
          monthlyIncome: finalProfile.monthlyIncome != null ? String(finalProfile.monthlyIncome) : "",
          monthlyExpenses: finalProfile.monthlyExpenses != null ? String(finalProfile.monthlyExpenses) : "",
          savings: finalProfile.savings != null ? String(finalProfile.savings) : "",
          monthlyInvestment: finalProfile.monthlyInvestment != null ? String(finalProfile.monthlyInvestment) : ""
        });
      }

      setSuccessMessage("Saved user and profile successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>User Profile</Typography>

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
                <Typography color="text.secondary" gutterBottom><Email fontSize="small" sx={{ mr: 1 }} />{user?.email}</Typography>
                <Typography color="text.secondary"><Phone fontSize="small" sx={{ mr: 1 }} />{profile?.phone || "Not provided"}</Typography>
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
                    <Grid item xs={12} sm={6}><TextField label="First Name" name="firstName" value={userForm.firstName} onChange={handleUserChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Last Name" name="lastName" value={userForm.lastName} onChange={handleUserChange} fullWidth /></Grid>
                    <Grid item xs={12}><TextField label="Email" name="email" value={userForm.email} onChange={handleUserChange} fullWidth /></Grid>

                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                    {/* Profile fields */}
                    <Grid item xs={12}><Typography variant="subtitle1">Financial Fields (saved to Profile)</Typography></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Yearly Savings Goal" name="yearlySavingsGoal" type="number" value={profileForm.yearlySavingsGoal} onChange={handleProfileChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Monthly Income" name="monthlyIncome" type="number" value={profileForm.monthlyIncome} onChange={handleProfileChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Monthly Expenses" name="monthlyExpenses" type="number" value={profileForm.monthlyExpenses} onChange={handleProfileChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Current Savings" name="savings" type="number" value={profileForm.savings} onChange={handleProfileChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Monthly Investment" name="monthlyInvestment" type="number" value={profileForm.monthlyInvestment} onChange={handleProfileChange} fullWidth /></Grid>

                    <Grid item xs={12}><Button type="submit" variant="contained">Save Personal & Financial</Button></Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1 - Change password */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6">Change Password</Typography>
            <form onSubmit={async (e) => { e.preventDefault(); /* handled separately if needed */ }}>
              <Typography variant="body2" color="text.secondary">Use the Change Password tab's form on your old code or wire it to changePassword()</Typography>
            </form>
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
                <Typography variant="subtitle1" gutterBottom><MonetizationOn color="primary" sx={{ mr: 1 }} />Yearly Savings Goal: {profile?.yearlySavingsGoal ? `$${Number(profile.yearlySavingsGoal).toLocaleString()}` : "Not set"}</Typography>
                <Typography>Current progress: ${Number(profile?.savings || 0).toLocaleString()} ({profile?.yearlySavingsGoal ? `${Math.min(((profile.savings || 0) / profile.yearlySavingsGoal) * 100, 100).toFixed(1)}%` : "0%"})</Typography>
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
