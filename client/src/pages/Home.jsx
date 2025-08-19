// client/src/pages/Home.jsx
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
  CardMedia,
  Link,
  CardActionArea,
  Skeleton,
} from "@mui/material";
import { PieChart } from "@mui/x-charts";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { keyframes } from "@mui/system";

import { getFinancialSummary } from "../services/financeService.jsx";
import * as userService from "../services/userService";
import tips from "../context/tips.json";

// Finnhub key (consider moving to .env for production)
const FINNHUB_KEY = "d2gtoshr01qon4e9igpgd2gtoshr01qon4e9igq0";

// More noticeable hero animation: gentle float + glow pulse
const floatGlow = keyframes`
  0%   { transform: translateY(0px) scale(1); box-shadow: 0 10px 30px rgba(33,150,243,.20); }
  50%  { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 60px rgba(76,175,80,.28); }
  100% { transform: translateY(0px) scale(1); box-shadow: 0 10px 30px rgba(33,150,243,.20); }
`;

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [tipOfTheDay, setTipOfTheDay] = useState("");

  // 🔹 News state (Finnhub)
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");

      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setTipOfTheDay(randomTip);

      try {
        const me = await userService.getUser();
        const u = me?.user || me;
        setUser({
          firstName: u?.firstName || "",
          lastName: u?.lastName || "",
          email: u?.email || "",
        });
        setIsAuthed(true);
      } catch {
        setIsAuthed(false);
      }

      try {
        if (isAuthed) {
          const data = await getFinancialSummary();
          setSummary(data);
        } else {
          setSummary(null);
        }
      } catch (err) {
        setError(err?.response?.data?.msg || err.message);
      } finally {
        setLoading(false);
      }
    };

    // 🔹 Fetch Finnhub news (keep only top 3)
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError("");
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`
        );
        if (!res.ok) throw new Error(`News HTTP ${res.status}`);
        const data = await res.json();
        const items = (data || [])
          .slice(0, 3)
          .map((n) => ({
            id: `${n.id || n.datetime}-${n.url}`,
            headline: n.headline,
            summary: n.summary,
            source: n.source,
            url: n.url,
            image: n.image,
            datetime: n.datetime, // seconds epoch
            category: n.category,
          }));
        setNews(items);
      } catch (e) {
        setNewsError("Failed to load market news");
      } finally {
        setNewsLoading(false);
      }
    };

    fetchAll();
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const welcomeName = useMemo(() => {
    if (!user) return "there";
    return user.firstName || user.email?.split("@")[0] || "there";
  }, [user]);

  if (loading) return <CircularProgress />;
  if (error && isAuthed) return <Alert severity="error">{error}</Alert>;

  const income = summary?.income ?? 0;
  const expenses = summary?.expenses ?? 0;
  const net = summary?.netBalance ?? income - expenses;

  // 🔹 “Top 3” News UI
  const NewsSection = (
    <Grid item xs={12}>
      <Card
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6">Top Financial News</Typography>
            <Chip label="Finnhub" size="small" variant="outlined" />
          </Box>

          {newsLoading && (
            <Grid container spacing={2}>
              {[0, 1, 2].map((i) => (
                <Grid item xs={12} md={i === 0 ? 6 : 3} key={i}>
                  <Card variant="outlined" sx={{ height: i === 0 ? 280 : 240 }}>
                    <Skeleton variant="rectangular" height="70%" />
                    <Box sx={{ p: 1.5 }}>
                      <Skeleton width="80%" />
                      <Skeleton width="60%" />
                      <Skeleton width="40%" />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {newsError && <Alert severity="error">{newsError}</Alert>}

          {!newsLoading && !newsError && news.length > 0 && (
            <Grid container spacing={2}>
              {/* Featured (bigger) */}
              <Grid item xs={12} md={6}>
                <Card
                  variant="outlined"
                  sx={{
                    height: 280,
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 2,
                  }}
                >
                  <CardActionArea
                    href={news[0].url}
                    target="_blank"
                    rel="noopener"
                    sx={{ height: "100%" }}
                  >
                    {news[0].image ? (
                      <CardMedia
                        component="img"
                        height="100%"
                        image={news[0].image}
                        alt={news[0].headline}
                        sx={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{ height: "100%", bgcolor: "action.hover" }} />
                    )}

                    {/* gradient overlay + text */}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.65) 75%)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: 16,
                        right: 16,
                        bottom: 14,
                        color: "common.white",
                      }}
                    >
                      <Chip
                        size="small"
                        label={news[0].source}
                        sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.22)", color: "#fff" }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          textShadow: "0 1px 2px rgba(0,0,0,.6)",
                        }}
                      >
                        {news[0].headline}
                      </Typography>
                      {news[0].summary && (
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            textShadow: "0 1px 2px rgba(0,0,0,.6)",
                          }}
                        >
                          {news[0].summary.slice(0, 120)}
                          {news[0].summary.length > 120 ? "…" : ""}
                        </Typography>
                      )}
                      <Typography variant="caption" sx={{ opacity: 0.85 }}>
                        {new Date((news[0].datetime || 0) * 1000).toLocaleString()}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>

              {/* Two compact cards */}
              {news.slice(1).map((item) => (
                <Grid item xs={12} md={3} key={item.id}>
                  <Card
                    variant="outlined"
                    sx={{ height: 240, display: "flex", flexDirection: "column" }}
                  >
                    <CardActionArea
                      href={item.url}
                      target="_blank"
                      rel="noopener"
                      sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
                    >
                      {item.image ? (
                        <CardMedia
                          component="img"
                          height="120"
                          image={item.image}
                          alt={item.headline}
                          sx={{ objectFit: "cover" }}
                        />
                      ) : (
                        <Box sx={{ height: 120, bgcolor: "action.hover" }} />
                      )}
                      <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                        <Chip
                          label={item.source}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          gutterBottom
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.headline}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {new Date((item.datetime || 0) * 1000).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1, px: { xs: 1, sm: 2 }, pb: 4 }}>
      <br />
      <br />
      {/* Welcome Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          background:
            "linear-gradient(135deg, rgba(25,118,210,0.22) 0%, rgba(76,175,80,0.22) 100%)",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          animation: `${floatGlow} 3.2s ease-in-out infinite`,
        }}
      >
        {/* Decorative glow blob */}
        <Box
          sx={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            filter: "blur(40px)",
            background:
              "radial-gradient(circle at 30% 30%, rgba(76,175,80,.35), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 64,
            height: 64,
            boxShadow: 3,
          }}
        >
          <AccountBalanceWalletOutlinedIcon />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {isAuthed ? `Welcome back, ${welcomeName} 👋` : "Welcome 👋"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {isAuthed
              ? "Your personal finance hub — quick overview below."
              : "Login to see your information and personalized insights."}
          </Typography>
        </Box>

        <Chip
          label={isAuthed ? (net >= 0 ? "On Track" : "Review Budget") : "Guest"}
          color={isAuthed ? (net >= 0 ? "success" : "warning") : "default"}
          variant="filled"
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {/* If not logged in — keep CTA */}
      {!isAuthed && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            p: 3,
            mb: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              You’re not logged in
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Please log in to view your income, expenses, and recent
              transactions.
            </Typography>
            <Button
              variant="contained"
              onClick={() => (window.location.href = "/login")}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Authenticated content */}
      {isAuthed && (
        <>
          {/* KPI Islands */}
          <Grid container spacing={2.5} sx={{ mb: 1, mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  backdropFilter: "blur(4px)",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar sx={{ bgcolor: "success.main" }}>
                      <TrendingUpOutlinedIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Income
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    ₪{(Number(income) || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  backdropFilter: "blur(4px)",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar sx={{ bgcolor: "error.main" }}>
                      <TrendingDownOutlinedIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Expenses
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    ₪{(Number(expenses) || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  backdropFilter: "blur(4px)",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar sx={{ bgcolor: net >= 0 ? "success.main" : "warning.main" }}>
                      <SavingsOutlinedIcon />
                    </Avatar>
                    <Typography variant="h6" color="text.secondary">
                      Net Balance
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={net >= 0 ? "success.main" : "error.main"}
                  >
                    ₪{(Number(net) || 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Middle Row: Expense & Income pies */}
          <Grid container spacing={2.5} sx={{ mb: 1 }}>
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Expenses by Category
                  </Typography>
                  {summary?.expenseCategories?.length ? (
                    <PieChart
                      series={[
                        {
                          data: summary.expenseCategories.map((cat) => ({
                            id: cat.id,
                            value: cat.value,
                            label: cat.label,
                          })),
                          highlightScope: { faded: "global", highlighted: "item" },
                          faded: { innerRadius: 30, additionalRadius: -30 },
                        },
                      ]}
                      height={300}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      No expense data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Income by Category
                  </Typography>
                  {summary?.incomeCategories?.length ? (
                    <PieChart
                      series={[
                        {
                          data: summary.incomeCategories.map((cat) => ({
                            id: cat.id,
                            value: cat.value,
                            label: cat.label,
                          })),
                          highlightScope: { faded: "global", highlighted: "item" },
                          faded: { innerRadius: 30, additionalRadius: -30 },
                        },
                      ]}
                      height={300}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      No income data available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Lower Row: Recent transactions + Tip */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} md={7}>
              <Card
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Transactions
                  </Typography>
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
                          {idx < summary.recentTransactions.length - 1 && (
                            <Divider sx={{ mt: 1 }} />
                          )}
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
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 100%)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Financial Tip of the Day
                  </Typography>

                  {Array.isArray(tips) && tips.length > 0 ? (
                    <Typography variant="body1">
                      {tipOfTheDay || tips[Math.floor(Math.random() * tips.length)]}
                    </Typography>
                  ) : (
                    <Typography color="text.secondary">No tips found in tips.json.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* 🔹 News section (Top 3): visible for BOTH guests and authed users */}
      <Grid container spacing={2.5}>
        {NewsSection}
      </Grid>
    </Box>
  );
}
