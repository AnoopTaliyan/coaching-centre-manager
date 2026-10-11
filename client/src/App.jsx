import { Navigate, Route, Routes } from "react-router-dom";
import { auth } from "./api.js";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import Fees from "./pages/Fees.jsx";
import Attendance from "./pages/Attendance.jsx";

function Private({ children }) {
  return auth.token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Private><Layout /></Private>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/attendance" element={<Attendance />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
