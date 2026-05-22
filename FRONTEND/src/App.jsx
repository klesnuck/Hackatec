import { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Kiosko from "./Kiosko";
<<<<<<< HEAD
import Registro from "./registro";
=======
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import RegistroFacial from "./RegistroFacial";
>>>>>>> 1bab3141dafdd044b3903084fe63b7b62f08e78a

function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  return (
    <Routes>
      {/* Ruta inicial A RECON FACIAL */}
      <Route path="/" element={<Navigate to="/kiosko" replace />} />

      {/* Ruta del kiosko facial para registrar asistencia */}
      <Route path="/kiosko" element={<Kiosko />} />
<<<<<<< HEAD
      <Route path="/registro" element={<Registro />} />
=======

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
>>>>>>> 1bab3141dafdd044b3903084fe63b7b62f08e78a
    </Routes>
  );
}

export default App;
