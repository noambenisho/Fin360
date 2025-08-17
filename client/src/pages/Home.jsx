import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  Alert,
  CircularProgress
} from '@mui/material';
import { PieChart, LineChart } from '@mui/x-charts';
//import { getFinancialSummary } from '../services/financeService';

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFinancialSummary();
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
                ${summary?.income?.toLocaleString()}
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
                ${summary?.expenses?.toLocaleString()}
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
              <Typography variant="h4" color={summary?.netBalance >= 0 ? 'success.main' : 'error.main'}>
                ${summary?.netBalance?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              <Box sx={{ height: 300 }}>
                <PieChart
                  series={[
                    {
                      data: summary?.expenseCategories || [],
                      innerRadius: 30,
                      outerRadius: 100,
                      paddingAngle: 5,
                      cornerRadius: 5,
                    },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Cash Flow
              </Typography>
              <Box sx={{ height: 300 }}>
                <LineChart
                  xAxis={[{ data: summary?.months || [], scaleType: 'band' }]}
                  series={[
                    { data: summary?.monthlyIncome || [], label: 'Income' },
                    { data: summary?.monthlyExpenses || [], label: 'Expenses' },
                  ]}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts and Tips */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Tips
              </Typography>
              {summary?.alerts?.map((alert, index) => (
                <Alert key={index} severity={alert.severity} sx={{ mb: 1 }}>
                  {alert.message}
                </Alert>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Smart Money Tips</Typography>
              <ul>
                {summary?.tips?.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}