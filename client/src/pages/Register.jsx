import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
  Paper
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { registerUser } from '../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    isAdmin: false,
    adminCode: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';

    if (formData.isAdmin) {
      if (!formData.adminCode) newErrors.adminCode = 'Admin code is required';
      else if (formData.adminCode !== '123') newErrors.adminCode = 'Invalid admin code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, acceptTerms, adminCode, ...registerData } = formData;
      if (formData.isAdmin) registerData.role = 'admin';
      await registerUser(registerData);
      navigate('/login');
    } catch (error) {
      setErrors((prev) => ({ ...prev, api: error.message }));
    }
  };

  return (
    <Box
      sx={{
        //shift right 55px
        borderLeft: {
              xs: "0px solid transparent",   // no left space on phones
              md: "150px solid #e0e0e0",     // medium screens
              lg: "350px solid #e0e0e0",     // large screens
            },
            minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'linear-gradient(to right, #f0f4f8, #d9e4ec)',
        p: 2,
      }}
    >
      <CssBaseline />
      <Container maxWidth="md" disableGutters>
        <Paper
          elevation={6}
          sx={{
            mx: 'auto',
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            maxWidth: 720,            // narrower, looks “shorter”
            backgroundColor: 'white',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Create an Account
            </Typography>

            {errors.api && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {errors.api}
              </Typography>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
              {/* 2-in-a-row layout on >=sm */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={formData.firstName}
                    onChange={handleChange}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                  />
                </Grid>

                {formData.isAdmin && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="adminCode"
                      label="Admin Code"
                      type="password"
                      value={formData.adminCode}
                      onChange={handleChange}
                      error={!!errors.adminCode}
                      helperText={errors.adminCode}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="acceptTerms"
                        color="primary"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                      />
                    }
                    label="I accept the terms and conditions"
                  />
                  {errors.acceptTerms && (
                    <Typography color="error" variant="body2">
                      {errors.acceptTerms}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isAdmin}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            isAdmin: checked,
                            adminCode: checked ? prev.adminCode : '',
                          }));
                        }}
                        name="isAdmin"
                      />
                    }
                    label="Register as Admin"
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.25, borderRadius: 2 }}
              >
                Sign Up
              </Button>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
