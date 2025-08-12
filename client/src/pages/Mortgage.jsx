import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LineChart } from '@mui/x-charts';

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

export default function Mortgage() {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    monthlyPayment: 1000,
    mortgageRate: 4.5,
    investmentRate: 7,
    years: 30
  });
  const [results, setResults] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value)
    });
  };

  const calculate = () => {
    const { monthlyPayment, mortgageRate, investmentRate, years } = formData;
    const months = years * 12;
    const monthlyMortgageRate = mortgageRate / 100 / 12;
    const monthlyInvestmentRate = investmentRate / 100 / 12;

    // Mortgage calculation
    const mortgageTotal = monthlyPayment * months;
    const mortgageInterest = mortgageTotal - (monthlyPayment / monthlyMortgageRate * (1 - Math.pow(1 + monthlyMortgageRate, -months)));

    // Investment calculation
    let investmentValue = 0;
    const investmentGrowth = [];
    for (let i = 0; i < months; i++) {
      investmentValue = (investmentValue + monthlyPayment) * (1 + monthlyInvestmentRate);
      investmentGrowth.push(investmentValue);
    }

    setResults({
      mortgageTotal,
      mortgageInterest,
      investmentValue,
      investmentGrowth,
      comparison: investmentValue - mortgageTotal,
      monthlyBreakdown: Array.from({ length: months }, (_, i) => i + 1)
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Mortgage vs. Investment Calculator
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Input Parameters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Monthly Payment ($)"
                    name="monthlyPayment"
                    type="number"
                    value={formData.monthlyPayment}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mortgage Rate (%)"
                    name="mortgageRate"
                    type="number"
                    value={formData.mortgageRate}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Investment Return (%)"
                    name="investmentRate"
                    type="number"
                    value={formData.investmentRate}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Time Period (Years)"
                    name="years"
                    type="number"
                    value={formData.years}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 1, max: 50 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={calculate}
                  >
                    Calculate
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {results && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Summary" />
                    <Tab label="Comparison" />
                    <Tab label="Yearly Breakdown" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Mortgage Scenario
                      </Typography>
                      <Typography>
                        <strong>Total Payments:</strong> ${results.mortgageTotal.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Interest:</strong> ${results.mortgageInterest.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Principal:</strong> ${(results.mortgageTotal - results.mortgageInterest).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Investment Scenario
                      </Typography>
                      <Typography>
                        <strong>Final Value:</strong> ${results.investmentValue.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Contributions:</strong> ${(formData.monthlyPayment * formData.years * 12).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Growth:</strong> ${(results.investmentValue - formData.monthlyPayment * formData.years * 12).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6">
                        {results.comparison >= 0 ? (
                          <span style={{ color: 'green' }}>
                            Investing is better by ${Math.abs(results.comparison).toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: 'red' }}>
                            Paying mortgage is better by ${Math.abs(results.comparison).toLocaleString()}
                          </span>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Growth Comparison Over Time
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <LineChart
                      xAxis={[{ data: results.monthlyBreakdown, label: 'Months' }]}
                      series={[
                        { 
                          data: results.monthlyBreakdown.map(m => formData.monthlyPayment * m), 
                          label: 'Mortgage (Total Paid)' 
                        },
                        { 
                          data: results.investmentGrowth, 
                          label: 'Investment Value' 
                        }
                      ]}
                    />
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" gutterBottom>
                    Yearly Breakdown
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Year</TableCell>
                          <TableCell align="right">Mortgage Paid</TableCell>
                          <TableCell align="right">Investment Value</TableCell>
                          <TableCell align="right">Difference</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from({ length: formData.years }, (_, year) => {
                          const month = (year + 1) * 12;
                          const mortgagePaid = formData.monthlyPayment * month;
                          const investmentVal = results.investmentGrowth[month - 1] || 0;
                          const difference = investmentVal - mortgagePaid;
                          
                          return (
                            <TableRow key={year}>
                              <TableCell>{year + 1}</TableCell>
                              <TableCell align="right">${mortgagePaid.toLocaleString()}</TableCell>
                              <TableCell align="right">${investmentVal.toLocaleString()}</TableCell>
                              <TableCell align="right" style={{ color: difference >= 0 ? 'green' : 'red' }}>
                                ${Math.abs(difference).toLocaleString()} {difference >= 0 ? 'ahead' : 'behind'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}