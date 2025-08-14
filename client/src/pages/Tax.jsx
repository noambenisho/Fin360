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

// Israeli 2025 tax brackets
const taxBrackets = [
  { min: 0, max: 84120, rate: 0.10 },
  { min: 84120, max: 120720, rate: 0.14 },
  { min: 120720, max: 193800, rate: 0.20 },
  { min: 193800, max: 269280, rate: 0.31 },
  { min: 269280, max: 560280, rate: 0.35 },
  { min: 560280, max: 721560, rate: 0.47 },
  { min: 721560, max: Infinity, rate: 0.50 }
];

// Surtax (Mas Yesef) threshold and rate
const surtaxThreshold = 721560;
const surtaxRate = 0.03;

export default function IsraeliTaxCalculator() {
  const [formData, setFormData] = useState({
    income: '',
    period: 'annual',
    deductions: '0'
  });
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateTax = () => {
    let income = parseFloat(formData.income) || 0;
    if (formData.period === 'monthly') income *= 12;

    const deductions = parseFloat(formData.deductions) || 0;
    const taxableIncome = Math.max(0, income - deductions);

    let tax = 0;
    const bracketDetails = taxBrackets.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, amount: 0 };
      const incomeInBracket = Math.min(bracket.max, taxableIncome) - bracket.min;
      const bracketTax = incomeInBracket * bracket.rate;
      tax += bracketTax;
      return { ...bracket, amount: bracketTax };
    });

    let surtax = 0;
    if (taxableIncome > surtaxThreshold) {
      surtax = (taxableIncome - surtaxThreshold) * surtaxRate;
      tax += surtax;
    }

    setResults({
      taxableIncome,
      totalTax: tax,
      surtax,
      effectiveRate: income ? tax / income : 0,
      bracketDetails,
      netIncome: income - tax
    });
  };

  // Helper to display numbers based on selected period
  const formatValue = (annualValue) => {
    return formData.period === 'monthly' ? annualValue / 12 : annualValue;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#f8f9fa', minHeight: '100vh' }}>

      <br/>
      <br/>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Enter Your Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={formData.period === 'monthly' ? 'Monthly Income (₪)' : 'Annual Income (₪)'}
                    name="income"
                    type="number"
                    value={formData.income}
                    onChange={handleChange}
                    variant="outlined"
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
                    fullWidth
                    label="Deductions (₪)"
                    name="deductions"
                    type="number"
                    value={formData.deductions}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={calculateTax}
                    sx={{ mt: 1, py: 1.5, fontSize: '1rem' }}
                    disabled={!formData.income}
                  >
                    Calculate
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        {results && (
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Results ({formData.period === 'monthly' ? 'Monthly' : 'Annual'})
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Taxable Income</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      ₪{formatValue(results.taxableIncome).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Total Tax</Typography>
                    <Typography variant="h5" fontWeight="bold" color="error">
                      ₪{formatValue(results.totalTax).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Net Income</Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ₪{formatValue(results.netIncome).toLocaleString()}
                    </Typography>
                  </Grid>
                  {results.surtax > 0 && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2">Surtax</Typography>
                      <Typography variant="h6" color="warning.main">
                        ₪{formatValue(results.surtax).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2">Effective Rate</Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {(results.effectiveRate * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Tax Bracket Breakdown
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                          <TableCell>
                            ₪{bracket.min.toLocaleString()} - {bracket.max === Infinity ? '∞' : `₪${bracket.max.toLocaleString()}`}
                          </TableCell>
                          <TableCell align="right">{(bracket.rate * 100).toFixed(0)}%</TableCell>
                          <TableCell align="right">₪{formatValue(bracket.amount).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Tax Distribution Chart
                </Typography>
                <Box sx={{ height: 300 }}>
                  <LineChart
                    xAxis={[{ data: results.bracketDetails.map((_, i) => `Bracket ${i + 1}`), scaleType: 'band' }]}
                    series={[{ data: results.bracketDetails.map(b => formatValue(b.amount)) }]}
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
