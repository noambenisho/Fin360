import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { PieChart, LineChart } from "@mui/x-charts";
import { getFinancialSummary } from "../services/financeService.jsx";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFinancialSummary();
        console.log("Financial summary data:", data);
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Financial Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Monthly Income
              </Typography>
              <Typography variant="h4">
                ${summary?.totalIncome?.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Monthly Expenses
              </Typography>
              <Typography variant="h4">
                ${summary?.totalExpenses?.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Net Balance
              </Typography>
              <Typography
                variant="h4"
                color={summary?.balance >= 0 ? "success.main" : "error.main"}
              >
                ${summary?.balance?.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* חלק מהתצוגות הוסרו זמנית עד שנוסיף את הנתונים הנוספים */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Smart Tips
              </Typography>
              <ul>
                <li>נסה לחסוך לפחות 20% מההכנסה החודשית שלך</li>
                <li>בדוק את המנויים שלך באופן קבוע</li>
                <li>תכנן הוצאות גדולות מראש</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
