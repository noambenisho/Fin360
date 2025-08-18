// src/pages/Income&Expenses.jsx
import { useEffect, useState } from "react";
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
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "../services/financeService.jsx";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
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

export default function IncomeExpenses() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // ----- Effects -----
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const data = await getTransactions(); // GET /api/transactions (auth required)
        setRecords(data);
      } catch (err) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadTransactions();
  }, [user]);

  // ----- Helpers -----
  const showFeedback = (message, severity = "success") => {
    setFeedback({ open: true, message, severity });
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
    setError("");
  };

  // ----- Handlers -----
  const handleTabChange = (_e, v) => setTabValue(v);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation to match backend expectations
    const amountNum = parseFloat(formData.amount);
    if (!amountNum || amountNum <= 0) {
      showFeedback("Amount must be a positive number", "error");
      return;
    }
    if (!formData.type || !formData.category) {
      showFeedback("Type and category are required", "error");
      return;
    }
    // On update, backend requires description too (see transactionController.updateTransaction)
    if (editingId && !formData.description) {
      showFeedback("Description is required when updating a transaction", "error");
      return;
    }

    const payload = {
      amount: amountNum,
      type: formData.type,
      category: formData.category,
      description: formData.description || undefined,
      date: formData.date, // ISO yyyy-mm-dd is fine (server converts to Date)
    };

    try {
      if (editingId) {
        const updated = await updateTransaction(editingId, payload); // PUT /api/transactions/:id
        setRecords((prev) => prev.map((r) => (r._id === editingId ? updated : r)));
        showFeedback("Transaction updated successfully");
      } else {
        const created = await addTransaction(payload); // POST /api/transactions
        setRecords((prev) => [created, ...prev]);
        showFeedback("Transaction added successfully");
        resetForm(); // מיד אחרי הוספה מוצלחת
        setTabValue(0); // מעבר לטאב הראשון
      }
    } catch (err) {
      const msg = err.message || "Failed to save transaction";
      setError(msg);
      showFeedback(msg, "error");
    }
  };

  const handleEdit = (id) => {
    const recordToEdit = records.find((r) => r._id === id);
    if (!recordToEdit) return;

    setFormData({
      amount: recordToEdit.amount.toString(),
      category: recordToEdit.category || "",
      date: recordToEdit.date ? recordToEdit.date.slice(0, 10) : new Date().toISOString().split("T")[0],
      description: recordToEdit.description || "",
      type: recordToEdit.type || "expense",
    });
    setEditingId(id);
    setTabValue(2);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id); // DELETE /api/transactions/:id
      setRecords((prev) => prev.filter((r) => r._id !== id));
      if (editingId === id) resetForm();
      showFeedback("Transaction deleted successfully");
    } catch (err) {
      const msg = err.message || "Failed to delete transaction";
      setError(msg);
      showFeedback(msg, "error");
    }
  };

  // ----- Derived data -----
  const filteredRecords = records.filter((r) => {
    const matchCategory = !filter.category || r.category === filter.category;
    const matchMonth = !filter.month || (r.date || "").startsWith(filter.month);
    return matchCategory && matchMonth;
  });

  const expensesByCategory = categories
    .map((category) => {
      const total = filteredRecords
        .filter((r) => r.category === category && r.type === "expense")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
      return { category, total };
    })
    .filter((x) => x.total > 0);

  const monthlyData = Array.from({ length: 12 }, (_, m) => {
    const monthStr = String(m + 1).padStart(2, "0");
    const year = new Date().getFullYear();
    const monthKey = `${year}-${monthStr}`;

    const income = filteredRecords
      .filter((r) => (r.date || "").startsWith(monthKey) && r.type === "income")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const expenses = filteredRecords
      .filter((r) => (r.date || "").startsWith(monthKey) && r.type === "expense")
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return { month: monthKey, income, expenses, net: income - expenses };
  });

  // ----- Guards -----
  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Typography variant="h6">Please log in to access this page.</Typography>
      </Box>
    );
  }

  // ----- UI -----
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
        autoHideDuration={4000}
        onClose={() => setFeedback((p) => ({ ...p, open: false }))}
      >
        <Alert severity={feedback.severity} onClose={() => setFeedback((p) => ({ ...p, open: false }))}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} onClick={() => resetForm()}>
          <Tab label="Transactions" />
          <Tab label="Charts" />
          <Tab label="Add / Edit" />
        </Tabs>
      </Box>

      {/* Transactions */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select name="category" value={filter.category} onChange={handleFilterChange} label="Category">
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
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
                    <Button fullWidth variant="outlined" onClick={() => setFilter({ category: "", month: "" })}>
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
                      {filteredRecords.map((r) => (
                        <TableRow key={r._id}>
                          <TableCell>{(r.date || "").slice(0, 10)}</TableCell>
                          <TableCell>{r.description || "-"}</TableCell>
                          <TableCell>
                            <Chip label={r.category} size="small" />
                          </TableCell>
                          <TableCell align="right" style={{ color: r.type === "income" ? "green" : "red" }}>
                            ₪{Number(r.amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip label={r.type} size="small" color={r.type === "income" ? "success" : "error"} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(r._id)}>
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(r._id)}
                              color="error"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredRecords.length && !loading && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No transactions yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Charts */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Breakdown by Category
                </Typography>
                {expensesByCategory.length ? (
                  <Box sx={{ height: 400 }}>
                    <PieChart
                      series={[
                        {
                          data: expensesByCategory.map((x) => ({ value: x.total, label: x.category })),
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
                    xAxis={[{ data: monthlyData.map((m) => m.month), scaleType: "band" }]}
                    series={[
                      { data: monthlyData.map((m) => m.income), label: "Income" },
                      { data: monthlyData.map((m) => m.expenses), label: "Expenses" },
                      { data: monthlyData.map((m) => m.net), label: "Net" },
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add / Edit */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editingId ? "Edit Transaction" : "Add New Transaction"}
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select name="type" value={formData.type} onChange={handleInputChange} label="Type" required>
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
                          {categories.map((c) => (
                            <MenuItem key={c} value={c}>
                              {c}
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
                        placeholder="(Optional for create, required for update)"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button fullWidth type="submit" variant="contained" startIcon={<AddIcon />}>
                        {editingId ? "Update Transaction" : "Add Transaction"}
                      </Button>
                      {editingId && (
                        <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={resetForm}>
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
