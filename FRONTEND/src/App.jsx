import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import Kiosko from "./Kiosko";
import Registro from "./registro";
import RegistroFacial from "./RegistroFacial";

function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kiosko" replace />} />
      <Route path="/kiosko" element={<Kiosko />} />
      <Route path="/registro" element={<Registro />} />

      <Route
        path="/admin"
        element={
          adminLoggedIn ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
          )
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          adminLoggedIn ? (
            <Dashboard onLogout={() => setAdminLoggedIn(false)} />
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />

      <Route
        path="/admin/registro-facial"
        element={
          adminLoggedIn ? (
            <RegistroFacial onLogout={() => setAdminLoggedIn(false)} />
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/kiosko" replace />} />
    </Routes>
  );
}

export default App;
