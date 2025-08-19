import { useState } from "react";
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
  Snackbar,
  Alert,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { LineChart } from "@mui/x-charts";

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Mortgage() {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    // Mortgage details
    initialHousePrice: 2000000,
    downPayment: 500000,
    mortgageRate: 4.5,
    monthlyRent: 4000, // monthly rental income (if applicable)
    houseAppreciationRate: 4,
    // Investment details
    initialInvestment: 500000,
    investmentRate: 7,
    years: 30,
  });
  const [results, setResults] = useState(null);

  const handleTabChange = (_e, v) => setTabValue(v);
  const handleChange = (e) => {
    const { name, value } = e.target;
    const num = value === "" ? "" : parseFloat(value);
    setFormData((p) => ({ ...p, [name]: Number.isNaN(num) ? 0 : num }));
  };

  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showFeedback = (message, severity = "success") => {
    setFeedback({ open: true, message, severity });
  };

  const calculate = () => {
    const {
      initialHousePrice,
      downPayment,
      mortgageRate,
      monthlyRent,
      houseAppreciationRate,
      initialInvestment,
      investmentRate,
      years,
    } = formData;

    if (initialHousePrice > 0 && downPayment / initialHousePrice < 0.25) {
      // Down payment must be at least 25% of the house price (common requirement in Israel)
      showFeedback(
        "Error: Down payment must be at least 25% of the house price to get a mortgage.",
        "error"
      );
      setResults(null);
      return;
    }

    const months = years * 12;
    const r_m = mortgageRate / 100 / 12;
    const r_inv = investmentRate / 100 / 12;
    const r_app = houseAppreciationRate / 100 / 12;

    // Mortgage principal (loan amount)
    const principal0 = Math.max(0, initialHousePrice - downPayment);

    // Monthly mortgage payment (annuity formula)
    const mortgagePayment =
      r_m === 0
        ? principal0 / months
        : (principal0 * (r_m * Math.pow(1 + r_m, months))) /
          (Math.pow(1 + r_m, months) - 1);

    // Monthly net to invest after paying mortgage and collecting rent
    const monthlyInvestment = Math.abs(mortgagePayment - monthlyRent);

    // Initialize balances and accumulators
    let balance = principal0;
    let houseValue = initialHousePrice;
    let investValue = initialInvestment;
    let totalInterest = 0;
    let totalPaid = 0;
    let totalRentalIncome = 0;

    const xAxisMonths = [];
    const investmentGrowth = [];
    const houseValueGrowth = [];
    const mortgageBalanceOverTime = [];
    const buyNetWorthOverTime = [];
    const investNetWorthOverTime = [];

    for (let m = 1; m <= months; m++) {
      // Investment: monthly contribution + growth
      investValue = (investValue + monthlyInvestment) * (1 + r_inv);
      investmentGrowth.push(investValue);

      // House value appreciation
      houseValue *= 1 + r_app;
      houseValueGrowth.push(houseValue);

      // Mortgage interest and principal payments
      const interest = balance * r_m;
      let payment = mortgagePayment;
      if (payment > balance + interest) payment = balance + interest; // last payment adjustment
      const principalPaid = payment - interest;
      balance = Math.max(0, balance - principalPaid);
      totalPaid += payment;
      totalInterest += interest;
      mortgageBalanceOverTime.push(balance);

      // Rental income accumulation
      totalRentalIncome += monthlyRent;

      // Equity and net worth (buy scenario)
      buyNetWorthOverTime.push(houseValue - balance);

      // Net worth (investment scenario)
      investNetWorthOverTime.push(investValue);

      xAxisMonths.push(m);
    }

    const finalEquity = houseValue - balance;
    const buyNetWorthFinal = finalEquity;
    const investNetWorthFinal = investValue;

    setResults({
      months,
      mortgagePayment,
      totalPaid,
      totalInterest,
      balance,
      houseValue,
      finalEquity,
      totalRentalIncome,
      investmentValue: investValue,
      investmentGrowth,
      houseValueGrowth,
      mortgageBalanceOverTime,
      buyNetWorthOverTime,
      investNetWorthOverTime,
      monthlyBreakdown: xAxisMonths,
      monthlyInvestment,
      comparison: investNetWorthFinal - buyNetWorthFinal, // >0 = investment advantage
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
                <Typography
                  variant="subtitle1"
                  sx={{ width: "100%", mt: 2, mb: 1, pl: 2 }}
                >
                  Mortgage Details
                </Typography>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Down Payment (₪)"
                    name="downPayment"
                    type="number"
                    value={formData.downPayment}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Initial House Price (₪)"
                    name="initialHousePrice"
                    type="number"
                    value={formData.initialHousePrice}
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
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="House Appreciation Rate (%)"
                    name="houseAppreciationRate"
                    type="number"
                    value={formData.houseAppreciationRate}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Rental Income (₪)"
                    name="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                <Typography
                  variant="subtitle1"
                  sx={{ width: "100%", mt: 2, mb: 1, pl: 2 }}
                >
                  Investment Details
                </Typography>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Initial Investment (₪)"
                    name="initialInvestment"
                    type="number"
                    value={formData.initialInvestment}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0 } }}
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
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
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
                  <Button fullWidth variant="contained" onClick={calculate}>
                    Calculate
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Snackbar
          open={feedback.open}
          autoHideDuration={4000}
          onClose={() => setFeedback((p) => ({ ...p, open: false }))}
        >
          <Alert
            severity={feedback.severity}
            onClose={() => setFeedback((p) => ({ ...p, open: false }))}
          >
            {feedback.message}
          </Alert>
        </Snackbar>

        {results && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
                        <strong>Total House Price:</strong> ₪
                        {formData.initialHousePrice.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Down Payment:</strong> ₪
                        {formData.downPayment.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Mortgage Loan Amount:</strong> ₪
                        {(
                          formData.initialHousePrice - formData.downPayment
                        ).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Monthly Mortgage Payment:</strong> ₪
                        {results.mortgagePayment.toFixed(2).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Monthly Rental Income:</strong> ₪
                        {formData.monthlyRent.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Monthly Net Investment:</strong> ₪
                        {Math.abs(
                          results.mortgagePayment - formData.monthlyRent,
                          0
                        )
                          .toFixed(2)
                          .toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Final House Value:</strong> ₪
                        {results.houseValue.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Mortgage Paid:</strong> ₪
                        {results.totalPaid.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Interest Paid:</strong> ₪
                        {results.totalInterest.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Final Mortgage Balance:</strong> ₪
                        {results.balance.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Rental Income:</strong> ₪
                        {results.totalRentalIncome.toLocaleString()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Investment Scenario
                      </Typography>
                      <Typography>
                        <strong>Initial Investment:</strong> ₪
                        {formData.initialInvestment.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Monthly Investment Contribution:</strong> ₪
                        {results.monthlyInvestment.toFixed(2).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Final Investment Value:</strong> ₪
                        {results.investmentValue.toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Contributions:</strong> ₪
                        {(
                          formData.initialInvestment +
                          results.monthlyInvestment * results.months
                        ).toLocaleString()}
                      </Typography>
                      <Typography>
                        <strong>Total Investment Growth:</strong> ₪
                        {(
                          results.investmentValue -
                          (formData.initialInvestment +
                            results.monthlyInvestment * results.months)
                        ).toLocaleString()}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6">
                        {results.comparison >= 0 ? (
                          <span style={{ color: "green" }}>
                            Investment preferred by ₪
                            {Math.abs(results.comparison).toLocaleString()} ✅
                          </span>
                        ) : (
                          <span style={{ color: "red" }}>
                            Buying preferred by ₪
                            {Math.abs(results.comparison).toLocaleString()} 🏠
                          </span>
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" gutterBottom>
                    Net Worth Over Time
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <LineChart
                      xAxis={[
                        { data: results.monthlyBreakdown, label: "Months" },
                      ]}
                      series={[
                        {
                          data: results.investNetWorthOverTime,
                          label: "Invest (Net Worth)",
                        },
                        {
                          data: results.buyNetWorthOverTime,
                          label: "Buy (Net Worth)",
                        },
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
                          <TableCell align="right">Buy Net Worth (₪)</TableCell>
                          <TableCell align="right">
                            Invest Net Worth (₪)
                          </TableCell>
                          <TableCell align="right">Difference (₪)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.from({ length: formData.years }, (_, y) => {
                          const month = Math.min((y + 1) * 12, results.months);
                          const buyNW =
                            results.buyNetWorthOverTime[month - 1] || 0;
                          const invNW =
                            results.investNetWorthOverTime[month - 1] || 0;
                          const diff = invNW - buyNW;
                          return (
                            <TableRow key={y}>
                              <TableCell>{y + 1}</TableCell>
                              <TableCell align="right">
                                ₪{buyNW.toLocaleString()}
                              </TableCell>
                              <TableCell align="right">
                                ₪{invNW.toLocaleString()}
                              </TableCell>
                              <TableCell
                                align="right"
                                style={{ color: diff >= 0 ? "green" : "red" }}
                              >
                                ₪{Math.abs(diff).toLocaleString()}{" "}
                                {diff >= 0
                                  ? "Investment Advantage"
                                  : "Buying Advantage"}
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
