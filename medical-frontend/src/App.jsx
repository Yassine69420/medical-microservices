import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MedicalRecordDetail from "./pages/MedicalRecordDetail";
import Appointments from "./pages/Appointments";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/patients/:patientId/record"
        element={<MedicalRecordDetail />}
      />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
