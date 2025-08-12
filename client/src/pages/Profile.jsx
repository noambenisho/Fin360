import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Email, Phone, MonetizationOn, Lock } from '@mui/icons-material';
import { getProfile, updateProfile, changePassword } from '../services/userService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Profile() {
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    yearlySavingsGoal: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          yearlySavingsGoal: data.yearlySavingsGoal
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditMode(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Profile Information" />
          <Tab label="Change Password" />
          <Tab label="Financial Summary" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 120, height: 120, mb: 2 }}>
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  <Email fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {profile.email}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  {profile.phone || 'Not provided'}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {editMode ? (
                  <form onSubmit={handleProfileSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleProfileChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleProfileChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleProfileChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleProfileChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Yearly Savings Goal ($)"
                          name="yearlySavingsGoal"
                          type="number"
                          value={formData.yearlySavingsGoal}
                          onChange={handleProfileChange}
                          InputProps={{ inputProps: { min: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary">
                          Save Changes
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">First Name:</Typography>
                        <Typography>{profile.firstName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle1">Last Name:</Typography>
                        <Typography>{profile.lastName}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Email:</Typography>
                        <Typography>{profile.email}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Phone:</Typography>
                        <Typography>{profile.phone || 'Not provided'}</Typography>
                      </Grid>
                    </Grid>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Financial Goals
                    </Typography>
                    <Typography variant="subtitle1">Yearly Savings Goal:</Typography>
                    <Typography>
                      {profile.yearlySavingsGoal ? 
                        `$${profile.yearlySavingsGoal.toLocaleString()}` : 
                        'Not set'}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        helperText="Password must be at least 6 characters"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary">
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Password Requirements
                </Typography>
                <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                  <ul>
                    <li>Minimum 6 characters</li>
                    <li>Should not be easily guessable</li>
                    <li>Should not be the same as your previous passwords</li>
                  </ul>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Lock fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Your password is securely encrypted and never stored in plain text.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Status
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <MonetizationOn color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Yearly Savings Goal: {profile.yearlySavingsGoal ? 
                    `$${profile.yearlySavingsGoal.toLocaleString()}` : 'Not set'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Current progress: $0 (0%)
                </Typography>
                <Box sx={{ width: '100%', height: 20, backgroundColor: '#e0e0e0', borderRadius: 10, mt: 2 }}>
                  <Box sx={{ 
                    width: '0%', 
                    height: '100%', 
                    backgroundColor: 'primary.main', 
                    borderRadius: 10 
                  }} />
                </Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Monthly Performance
                </Typography>
                <Typography variant="body1">
                  You're on track to meet your goals.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personalized Tips
                </Typography>
                <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                  <ul>
                    <li>Consider increasing your monthly savings by 5% to reach your goal faster</li>
                    <li>Review your expense categories for potential savings</li>
                    <li>Your mortgage payments are higher than average - consider refinancing</li>
                  </ul>
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Alerts
                </Typography>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  Unusual spending detected in Entertainment category this month.
                </Alert>
                <Alert severity="info">
                  Your credit score has improved by 15 points this quarter.
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}