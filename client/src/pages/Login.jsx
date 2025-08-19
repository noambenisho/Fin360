import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  Avatar,
  CssBaseline,
  Grid
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await loginUser({ email, password });
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      login(response.token, rememberMe);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
    borderLeft: {
          xs: "0px solid transparent",   // no left space on phones
          sm: "150px solid #e0e0e0",     // smaller gap on tablets
          md: "350px solid #e0e0e0",     // medium screens
          lg: "480px solid #e0e0e0",     // large screens
        },        
        minHeight: "100vh",
        // background: "linear-gradient(to right, #f0f4f8, #d9e4ec)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        width: "100%",
      }}
    >
      <CssBaseline />
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 420,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                color="primary"
              />
            }
            label="Remember me"
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
          >
            Sign In
          </Button>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Link to="/forgot-password" style={{ textDecoration: "none", color: "#1976d2" }}>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link to="/register" style={{ textDecoration: "none", color: "#1976d2" }}>
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
