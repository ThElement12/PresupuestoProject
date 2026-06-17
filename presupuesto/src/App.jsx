import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NuevoMes from './pages/NuevoMes';
import MesDetail from './pages/MesDetail';
import Metodos from './pages/Metodos';
import NuevoMetodo from './pages/NuevoMetodo';
import AdminPanel from './pages/AdminPanel';
import Ayuda from './pages/Ayuda';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
          />
          <Route
            path="/mes/nuevo"
            element={<ProtectedRoute><Layout><NuevoMes /></Layout></ProtectedRoute>}
          />
          <Route
            path="/mes/:id"
            element={<ProtectedRoute><Layout><MesDetail /></Layout></ProtectedRoute>}
          />
          <Route
            path="/metodos"
            element={<ProtectedRoute><Layout><Metodos /></Layout></ProtectedRoute>}
          />
          <Route
            path="/metodo/nuevo"
            element={<ProtectedRoute><Layout><NuevoMetodo /></Layout></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminRoute><Layout><AdminPanel /></Layout></AdminRoute></ProtectedRoute>}
          />
          <Route
            path="/ayuda"
            element={<ProtectedRoute><Layout><Ayuda /></Layout></ProtectedRoute>}
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
