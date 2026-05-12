
const BASE_URL = "http://localhost:5000/api";

// Save new invoice
export const saveInvoiceAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/invoices`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

// Get all invoices
// Get invoices (filtered by user role)
export const fetchInvoicesAPI = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const res  = await fetch(
    `${BASE_URL}/invoices?user_id=${user?.id}&role=${user?.role}`
  );
  return res.json();
};

// Get single invoice
export const fetchInvoiceByIdAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/invoices/${id}`);
  return res.json();
};

// Delete invoice
export const deleteInvoiceAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/invoices/${id}`, {
    method: "DELETE"
  });
  return res.json();
};

// Update status
export const updateInvoiceStatusAPI = async (id, status) => {
  const res = await fetch(`${BASE_URL}/invoices/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
};

// Open PDF preview in new tab
export const previewInvoicePDF = (id) => {
  window.open(`http://localhost:5000/api/pdf/${id}`, "_blank");
};

// Download PDF
export const downloadInvoicePDF = async (id, invoiceNumber) => {
  const res = await fetch(`http://localhost:5000/api/pdf/${id}`);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoiceNumber || "invoice"}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Get all invoices for admin (with optional user filter)
export const fetchAdminInvoicesAPI = async (user_id = null) => {
  const url = user_id
    ? `${BASE_URL}/invoices/admin?user_id=${user_id}`
    : `${BASE_URL}/invoices/admin`;
  const res = await fetch(url);
  return res.json();
};

// Edit invoice (admin only)
export const editInvoiceAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/invoices/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

// Get customer suggestions from customers table
export const fetchCustomerSuggestions = async (query) => {
  if (!query || query.trim().length < 1) return [];
  const res = await fetch(`${BASE_URL}/customers/suggestions?q=${encodeURIComponent(query)}`);
  return res.json();
};

// Get active services from DB
export const fetchServicesAPI = async () => {
  const res = await fetch(`${BASE_URL}/services`);
  return res.json();
};

// Send invoice email
export const sendInvoiceEmailAPI = async (invoiceId, email) => {
  const res = await fetch(`${BASE_URL}/email/send-invoice/${invoiceId}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email })
  });
  return res.json();
};

// Send payment reminder
export const sendPaymentReminderAPI = async (invoiceId, email) => {
  const res = await fetch(`${BASE_URL}/email/send-reminder/${invoiceId}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email })
  });
  return res.json();
};

// Get email logs
export const fetchEmailLogsAPI = async (invoiceId) => {
  const res = await fetch(`${BASE_URL}/email/logs/${invoiceId}`);
  return res.json();
};