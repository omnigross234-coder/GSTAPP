

import { Routes, Route } from "react-router-dom";
import AdminPage      from "./pages/AdminPage";
import LoginPage      from "./features/auth/presentation/LoginPage";
import ForgotPassword from "./features/auth/presentation/ForgotPassword";
import Home           from "./pages/Home";
import Invoice        from "./pages/invoice";
import CustomerPage   from "./pages/CustomerPage"; 
import ExpensePage from "./pages/ExpensePage";           
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import ServicePage from "./pages/ServicePage";

function App() {
  return (
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/invoice" element={
        <ProtectedRoute><Invoice /></ProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute><AdminPage /></AdminRoute>
      } />

      <Route path="/customers" element={        
        <AdminRoute><CustomerPage /></AdminRoute>
      } />

      <Route path="/expenses" element={
        <AdminRoute><ExpensePage /></AdminRoute>
      } />

      <Route path="/services" element={
        <AdminRoute><ServicePage /></AdminRoute>
      } />
    </Routes>

    
  );
}

export default App;