import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import VerifierDashboard from './components/VerifierDashboard';
import AdminDashboard from './components/AdminDashboard';
// import UserDashboard from './components/UserDashboardLoans';
import ApplicationDetail from './components/ApplicationDetail';
import AddUser from './components/AddUser';
import ApplicationsList from './components/ApplicationsList';
import Unauthorized from './components/Unauthorized';
import LoanApplicationForm from './components/LoanApplicationForm';
import UserDashboardLoans from './components/UserDashboardLoans';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/apply" element={<LoanApplicationForm />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* User routes */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'verifier', 'admin']} />}>
          <Route path="/user/dashboard/:email" element={<UserDashboardLoans />} />
        </Route>
        
        {/* Verifier routes */}
        <Route element={<ProtectedRoute allowedRoles={['verifier', 'admin']} />}>
          <Route path="/verifier/dashboard" element={<VerifierDashboard />} />
          <Route path="/applications" element={<ApplicationsList />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
        </Route>
        
        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users/new" element={<AddUser />} />
        </Route>
        
        {/* Redirect to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
