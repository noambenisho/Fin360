import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tax from "./pages/Tax";
import Mortgage from "./pages/Mortgage";
import IncomeExpenses from "./pages/Income&Expenses";
import Profile from "./pages/Profile";
import FinancialNews from "./components/FinancialNews";
import CrudTester from "./pages/CrudTester";
import PrivateRoute from "./routes/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/tax" element={<Tax />} />
      <Route path="/mortgage" element={<Mortgage />} />
      <Route
        path="/income-expenses"
        element={
          <PrivateRoute>
            <IncomeExpenses />
          </PrivateRoute>
        }
      />
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        } 
      />
      <Route path="/news" element={<FinancialNews />} />
      <Route path="/crud-test" element={<CrudTester />} />
    </Routes>
  );
}
