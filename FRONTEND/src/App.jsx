import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Kiosko from "./Kiosko";
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import RegistroFacial from "./RegistroFacial";

function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  return (
    <Routes>
      {/* Ruta inicial A RECON FACIAL */}
      <Route path="/" element={<Navigate to="/kiosko" replace />} />

      {/* Ruta del kiosko facial para registrar asistencia */}
      <Route path="/kiosko" element={<Kiosko />} />

      {/* Ruta de login  */}
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

      {/* Ruta  dashboard administrativo */}
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

      {/* Ruta  vincular datos faciales a usuarios existentes */}
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

      {/* Ruta respaldo*/}
      <Route path="*" element={<Navigate to="/kiosko" replace />} />
    </Routes>
  );
}

export default App;
