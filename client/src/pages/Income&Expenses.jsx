import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { PieChart, LineChart } from "@mui/x-charts";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

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

const categories = [
  "Housing",
  "Food",
  "Transportation",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Savings",
  "Other",
];

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
} from "../services/financeService";

export default function IncomeExpenses() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "expense",
  });
  const [filter, setFilter] = useState({
    category: "",
    month: "",
  });
  const [editingId, setEditingId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value,
    });
  };

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions();
        setRecords(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTransactions();
    }
  }, [user]);

  const showFeedback = (message, severity = "success") => {
    setFeedback({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newRecord = {
        ...formData,
        amount: parseFloat(formData.amount),
        userId: user.id,
      };

      const savedRecord = await addTransaction(newRecord);
      setRecords((prev) => [...prev, savedRecord]);
      resetForm();
      setTabValue(0); // Switch back to Transactions tab
      showFeedback("Transaction added successfully");
    } catch (err) {
      setError(err.message);
      showFeedback(err.message || "Failed to save transaction", "error");
      console.error("Failed to save transaction:", err);
    }
  };

  const handleEdit = (id) => {
    const recordToEdit = records.find((record) => record.id === id);
    if (recordToEdit) {
      setFormData({
        amount: recordToEdit.amount.toString(),
        category: recordToEdit.category,
        date: recordToEdit.date,
        description: recordToEdit.description,
        type: recordToEdit.type || "expense",
      });
      setEditingId(id);
      setTabValue(2); // Switch to the Add/Edit tab
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setRecords(records.filter((record) => record._id !== id));
      if (editingId === id) resetForm();
      showFeedback("Transaction deleted successfully");
    } catch (err) {
      setError(err.message);
      showFeedback(err.message || "Failed to delete transaction", "error");
      console.error("Failed to delete transaction:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "expense",
    });
    setEditingId(null);
  };

  const filteredRecords = records.filter((record) => {
    const matchesCategory =
      !filter.category || record.category === filter.category;
    const matchesMonth = !filter.month || record.date.startsWith(filter.month);
    return matchesCategory && matchesMonth;
  });

  const expensesByCategory = categories
    .map((category) => {
      const total = filteredRecords
        .filter((r) => r.category === category && r.type === "expense")
        .reduce((sum, r) => sum + parseFloat(r.amount), 0);
      return { category, total };
    })
    .filter((item) => item.total > 0);

  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const monthStr = (month + 1).toString().padStart(2, "0");
    const year = new Date().getFullYear();
    const monthKey = `${year}-${monthStr}`;

    const income = filteredRecords
      .filter((r) => r.date.startsWith(monthKey) && r.type === "income")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const expenses = filteredRecords
      .filter((r) => r.date.startsWith(monthKey) && r.type === "expense")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    return { month: monthKey, income, expenses, net: income - expenses };
  });

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5">Please log in to access this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Income & Expenses Tracker
      </Typography>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
          severity={feedback.severity}
          sx={{ width: "100%" }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Transactions" />
          <Tab label="Charts" />
          <Tab label="Add Record" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={filter.category}
                        onChange={handleFilterChange}
                        label="Category"
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Month"
                      type="month"
                      name="month"
                      value={filter.month}
                      onChange={handleFilterChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setFilter({ category: "", month: "" })}
                    >
                      Clear Filters
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>{record.description || "-"}</TableCell>
                          <TableCell>
                            <Chip label={record.category} size="small" />
                          </TableCell>
                          <TableCell
                            align="right"
                            style={{
                              color: record.type === "income" ? "green" : "red",
                            }}
                          >
                            ${parseFloat(record.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.type}
                              size="small"
                              color={
                                record.type === "income" ? "success" : "error"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(record.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(record.id)}
                              color="error"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Breakdown by Category
                </Typography>
                {expensesByCategory.length > 0 ? (
                  <Box sx={{ height: 400 }}>
                    <PieChart
                      series={[
                        {
                          data: expensesByCategory.map((item) => ({
                            value: item.total,
                            label: item.category,
                          })),
                          innerRadius: 30,
                          outerRadius: 100,
                          paddingAngle: 5,
                          cornerRadius: 5,
                        },
                      ]}
                    />
                  </Box>
                ) : (
                  <Typography>No expense data available</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Cash Flow
                </Typography>
                <Box sx={{ height: 400 }}>
                  <LineChart
                    xAxis={[
                      {
                        data: monthlyData.map((item) => item.month),
                        scaleType: "band",
                      },
                    ]}
                    series={[
                      {
                        data: monthlyData.map((item) => item.income),
                        label: "Income",
                      },
                      {
                        data: monthlyData.map((item) => item.expenses),
                        label: "Expenses",
                      },
                      {
                        data: monthlyData.map((item) => item.net),
                        label: "Net",
                      },
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingId ? "Edit Record" : "Add New Record"}
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          label="Type"
                          required
                        >
                          <MenuItem value="income">Income</MenuItem>
                          <MenuItem value="expense">Expense</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          label="Category"
                          required
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                      >
                        {editingId ? "Update Record" : "Add Record"}
                      </Button>
                      {editingId && (
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{ mt: 2 }}
                          onClick={resetForm}
                        >
                          Cancel
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
}
