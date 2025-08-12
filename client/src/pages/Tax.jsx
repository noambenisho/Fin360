import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import { LineChart } from '@mui/x-charts';

const taxBrackets = [
  { min: 0, max: 10000, rate: 0.1 },
  { min: 10001, max: 40000, rate: 0.15 },
  { min: 40001, max: 80000, rate: 0.2 },
  { min: 80001, max: 160000, rate: 0.25 },
  { min: 160001, max: Infinity, rate: 0.3 }
];

export default function Tax() {
  const [formData, setFormData] = useState({
    income: '',
    period: 'annual',
    maritalStatus: 'single',
    deductions: '0'
  });
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const calculateTax = () => {
    let income = parseFloat(formData.income);
    if (formData.period === 'monthly') income *= 12;
    
    const deductions = parseFloat(formData.deductions) || 0;
    const taxableIncome = Math.max(0, income - deductions);
    
    let tax = 0;
    const bracketDetails = taxBrackets.map(bracket => {
      const bracketRange = Math.min(bracket.max, taxableIncome) - bracket.min;
      if (bracketRange <= 0) return { ...bracket, amount: 0 };
      
      const bracketTax = bracketRange * bracket.rate;
      tax += bracketTax;
      return { ...bracket, amount: bracketTax };
    });

    setResults({
      taxableIncome,
      totalTax: tax,
      effectiveRate: tax / income,
      bracketDetails,
      netIncome: income - tax,
      monthlyNetIncome: (income - tax) / 12
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Income Tax Calculator
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Input Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Income"
                    name="income"
                    type="number"
                    value={formData.income}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Period"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                  >
                    <MenuItem value="annual">Annual</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Marital Status"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                  >
                    <MenuItem value="single">Single</MenuItem>
                    <MenuItem value="married">Married</MenuItem>
                    <MenuItem value="head">Head of Household</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Deductions"
                    name="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={calculateTax}
                    disabled={!formData.income}
                  >
                    Calculate Tax
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {results && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Taxable Income:</Typography>
                    <Typography variant="h5">${results.taxableIncome.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Total Tax:</Typography>
                    <Typography variant="h5">${results.totalTax.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Effective Rate:</Typography>
                    <Typography variant="h5">{(results.effectiveRate * 100).toFixed(1)}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Net Income:</Typography>
                    <Typography variant="h5">${results.netIncome.toLocaleString()}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Tax Bracket Breakdown
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bracket</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Tax</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.bracketDetails.map((bracket, index) => (
                        <TableRow key={index}>
                          <TableCell>${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}</TableCell>
                          <TableCell align="right">{(bracket.rate * 100).toFixed(0)}%</TableCell>
                          <TableCell align="right">${bracket.amount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Tax Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <LineChart
                    xAxis={[{ data: results.bracketDetails.map((_, i) => `Bracket ${i + 1}`), scaleType: 'band' }]}
                    series={[{ data: results.bracketDetails.map(b => b.amount) }]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}