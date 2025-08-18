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
                ${summary?.income?.toFixed(2) || "0.00"}
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
                ${summary?.expenses?.toFixed(2) || "0.00"}
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
                color={summary?.netBalance >= 0 ? "success.main" : "error.main"}
              >
                ${summary?.netBalance?.toFixed(2) || "0.00"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Categories Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expenses by Category
              </Typography>
              {summary?.expenseCategories &&
              summary.expenseCategories.length > 0 ? (
                <PieChart
                  series={[
                    {
                      data: summary.expenseCategories.map(cat => ({
                        id: cat.id,
                        value: cat.value,
                        label: cat.label
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

        {/* Income Categories Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Income by Category
              </Typography>
              {summary?.incomeCategories &&
              summary.incomeCategories.length > 0 ? (
                <PieChart
                  series={[
                    {
                      data: summary.incomeCategories.map(cat => ({
                        id: cat.id,
                        value: cat.value,
                        label: cat.label
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

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {summary?.recentTransactions &&
              summary.recentTransactions.length > 0 ? (
                <div style={{ maxHeight: "300px", overflow: "auto" }}>
                  {summary.recentTransactions.map((transaction, index) => (
                    <Box key={transaction._id || index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" component="div">
                        {transaction.description || "No description"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={
                          transaction.type === "income"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        ${transaction.amount.toFixed(2)} -{" "}
                        {transaction.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Typography>
                      {index < summary.recentTransactions.length - 1 && (
                        <Divider sx={{ mt: 1 }} />
                      )}
                    </Box>
                  ))}
                </div>
              ) : (
                <Typography color="text.secondary">
                  No recent transactions
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Smart Tips and News */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Tip of the Day
              </Typography>
              {summary?.tip ? (
                <>
                  <Typography variant="body1" color="text.primary" gutterBottom>
                    {summary.tip.content}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Category: {summary.tip.category}
                  </Typography>
                </>
              ) : (
                <CircularProgress size={20} />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Latest Financial News
              </Typography>
              {summary?.news ? (
                <div style={{ maxHeight: "300px", overflow: "auto" }}>
                  {summary.news.map((item, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" component="div">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.summary}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Source: {item.source} -{" "}
                        {new Date(item.timePublished).toLocaleString()}
                      </Typography>
                      {index < summary.news.length - 1 && (
                        <Divider sx={{ mt: 1 }} />
                      )}
                    </Box>
                  ))}
                </div>
              ) : (
                <CircularProgress size={20} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}