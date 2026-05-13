const BASE_URL = "https://backend-msas.onrender.com/api";

// Dashboard
export const fetchExpenseDashboard = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res    = await fetch(`${BASE_URL}/expenses/dashboard?${params}`);
  return res.json();
};

// Get all expenses
export const fetchExpensesAPI = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res    = await fetch(`${BASE_URL}/expenses?${params}`);
  return res.json();
};

// Get single expense
export const fetchExpenseByIdAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/expenses/${id}`);
  return res.json();
};

// Add expense
export const addExpenseAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/expenses`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

// Update expense
export const updateExpenseAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/expenses/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

// Delete expense
export const deleteExpenseAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/expenses/${id}`, {
    method: "DELETE"
  });
  return res.json();
};

// Update payment status
export const updateExpenseStatusAPI = async (id, payment_status) => {
  const res = await fetch(`${BASE_URL}/expenses/${id}/status`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ payment_status })
  });
  return res.json();
};

// Get categories
// export const fetchCategoriesAPI = async () => {
//   const res = await fetch(`${BASE_URL}/expense-categories`);
//   return res.json();
// };

// Get vendors
export const fetchVendorsAPI = async () => {
  const res = await fetch(`${BASE_URL}/vendors`);
  return res.json();
};

// ── Categories ──────────────────────────────────────────
export const fetchCategoriesAPI = async (all = false) => {
  const res = await fetch(`${BASE_URL}/expense-categories${all ? "?all=true" : ""}`);
  return res.json();
};

export const addCategoryAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/expense-categories`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateCategoryAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/expense-categories/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteCategoryAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/expense-categories/${id}`, {
    method: "DELETE"
  });
  return res.json();
};

// ── Vendors ─────────────────────────────────────────────
export const addVendorAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/vendors`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateVendorAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/vendors/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteVendorAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/vendors/${id}`, {
    method: "DELETE"
  });
  return res.json();
};

// ── Reports ─────────────────────────────────────────────
export const fetchCategoryReportAPI = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res    = await fetch(`${BASE_URL}/reports/category-wise?${params}`);
  return res.json();
};

export const fetchVendorReportAPI = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res    = await fetch(`${BASE_URL}/reports/vendor-wise?${params}`);
  return res.json();
};

export const fetchDateRangeReportAPI = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const res    = await fetch(`${BASE_URL}/reports/date-range?${params}`);
  return res.json();
};