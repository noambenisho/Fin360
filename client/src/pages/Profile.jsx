import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import { PieChart } from "@mui/x-charts";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { keyframes } from "@mui/system";

import { getFinancialSummary } from "../services/financeService.jsx";
import * as userService from "../services/userService";

const pulse = keyframes`
  0% { transform: translateY(0px); opacity: .95; }
  50% { transform: translateY(-2px); opacity: 1; }
  100% { transform: translateY(0px); opacity: .95; }
`;

export default function Home() {
  const [authed, setAuthed] = useState(null); // null=unknown, true/false
  const [user, setUser] = useState(null);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Detect auth + load user
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const me = await userService.getUser(); // backend returns { user, profile }
        const u = me?.user || me || {};
        setUser({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
        });
        setAuthed(true);
      } catch (_e) {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // 2) If authed, fetch financial summary
  useEffect(() => {
    if (authed !== true) return;
    const loadSummary = async () => {
      try {
        setLoading(true);
        const data = await getFinancialSummary();
        setSummary(data);
      } catch (err) {
        setError(err?.response?.data?.msg || err.message || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [authed]);

  const welcomeName = useMemo(() => {
    if (!user) return "there";
    return user.firstName || user.email?.split("@")[0] || "there";
  }, [user]);

  if (loading && authed === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ---------- Logged OUT UI ----------
  if (authed === false) {
    return (
      <Box sx={{ flexGrow: 1, px: { xs: 1, sm: 2 }, pb: 4 }}>
        {/* Welcome hero (logged out) */}
        <Box
          sx={{
            mb: 3,
            borderRadius: 4,
            p: { xs: 2.5, sm: 3.5 },
            background:
              "linear-gradient(135deg, rgba(25,118,210,0.18) 0%, rgba(76,175,80,0.18) 100%)",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2.5,
            animation: `${pulse} 3s ease-in-out infinite`,
          }}
        >
          <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, boxShadow: 2 }}>
            <AccountBalanceWalletOutlinedIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
              Welcome to Fin360 👋
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Log in to see your personalized dashboard and financial insights.
            </Typography>
          </Box>
          <Button
            href="/login"
            variant="contained"
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Log in
          </Button>
        </Box>

        {/* Public content area — you can place public news here if you have a public endpoint */}
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <Card
              elevation={0}
              sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Latest Financial News
                </Typography>
                <Typography color="text.secondary">
                  Please log in to see your personalized news feed.
                </Typography>
                {/* If you have a public news service, render it here instead of the placeholder */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ---------- Logged IN UI ----------
  const income = summary?.income ?? 0;
  const expenses = summary?.expenses ?? 0;
  const net = summary?.netBalance ?? (income - expenses);
  const tipText = summary?.tip?.content || (Array.isArray(summary?.tips) ? summary.tips[0] : null);

  return (
    <Box sx={{ flexGrow: 1, px: { xs: 1, sm: 2 }, pb: 4 }}>
      {/* Welcome hero (logged in) */}
      <Box
        sx={{
          mb: 3,
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.18) 0%, rgba(76,175,80,0.18) 100%)",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          animation: `${pulse} 3s ease-in-out infinite`,
        }}
      >
        <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, boxShadow: 2 }}>
          <AccountBalanceWalletOutlinedIcon />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
            Welcome back, {welcomeName} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Here’s a quick snapshot of your month.
          </Typography>
        </Box>
        <Chip
          label={net >= 0 ? "On Track" : "Review Budget"}
          color={net >= 0 ? "success" : "warning"}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* KPI Islands */}
      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <TrendingUpOutlinedIcon />
                </Avatar>
                <Typography variant="h6" color="text.secondary">Monthly Income</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>₪{(Number(income) || 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar sx={{ bgcolor: "error.main" }}>
                  <TrendingDownOutlinedIcon />
                </Avatar>
                <Typography variant="h6" color="text.secondary">Monthly Expenses</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>₪{(Number(expenses) || 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar sx={{ bgcolor: net >= 0 ? "success.main" : "warning.main" }}>
                  <SavingsOutlinedIcon />
                </Avatar>
                <Typography variant="h6" color="text.secondary">Net Balance</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color={net >= 0 ? "success.main" : "error.main"}>
                ₪{(Number(net) || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Middle row: Expenses pie + Income pie */}
      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
              {summary?.expenseCategories?.length ? (
                <PieChart
                  series={[
                    {
                      data: summary.expenseCategories.map((cat) => ({
                        id: cat.id, value: cat.value, label: cat.label,
                      })),
                      highlightScope: { faded: "global", highlighted: "item" },
                      faded: { innerRadius: 30, additionalRadius: -30 },
                    },
                  ]}
                  height={300}
                />
              ) : (
                <Typography color="text.secondary">No expense data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Income by Category</Typography>
              {summary?.incomeCategories?.length ? (
                <PieChart
                  series={[
                    {
                      data: summary.incomeCategories.map((cat) => ({
                        id: cat.id, value: cat.value, label: cat.label,
                      })),
                      highlightScope: { faded: "global", highlighted: "item" },
                      faded: { innerRadius: 30, additionalRadius: -30 },
                    },
                  ]}
                  height={300}
                />
              ) : (
                <Typography color="text.secondary">No income data available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lower Row: Recent Transactions + Tips / News */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
              {summary?.recentTransactions?.length ? (
                <div style={{ maxHeight: 320, overflow: "auto" }}>
                  {summary.recentTransactions.map((t, idx) => (
                    <Box key={t._id || idx} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {t.description || "No description"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={t.type === "income" ? "success.main" : "error.main"}
                      >
                        ₪{Number(t.amount).toFixed(2)} — {t.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(t.date).toLocaleDateString()}
                      </Typography>
                      {idx < summary.recentTransactions.length - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </div>
              ) : (
                <Typography color="text.secondary">No recent transactions</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Financial Tip of the Day</Typography>
              {tipText ? (
                <Typography variant="body1" color="text.primary">{tipText}</Typography>
              ) : (
                <Typography color="text.secondary">Tips will appear as your data grows.</Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Latest Financial News</Typography>
              {summary?.news?.length ? (
                <div style={{ maxHeight: 180, overflow: "auto" }}>
                  {summary.news.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.summary}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Source: {item.source} • {new Date(item.timePublished).toLocaleString()}
                      </Typography>
                      {index < summary.news.length - 1 && <Divider sx={{ mt: 1 }} />}
                    </Box>
                  ))}
                </div>
              ) : (
                <Typography color="text.secondary">News feed isn’t available right now.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
