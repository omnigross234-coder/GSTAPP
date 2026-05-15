import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import "./ExpensePage.css";
import {
  FiLogOut,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiDollarSign,
  FiUser,
  FiBarChart2,
  FiCalendar,
  FiClipboard,
  FiHome,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiTag,
  FiBriefcase,
  FiCreditCard,
  FiSave,
  FiCrosshair,
  FiX,
  FiPieChart,
  FiPhone,
  FiVoicemail,
  FiMail,
  FiFolder,
  FiPrinter,
  FiDownload,
  FiSearch
 
} from "react-icons/fi";
import {
  fetchExpenseDashboard,
  fetchExpensesAPI,
  addExpenseAPI,
  updateExpenseAPI,
  deleteExpenseAPI,
  updateExpenseStatusAPI,
  fetchCategoriesAPI,
  fetchVendorsAPI,
  addCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  addVendorAPI,
  updateVendorAPI,
  deleteVendorAPI,
  fetchCategoryReportAPI,
  fetchVendorReportAPI,
  fetchDateRangeReportAPI
} from "../data/expenseService";

const EMPTY_FORM = {
  expense_date:   "",
  vendor_id:      "",
  category_id:    "",
  client_name:    "",
  project_name:   "",
  unit_amount:    "",
  units:          "1",
  amount:         "",
  gst_percent:    "18",
  gst_amount:     "",
  total_amount:   "",
  gst_type:       "cgst_sgst",
  payment_mode:   "bank_transfer",
  payment_status: "unpaid",
  due_date:       "",
  notes:          ""
};

const TODAY = new Date().toISOString().split("T")[0];

function ExpensePage() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [activeTab,   setActiveTab]   = useState("dashboard");
  const [dashboard,   setDashboard]   = useState(null);
  const [expenses,    setExpenses]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [vendors,     setVendors]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  // Form
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });

  // Filters
  const [filterMonth, setFilterMonth] = useState("");
  const [filterFrom,  setFilterFrom]  = useState("");
  const [filterTo,    setFilterTo]    = useState("");
  const [expenseFilterCategory, setExpenseFilterCategory] = useState("");
  const [expenseFilterVendor,   setExpenseFilterVendor]   = useState("");
  const [expenseFilterMonth,    setExpenseFilterMonth]    = useState("");
  const [expenseFilterFrom,     setExpenseFilterFrom]     = useState("");
  const [expenseFilterTo,       setExpenseFilterTo]       = useState("");
  const [expenseFilterNumber,   setExpenseFilterNumber]   = useState("");

  // Categories
const [catForm,      setCatForm]      = useState({ name: "", description: "", default_price: "" });
const [editingCatId, setEditingCatId] = useState(null);
const [showCatForm,  setShowCatForm]  = useState(false);

// Vendors
const EMPTY_VENDOR = {
  name: "", gst_number: "", contact_person: "",
  mobile: "", email: "", address: "", payment_terms: ""
};
const [vendorForm,      setVendorForm]      = useState({ ...EMPTY_VENDOR });
const [editingVendorId, setEditingVendorId] = useState(null);
const [showVendorForm,  setShowVendorForm]  = useState(false);

// Reports
const [reportType,    setReportType]    = useState("category");
const [reportData,    setReportData]    = useState([]);
const [reportLoading, setReportLoading] = useState(false);
const [reportFrom,    setReportFrom]    = useState("");
const [reportTo,      setReportTo]      = useState("");
const [reportMonth,   setReportMonth]   = useState("");
const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    loadCategories(true);
    loadVendors();
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") loadDashboard();
    if (activeTab === "expenses")  loadExpenses();
  }, [activeTab]);

  const loadDashboard = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await fetchExpenseDashboard(filters);
      setDashboard(data);
    } catch (err) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await fetchExpensesAPI(filters);
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  
 const loadCategories = async (all = false) => {
  try {
    const data = await fetchCategoriesAPI(all);
    console.log("Categories loaded:", data); // ← ADD THIS
    setCategories(Array.isArray(data) ? data : []);
  } catch (err) { console.error(err); }
};

  const loadVendors = async () => {
    try {
      const data = await fetchVendorsAPI();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  // ── Auto calculate GST ──────────────────────────────
  const handleExpenseCalcChange = (updates = {}) => {
    const next       = { ...form, ...updates };
    const unitAmount = parseFloat(next.unit_amount) || 0;
    const units      = parseFloat(next.units) || 0;
    const gstPct     = parseFloat(next.gst_percent) || 0;
    const subtotal   = unitAmount * units;
    const gstAmt     = (subtotal * gstPct) / 100;
    const total      = subtotal + gstAmt;

    setForm(prev => ({
      ...prev,
      ...updates,
      amount:       subtotal.toFixed(2),
      gst_amount:   gstAmt.toFixed(2),
      total_amount: total.toFixed(2)
    }));
  };

  // ── Save expense ────────────────────────────────────
  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.expense_date) { setError("Expense date is required"); return; }
    if (!form.unit_amount || Number(form.unit_amount) < 1) { setError("Amount per unit must be at least ₹1"); return; }
    if (!form.units || Number(form.units) <= 0 || !Number.isInteger(Number(form.units))) {
      setError("Units must be a whole number greater than 0");
      return;
    }

    try {
      const res = editingId
        ? await updateExpenseAPI(editingId, form)
        : await addExpenseAPI({ ...form, created_by: currentUser?.id });

      if (res.error) { setError(res.error); return; }

      setSuccess(editingId ? "Expense updated!" : `Expense ${res.expense_number} added!`);
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      setEditingId(null);
      await loadExpenses(buildExpenseFilters());
      await loadDashboard();
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  const handleEdit = (exp) => {
    setEditingId(exp.id);
    setForm({
      expense_date:   exp.expense_date?.split("T")[0] || "",
      vendor_id:      exp.vendor_id      || "",
      category_id:    exp.category_id    || "",
      client_name:    exp.client_name    || "",
      project_name:   exp.project_name   || "",
      unit_amount:    exp.unit_amount    || exp.amount || "",
      units:          exp.units          || "1",
      amount:         exp.amount         || "",
      gst_percent:    exp.gst_percent    || "18",
      gst_amount:     exp.gst_amount     || "",
      total_amount:   exp.total_amount   || "",
      gst_type:       exp.gst_type       || "cgst_sgst",
      payment_mode:   exp.payment_mode   || "bank_transfer",
      payment_status: exp.payment_status || "unpaid",
      due_date:       exp.due_date?.split("T")[0] || "",
      notes:          exp.notes          || ""
    });
    setShowForm(true);
    setActiveTab("expenses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpenseAPI(id);
      setSuccess("Expense deleted!");
      await loadExpenses(buildExpenseFilters());
      await loadDashboard();
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleExpenseCategoryChange = (categoryId) => {
    const selectedCategory = categories.find(c => String(c.id) === String(categoryId));
    const defaultPrice = selectedCategory?.default_price;

    if (defaultPrice !== undefined && defaultPrice !== null && defaultPrice !== "") {
      handleExpenseCalcChange({
        category_id: categoryId,
        unit_amount: Number(defaultPrice).toFixed(2)
      });
      return;
    }

    setForm({ ...form, category_id: categoryId });
  };

  const buildExpenseFilters = () => {
    const filters = {};

    if (expenseFilterCategory) filters.category_id = expenseFilterCategory;
    if (expenseFilterVendor) filters.vendor_id = expenseFilterVendor;
    if (expenseFilterNumber.trim()) filters.expense_number = expenseFilterNumber.trim();

    if (expenseFilterMonth) {
      const [year, month] = expenseFilterMonth.split("-");
      filters.month = month;
      filters.year = year;
    } else if (expenseFilterFrom && expenseFilterTo) {
      filters.from = expenseFilterFrom;
      filters.to = expenseFilterTo;
    }

    return filters;
  };

  const handleExpenseFilterApply = () => {
    loadExpenses(buildExpenseFilters());
  };

  const handleExpenseFilterReset = () => {
    setExpenseFilterCategory("");
    setExpenseFilterVendor("");
    setExpenseFilterMonth("");
    setExpenseFilterFrom("");
    setExpenseFilterTo("");
    setExpenseFilterNumber("");
    loadExpenses();
  };

  const hasExpenseFilters = Boolean(
    expenseFilterCategory ||
    expenseFilterVendor ||
    expenseFilterMonth ||
    expenseFilterFrom ||
    expenseFilterTo ||
    expenseFilterNumber.trim()
  );

  const handleFilterApply = () => {
    const filters = {};
    if (filterMonth) {
      const [year, month] = filterMonth.split("-");
      filters.month = month;
      filters.year  = year;
    } else if (filterFrom && filterTo) {
      filters.from = filterFrom;
      filters.to   = filterTo;
    }
    loadDashboard(filters);
  };

  const handleFilterReset = () => {
    setFilterMonth(""); setFilterFrom(""); setFilterTo("");
    loadDashboard();
  };

  // ── Category handlers ───────────────────────────────────
const handleCatSubmit = async () => {
  setError(""); setSuccess("");
  if (!catForm.name.trim()) { setError("Category name required"); return; }
  try {
    const res = editingCatId
      ? await updateCategoryAPI(editingCatId, catForm)
      : await addCategoryAPI(catForm);
    if (res.error) { setError(res.error); return; }
    setSuccess(editingCatId ? "Category updated!" : "Category added!");
    setCatForm({ name: "", description: "", default_price: "" });
    setShowCatForm(false);
    setEditingCatId(null);
    await loadCategories(true);
  } catch (err) { setError("Server error."); }
};

const handleCatEdit = (cat) => {
  setEditingCatId(cat.id);
  setCatForm({
    name: cat.name,
    description: cat.description || "",
    default_price: cat.default_price ?? ""
  });
  setShowCatForm(true);
};

const handleCatDelete = async (id, name) => {
  if (!window.confirm(`Delete category "${name}"?`)) return;
  try {
    const res = await deleteCategoryAPI(id);
    if (res.error) { setError(res.error); return; }
    setSuccess("Category deleted!");
    await loadCategories(true);
  } catch (err) { setError("Delete failed."); }
};



const handleCatToggle = async (cat) => {
  try {
    const newStatus = cat.is_active ? 0 : 1;
    const res = await updateCategoryAPI(cat.id, {
      name:        cat.name,
      description: cat.description || "",
      default_price: cat.default_price ?? 0,
      is_active:   newStatus
    });
    if (res.error) { setError(res.error); return; }
    setSuccess(`Category "${cat.name}" ${newStatus ? "activated" : "deactivated"}!`);
    await loadCategories(true);
  } catch (err) {
    setError("Update failed.");
  }
};

// ── Vendor handlers ─────────────────────────────────────
const handleVendorSubmit = async () => {
  setError(""); setSuccess("");
  if (!vendorForm.name.trim()) { setError("Vendor name required"); return; }
  try {
    const res = editingVendorId
      ? await updateVendorAPI(editingVendorId, vendorForm)
      : await addVendorAPI(vendorForm);
    if (res.error) { setError(res.error); return; }
    setSuccess(editingVendorId ? "Vendor updated!" : "Vendor added!");
    setVendorForm({ ...EMPTY_VENDOR });
    setShowVendorForm(false);
    setEditingVendorId(null);
    await loadVendors();
  } catch (err) { setError("Server error."); }
};

const handleVendorEdit = (v) => {
  setEditingVendorId(v.id);
  setVendorForm({
    name:          v.name          || "",
    gst_number:    v.gst_number    || "",
    contact_person: v.contact_person || "",
    mobile:        v.mobile        || "",
    email:         v.email         || "",
    address:       v.address       || "",
    payment_terms: v.payment_terms || ""
  });
  setShowVendorForm(true);
};

const handleVendorDelete = async (id, name) => {
  if (!window.confirm(`Delete vendor "${name}"?`)) return;
  try {
    const res = await deleteVendorAPI(id);
    if (res.error) { setError(res.error); return; }
    setSuccess("Vendor deleted!");
    await loadVendors();
  } catch (err) { setError("Delete failed."); }
};

  // ── Category handlers ───────────────────────────────────end 

  // ── Generate Report ─────────────────────────────────────
const handleGenerateReport = async () => {
  setError(""); setReportGenerated(false);
  setReportLoading(true);

  const filters = {};
  if (reportMonth) {
    const [year, month] = reportMonth.split("-");
    filters.month = month;
    filters.year  = year;
  } else if (reportFrom && reportTo) {
    filters.from = reportFrom;
    filters.to   = reportTo;
  }

  try {
    let data = [];
    if (reportType === "category")   data = await fetchCategoryReportAPI(filters);
    if (reportType === "vendor")     data = await fetchVendorReportAPI(filters);
    if (reportType === "date_range") data = await fetchDateRangeReportAPI(filters);

    setReportData(Array.isArray(data) ? data : []);
    setReportGenerated(true);
  } catch (err) {
    setError("Failed to generate report");
  } finally {
    setReportLoading(false);
  }
};

// ── Export to CSV ───────────────────────────────────────
const exportToCSV = () => {
  if (reportData.length === 0) return;

  const headers = Object.keys(reportData[0]);
  const rows    = reportData.map(row =>
    headers.map(h => `"${row[h] ?? ""}"`).join(",")
  );
  const csv     = [headers.join(","), ...rows].join("\n");
  const blob    = new Blob([csv], { type: "text/csv" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Report__________end

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const statusColor = (s) => ({
    paid: "success", unpaid: "danger", partial: "warning"
  }[s] || "secondary");

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar px-3 px-md-4" style={{ background: "rgba(10,26,31,0.85)" }}>
        <span className="navbar-brand fw-bold text-white mb-0"
          style={{ fontSize: "clamp(13px, 4vw, 17px)" }}>
        <FiDollarSign />  Expense Manager
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="text-white d-none d-sm-inline" style={{ fontSize: "13px" }}>
            <FiUser /> {currentUser?.username}
          </span>
          <button className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/admin")}>
            ← Admin
          </button>
          <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={handleLogout}>
            <FiLogOut size={14} /> <span className="d-none d-sm-inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 mt-3">

        <ul className="nav nav-tabs mb-4 flex-nowrap overflow-auto">
  <li className="nav-item">
    <button
      className={`nav-link text-nowrap ${activeTab === "dashboard" ? "active" : ""}`}
      onClick={() => setActiveTab("dashboard")}
    >
      <FiBarChart2 />Dashboard
    </button>
  </li>
  <li className="nav-item">
    <button
      className={`nav-link text-nowrap ${activeTab === "expenses" ? "active" : ""}`}
      onClick={() => setActiveTab("expenses")}
    >
      <FiDollarSign /> Expenses
    </button>
  </li>
  <li className="nav-item">
    <button
      className={`nav-link text-nowrap ${activeTab === "categories" ? "active" : ""}`}
      onClick={() => setActiveTab("categories")}
    >
     <FiTag />Categories
    </button>
  </li>
  <li className="nav-item">
    <button
      className={`nav-link text-nowrap ${activeTab === "vendors" ? "active" : ""}`}
      onClick={() => setActiveTab("vendors")}
    >
      <FiBriefcase /> Vendors
    </button>
  
  </li>
    <li className="nav-item">
  <button
    className={`nav-link text-nowrap ${activeTab === "reports" ? "active" : ""}`}
    onClick={() => setActiveTab("reports")}
  >
    <FiBarChart2 /> Reports
  </button>
</li>
</ul>

        {/* ── Alerts ── */}
        {error && (
          <div className="alert alert-danger alert-dismissible">
            {error}
            <button className="btn-close" onClick={() => setError("")} />
          </div>
        )}
        {success && (
          <div className="alert alert-success alert-dismissible">
            {success}
            <button className="btn-close" onClick={() => setSuccess("")} />
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* DASHBOARD TAB                                */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div>

            {/* ── Filters ── */}
            <div className="card mb-4 p-3" style={{ background: "#f8f9fa" }}>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold small"><FiCalendar /> Filter by Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={filterMonth}
                    onChange={(e) => { setFilterMonth(e.target.value); setFilterFrom(""); setFilterTo(""); }}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold small">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterFrom}
                    onChange={(e) => { setFilterFrom(e.target.value); setFilterMonth(""); }}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold small">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filterTo}
                    onChange={(e) => { setFilterTo(e.target.value); setFilterMonth(""); }}
                  />
                </div>
                <div className="col-12 col-md-3 d-flex gap-2">
                  <button className="btn btn-primary flex-fill" onClick={handleFilterApply}>
                    Apply
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleFilterReset}>
                    <FiRefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-muted">Loading dashboard...</p>
            ) : dashboard ? (
              <>
                {/* ── Stats Cards ── */}
                <div className="row g-3 mb-4">
                  {[
                    { label: "Total Expenses",   value: dashboard.stats.total_expenses,  color: "#1a237e", icon: <FiClipboard />, isCurrency: false },
                    { label: "Total Amount",      value: dashboard.stats.total_amount,    color: "#4a148c", icon: <FiDollarSign />, isCurrency: true  },
                    { label: "Total GST Paid",    value: dashboard.stats.total_gst,       color: "#1565c0",icon: <FiHome />,  isCurrency: true  },
                    { label: "Paid",              value: dashboard.stats.paid_amount,     color: "#2e7d32", icon: <FiCheckCircle />, isCurrency: true  },
                    { label: "Unpaid",            value: dashboard.stats.unpaid_amount,   color: "#c62828", icon: <FiXCircle />, isCurrency: true  },
                    { label: "Partial",           value: dashboard.stats.partial_amount,  color: "#f57f17", icon: <FiClock />, isCurrency: true  },
                  ].map((s, i) => (
                    <div key={i} className="col-6 col-md-4 col-lg-2">
                      <div className="card text-center p-3 h-100"
                        style={{ background: s.color, color: "white", borderRadius: "12px" }}>
                        <div style={{ fontSize: "20px" }}>{s.icon}</div>
                        <div style={{ fontSize: s.isCurrency ? "14px" : "24px", fontWeight: "700", marginTop: "4px" }}>
                          {s.isCurrency ? fmt(s.value) : s.value}
                        </div>
                        <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "2px" }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Monthly Trend ── */}
                {dashboard.trend.length > 0 && (
  <div className="expense-trend-card">
    
    <div className="trend-header">
      <h6>
        <FiTrendingUp />
        Monthly Expense Trend
      </h6>

      <span className="trend-badge">
        Last 6 Months
      </span>
    </div>

    <div className="trend-chart-wrapper">
      <div className="trend-chart">

        {dashboard.trend.map((t, i) => {
          const maxVal = Math.max(
            ...dashboard.trend.map(x => Number(x.total))
          );

          const height =
            maxVal > 0
              ? (Number(t.total) / maxVal) * 190
              : 0;

          return (
            <div key={i} className="trend-item">

              <div className="trend-value">
                {fmt(t.total)}
              </div>

              <div
                className="trend-bar"
                style={{
                  height: `${height}px`
                }}
              />

              <div className="trend-month">
                {t.month_label}
              </div>

            </div>
          );
        })}

      </div>
    </div>

  </div>
)}

                <div className="row g-4 mb-4">

                  {/* ── Category Breakdown ── */}
                  {dashboard.categories.length > 0 && (
                    <div className="col-12 col-md-6">
                      <div className="card p-3 h-100">
                        <h6 className="fw-bold mb-3"> <FiTag /> Category Breakdown</h6>
                        {dashboard.categories.map((c, i) => {
                          const maxVal = Math.max(...dashboard.categories.map(x => Number(x.total)));
                          const pct    = maxVal > 0 ? (Number(c.total) / maxVal) * 100 : 0;
                          const colors = ["#1a237e","#4a148c","#1565c0","#2e7d32","#c62828","#f57f17","#00838f","#558b2f"];
                          return (
                            <div key={i} className="mb-2">
                              <div className="d-flex justify-content-between mb-1">
                                <span style={{ fontSize: "13px" }}>{c.category || "Uncategorized"}</span>
                                <span style={{ fontSize: "13px", fontWeight: "600" }}>{fmt(c.total)}</span>
                              </div>
                              <div style={{ background: "#eee", borderRadius: "4px", height: "8px" }}>
                                <div style={{
                                  width: `${pct}%`, height: "8px",
                                  background: colors[i % colors.length],
                                  borderRadius: "4px",
                                  transition: "width 0.5s ease"
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Top Vendors ── */}
                  {dashboard.vendors.length > 0 && (
                    <div className="col-12 col-md-6">
                      <div className="card p-3 h-100">
                        <h6 className="fw-bold mb-3"><FiBriefcase /> Top Vendors</h6>
                        <table className="table table-sm">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Vendor</th>
                              <th>Expenses</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboard.vendors.map((v, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{v.vendor_name || "—"}</td>
                                <td><span className="badge bg-primary">{v.total_expenses}</span></td>
                                <td className="fw-semibold">{fmt(v.total_amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Recent Expenses ── */}
                <div className="card p-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0"><FiClock /> Recent Expenses</h6>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveTab("expenses")}
                    >
                      View All
                    </button>
                  </div>
                  {dashboard.recent.length === 0 ? (
                    <p className="text-muted small">No expenses yet. Add your first expense!</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Exp No</th>
                            <th>Date</th>
                            <th>Vendor</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.recent.map((e, i) => (
                            <tr key={i}>
                              <td><strong>{e.expense_number}</strong></td>
                              <td className="text-muted small">
                                {new Date(e.expense_date).toLocaleDateString("en-IN")}
                              </td>
                              <td>{e.vendor_name || "—"}</td>
                              <td>{e.category_name || "—"}</td>
                              <td className="fw-semibold">{fmt(e.total_amount)}</td>
                              <td>
                                <span className={`badge bg-${statusColor(e.payment_status)}`}>
                                  {e.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── Payment Status Summary ── */}
                {dashboard.statusData.length > 0 && (
                  <div className="card p-3 mb-4">
                    <h6 className="fw-bold mb-3"><FiCreditCard /> Payment Status Summary</h6>
                    <div className="row g-3">
                      {dashboard.statusData.map((s, i) => (
                        <div key={i} className="col-12 col-md-4">
                          <div className={`card p-3 border-${statusColor(s.payment_status)}`}>
                            <div className="d-flex justify-content-between">
                              <span className={`badge bg-${statusColor(s.payment_status)} mb-2`}>
                                {s.payment_status}
                              </span>
                              <span className="fw-bold">{s.count} expenses</span>
                            </div>
                            <div className="fw-bold fs-6">{fmt(s.total)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted">No data available.</p>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* EXPENSES TAB                                 */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "expenses" && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">All Expenses</h5>
              <button
                className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
              >        
                 {showForm ? <FiX />  :  <FiPlus size={14} /> }
                 {showForm ? "Cancel" : "Add Expense"}
              </button>
            </div>

            <div className="card mb-4 p-3" style={{ background: "#f8f9fa", borderLeft: "4px solid #1a237e" }}>
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold small"><FiClipboard /> Exp Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="EXP-2026-001"
                    value={expenseFilterNumber}
                    onChange={(e) => setExpenseFilterNumber(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleExpenseFilterApply();
                    }}
                  />
                </div>

                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold small"><FiTag /> Category</label>
                  <select
                    className="form-select"
                    value={expenseFilterCategory}
                    onChange={(e) => setExpenseFilterCategory(e.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold small"><FiBriefcase /> Vendor</label>
                  <select
                    className="form-select"
                    value={expenseFilterVendor}
                    onChange={(e) => setExpenseFilterVendor(e.target.value)}
                  >
                    <option value="">All vendors</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold small"><FiCalendar /> Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={expenseFilterMonth}
                    onChange={(e) => {
                      setExpenseFilterMonth(e.target.value);
                      setExpenseFilterFrom("");
                      setExpenseFilterTo("");
                    }}
                  />
                </div>

                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold small">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseFilterFrom}
                    onChange={(e) => {
                      setExpenseFilterFrom(e.target.value);
                      setExpenseFilterMonth("");
                    }}
                  />
                </div>

                <div className="col-12 col-md-3 col-lg-2">
                  <label className="form-label fw-semibold small">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseFilterTo}
                    onChange={(e) => {
                      setExpenseFilterTo(e.target.value);
                      setExpenseFilterMonth("");
                    }}
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                  <button className="btn btn-primary btn-sm" onClick={handleExpenseFilterApply}>
                    <FiSearch /> Apply Filters
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleExpenseFilterReset}
                    disabled={!hasExpenseFilters}
                  >
                    <FiRefreshCw /> Reset
                  </button>
                </div>
              </div>
            </div>

            {/* ── Add/Edit Form ── */}
            {showForm && (
              <div className="card mb-4 border-primary">
                <div className="card-header fw-bold"
                  style={{ background: "#1a237e", color: "white" }}>
                    
                 {editingId ? <FiEdit /> :<FiPlus />}
                  {editingId ? " Edit Expense" : "Add New Expense"}
                </div>
                <div className="card-body">
                  <div className="row g-3">

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Expense Date *</label>
                      <input type="date" className="form-control"
                        value={form.expense_date}
                        max={TODAY}
                        onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Vendor</label>
                      <select className="form-select"
                        value={form.vendor_id}
                        onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}>
                        <option value="">Select vendor...</option>
                        {vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Category</label>
                      <select className="form-select"
                        value={form.category_id}
                        onChange={(e) => handleExpenseCategoryChange(e.target.value)}>
                        <option value="">Select category...</option>
                        {categories.filter(c => c.is_active === 1).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Client Name</label>
                      <input type="text" className="form-control"
                        placeholder="Optional"
                        value={form.client_name}
                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Project/Campaign</label>
                      <input type="text" className="form-control"
                        placeholder="Optional"
                        value={form.project_name}
                        onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Payment Mode</label>
                      <select className="form-select"
                        value={form.payment_mode}
                        onChange={(e) => setForm({ ...form, payment_mode: e.target.value })}>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Amount / Unit (₹) *</label>
                      <input type="number" className="form-control"
                        placeholder="0.00" min="1" step="0.01"
                        value={form.unit_amount}
                        onChange={(e) => handleExpenseCalcChange({ unit_amount: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Units / Quantity *</label>
                      <input type="number" className="form-control"
                        placeholder="1" min="1" step="1"
                        value={form.units}
                        onChange={(e) => handleExpenseCalcChange({ units: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">GST %</label>
                      <select className="form-select"
                        value={form.gst_percent}
                        onChange={(e) => handleExpenseCalcChange({ gst_percent: e.target.value })}>
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Subtotal (₹)</label>
                      <input type="number" className="form-control"
                        readOnly value={form.amount}
                        style={{ background: "#f8f9fa" }}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">GST Amount (₹)</label>
                      <input type="number" className="form-control"
                        readOnly value={form.gst_amount}
                        style={{ background: "#f8f9fa" }}
                      />
                    </div>

                    <div className="col-12 col-md-3">
                      <label className="form-label fw-semibold">Total Amount (₹)</label>
                      <input type="number" className="form-control fw-bold"
                        readOnly value={form.total_amount}
                        style={{ background: "#e8f5e9", fontWeight: "bold" }}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">GST Type</label>
                      <select className="form-select"
                        value={form.gst_type}
                        onChange={(e) => setForm({ ...form, gst_type: e.target.value })}>
                        <option value="cgst_sgst">CGST + SGST</option>
                        <option value="igst">IGST</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Payment Status</label>
                      <select className="form-select"
                        value={form.payment_status}
                        onChange={(e) => setForm({ ...form, payment_status: e.target.value })}>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Due Date</label>
                      <input type="date" className="form-control"
                        value={form.due_date}
                        min={TODAY}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <input type="text" className="form-control"
                        placeholder="Optional notes"
                        value={form.notes}
                        maxLength={200}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </div>

                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-success px-4" onClick={handleSubmit}>
                     <FiSave />  {editingId ? "Update" : "Save Expense"}
                    </button>
                    <button className="btn btn-outline-secondary"
                      onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Expense List ── */}
            {loading ? (
              <p className="text-muted">Loading expenses...</p>
            ) : expenses.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No expenses found.</p>
                <button className="btn btn-primary"
                  onClick={() => setShowForm(true)}>
                 <FiPlus/> Add First Expense
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="d-none d-md-block table-responsive">
                  <table className="table table-bordered table-hover align-middle">
                    <thead style={{ background: "#1a237e", color: "white" }}>
                      <tr>
                        <th>Exp No</th>
                        <th>Date</th>
                        <th>Vendor</th>
                        <th>Category</th>
                        <th>Client</th>
                        <th>Unit Amt</th>
                        <th>Units</th>
                        <th>Subtotal</th>
                        <th>GST</th>
                        <th>Total</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id}>
                          <td><strong>{e.expense_number}</strong></td>
                          <td className="text-muted small">
                            {new Date(e.expense_date).toLocaleDateString("en-IN")}
                          </td>
                          <td>{e.vendor_name  || "—"}</td>
                          <td>{e.category_name || "—"}</td>
                          <td>{e.client_name  || "—"}</td>
                          <td>{fmt(e.unit_amount || e.amount)}</td>
                          <td>{Number(e.units || 1).toLocaleString("en-IN")}</td>
                          <td>{fmt(e.amount)}</td>
                          <td className="text-muted small">{fmt(e.gst_amount)}</td>
                          <td className="fw-bold">{fmt(e.total_amount)}</td>
                          <td className="text-muted small">{e.payment_mode?.replace("_", " ") || "—"}</td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={e.payment_status}
                              style={{ width: "100px" }}
                              onChange={async (ev) => {
                                await updateExpenseStatusAPI(e.id, ev.target.value);
                                await loadExpenses(buildExpenseFilters());
                                await loadDashboard();
                              }}
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                              <option value="partial">Partial</option>
                            </select>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-outline-warning btn-sm"
                                onClick={() => handleEdit(e)}>
                                <FiEdit size={13} />
                              </button>
                              <button className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(e.id)}>
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="d-md-none">
                  {expenses.map((e) => (
                    <div key={e.id} className="card mb-3"
                      style={{ borderLeft: "4px solid #1a237e" }}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-1">
                          <strong>{e.expense_number}</strong>
                          <span className={`badge bg-${statusColor(e.payment_status)}`}>
                            {e.payment_status}
                          </span>
                        </div>
                        <p className="small text-muted mb-1">
                          <FiCalendar /> {new Date(e.expense_date).toLocaleDateString("en-IN")}
                          {e.vendor_name && ` | <FiBriefcase /> ${e.vendor_name}`}
                        </p>
                        <p className="small text-muted mb-2">
                            {e.category_name && (<> <FiTag /> {e.category_name}</>)}
                          {/* {e.category_name && `<FiTag />${e.category_name}`} */}
                          {e.client_name && ( <> {" | "} <FiUser /> {e.client_name} </>)}
                          {/* {e.client_name && ` | <FiUser /> ${e.client_name}`} */}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold">
                          {fmt(e.total_amount)}
                          <small className="text-muted d-block">
                            {fmt(e.unit_amount || e.amount)} x {Number(e.units || 1).toLocaleString("en-IN")}
                          </small>
                        </span>
                          <div className="d-flex gap-1">
                            <button className="btn btn-outline-warning btn-sm"
                              onClick={() => handleEdit(e)}>
                              <FiEdit size={13} />
                            </button>
                            <button className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(e.id)}>
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
    {/* ════════════════════════════════════════════ */}
    {/* CATEGORIES TAB                               */}
    {/* ════════════════════════════════════════════ */}
{activeTab === "categories" && (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Expense Categories ({categories.length})</h5>
      <button
        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
        onClick={() => { setShowCatForm(!showCatForm); setEditingCatId(null); setCatForm({ name: "", description: "", default_price: "" }); }}
      >
        <FiPlus size={14} /> {showCatForm ? "Cancel" : "Add Category"}
      </button>
    </div>

    {/* Add/Edit Form */}
    {showCatForm && (
      <div className="card mb-4 border-primary">
        <div className="card-header fw-bold"
          style={{ background: "#1a237e", color: "white" }}>
             {editingCatId ? <FiEdit/> : <FiPlus/>}
          {editingCatId ? " Edit Category" : " Add Category"}
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Category Name *</label>
              <input
                type="text" className="form-control"
                placeholder="e.g. Facebook Ads"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Default Price</label>
              <input
                type="number" className="form-control"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={catForm.default_price}
                onChange={(e) => setCatForm({ ...catForm, default_price: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Description</label>
              <input
                type="text" className="form-control"
                placeholder="Optional description"
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-success px-4" onClick={handleCatSubmit}>
            <FiSave/> {editingCatId ? "Update" : "Add Category"}
            </button>
            <button className="btn btn-outline-secondary"
              onClick={() => { setShowCatForm(false); setEditingCatId(null); }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Categories Table */}
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle">
        <thead style={{ background: "#1a237e", color: "white" }}>
          <tr>
            <th>#</th>
            <th>Category Name</th>
            <th>Default Price</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr key={cat.id}>
              <td>{i + 1}</td>
              <td><strong>{cat.name}</strong></td>
              <td>{fmt(cat.default_price)}</td>
              <td>{cat.description || <span className="text-muted">—</span>}</td>
              <td>
                <span className={`badge ${cat.is_active ? "bg-success" : "bg-secondary"}`}>
                  {cat.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <div className="d-flex gap-1">
                  <button
                      className={`btn btn-sm ${cat.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                      onClick={() => handleCatToggle(cat)}
                      title={cat.is_active ? "Click to deactivate" : "Click to activate"}
                    >
                      {cat.is_active ? <>
                        <FiXCircle /> Deactivate </>
                       :<>
                        <FiCheckCircle /> Activate
                     </>}
                    </button>
                  <button className="btn btn-outline-primary btn-sm"
                    onClick={() => handleCatEdit(cat)}>
                    <FiEdit size={13} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm"
                    onClick={() => handleCatDelete(cat.id, cat.name)}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{/* ════════════════════════════════════════════ */}
{/* VENDORS TAB                                  */}
{/* ════════════════════════════════════════════ */}
{activeTab === "vendors" && (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Vendors ({vendors.length})</h5>
      <button
        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
        onClick={() => { setShowVendorForm(!showVendorForm); setEditingVendorId(null); setVendorForm({ ...EMPTY_VENDOR }); }}
      >
        <FiPlus size={14} /> {showVendorForm ? "Cancel" : "Add Vendor"}
      </button>
    </div>

    {/* Add/Edit Form */}
    {showVendorForm && (
      <div className="card mb-4 border-primary">
        <div className="card-header fw-bold"
          style={{ background: "#1a237e", color: "white" }}>
        {editingVendorId ? <FiEdit/> : <FiPlus/>}
          {editingVendorId ? " Edit Vendor" : " Add Vendor"}
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Vendor Name *</label>
              <input type="text" className="form-control"
                placeholder="Vendor name"
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">GST Number</label>
              <input type="text" className="form-control"
                placeholder="GST number"
                value={vendorForm.gst_number}
                onChange={(e) => setVendorForm({ ...vendorForm, gst_number: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Contact Person</label>
              <input type="text" className="form-control"
                placeholder="Contact person name"
                value={vendorForm.contact_person}
                onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Mobile</label>
              <input type="text" className="form-control"
                placeholder="Mobile number"
                value={vendorForm.mobile}
                onChange={(e) => setVendorForm({ ...vendorForm, mobile: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Email</label>
              <input type="email" className="form-control"
                placeholder="Email address"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold">Payment Terms</label>
              <select className="form-select"
                value={vendorForm.payment_terms}
                onChange={(e) => setVendorForm({ ...vendorForm, payment_terms: e.target.value })}>
                <option value="">Select terms...</option>
                <option value="immediate">Immediate</option>
                <option value="net_15">Net 15 days</option>
                <option value="net_30">Net 30 days</option>
                <option value="net_45">Net 45 days</option>
                <option value="net_60">Net 60 days</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Address</label>
              <input type="text" className="form-control"
                placeholder="Full address"
                value={vendorForm.address}
                onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              />
            </div>
          </div>
          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-success px-4" onClick={handleVendorSubmit}>
              <FiSave/> {editingVendorId ? "Update Vendor" : "Add Vendor"}
            </button>
            <button className="btn btn-outline-secondary"
              onClick={() => { setShowVendorForm(false); setEditingVendorId(null); }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Vendors Table — Desktop */}
    <div className="d-none d-md-block table-responsive">
      <table className="table table-bordered table-hover align-middle">
        <thead style={{ background: "#1a237e", color: "white" }}>
          <tr>
            <th>#</th>
            <th>Vendor Name</th>
            <th>GST No</th>
            <th>Contact</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Payment Terms</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                No vendors yet. Add your first vendor!
              </td>
            </tr>
          ) : vendors.map((v, i) => (
            <tr key={v.id}>
              <td>{i + 1}</td>
              <td><strong>{v.name}</strong></td>
              <td>
                {v.gst_number
                  ? <span className="badge bg-success">{v.gst_number}</span>
                  : <span className="text-muted">—</span>}
              </td>
              <td>{v.contact_person || <span className="text-muted">—</span>}</td>
              <td>{v.mobile || <span className="text-muted">—</span>}</td>
              <td>{v.email || <span className="text-muted">—</span>}</td>
              <td>{v.payment_terms?.replace("_", " ") || <span className="text-muted">—</span>}</td>
              <td>
                <div className="d-flex gap-1">
                  <button className="btn btn-outline-warning btn-sm"
                    onClick={() => handleVendorEdit(v)}>
                    <FiEdit size={13} />
                  </button>
                  <button className="btn btn-outline-danger btn-sm"
                    onClick={() => handleVendorDelete(v.id, v.name)}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Vendors — Mobile Cards */}
    <div className="d-md-none">
      {vendors.length === 0 ? (
        <p className="text-muted text-center">No vendors yet.</p>
      ) : vendors.map((v) => (
        <div key={v.id} className="card mb-3" style={{ borderLeft: "4px solid #1a237e" }}>
          <div className="card-body">
            <div className="d-flex justify-content-between mb-1">
              <strong>{v.name}</strong>
              <div className="d-flex gap-1">
                <button className="btn btn-outline-warning btn-sm"
                  onClick={() => handleVendorEdit(v)}>
                  <FiEdit size={13} />
                </button>
                <button className="btn btn-outline-danger btn-sm"
                  onClick={() => handleVendorDelete(v.id, v.name)}>
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
            {v.gst_number && <p className="small mb-1"><FiHome />  {v.gst_number}</p>}
            {v.contact_person && <p className="small mb-1"><FiUser/> {v.contact_person}</p>}
            {v.mobile && <p className="small mb-1"><FiPhone/> {v.mobile}</p>}
            {v.email && <p className="small mb-1"><FiMail/> {v.email}</p>}
            {v.payment_terms && <p className="small mb-0"><FiCreditCard /> {v.payment_terms.replace("_", " ")}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* ════════════════════════════════════════════ */}
{/* REPORTS TAB                                  */}
{/* ════════════════════════════════════════════ */}
{activeTab === "reports" && (
  <div>
    <h5 className="mb-4"><FiBarChart2 /> Expense Reports</h5>

    {/* ── Report Filter Card ── */}
    <div className="card mb-4 p-4" style={{ background: "#f8f9fa", borderLeft: "4px solid #1a237e" }}>
      <div className="row g-3 align-items-end">

        {/* Report Type */}
        <div className="col-12 col-md-3">
          <label className="form-label fw-semibold">Report Type</label>
          <select
            className="form-select"
            value={reportType}
            onChange={(e) => { setReportType(e.target.value); setReportGenerated(false); setReportData([]); }}
          >
                <option value="category"><FiFolder />Category Wise</option>
                <option value="vendor"><FiBriefcase /> Vendor Wise</option>
                <option value="date_range"><FiCalendar/> Date Range</option>
          </select>
        </div>

        {/* Month filter */}
        <div className="col-12 col-md-3">
          <label className="form-label fw-semibold">Filter by Month</label>
          <input
            type="month"
            className="form-control"
            value={reportMonth}
            onChange={(e) => { setReportMonth(e.target.value); setReportFrom(""); setReportTo(""); }}
          />
        </div>

        {/* From date */}
        <div className="col-12 col-md-2">
          <label className="form-label fw-semibold">From Date</label>
          <input
            type="date"
            className="form-control"
            value={reportFrom}
            onChange={(e) => { setReportFrom(e.target.value); setReportMonth(""); }}
          />
        </div>

        {/* To date */}
        <div className="col-12 col-md-2">
          <label className="form-label fw-semibold">To Date</label>
          <input
            type="date"
            className="form-control"
            value={reportTo}
            onChange={(e) => { setReportTo(e.target.value); setReportMonth(""); }}
          />
        </div>

        {/* Generate button */}
        <div className="col-12 col-md-2">
          <button
            className="btn btn-primary w-100"
            onClick={handleGenerateReport}
            disabled={reportLoading}
          >
            {reportLoading ? "Generating..." : <><FiSearch /> Generate</>}
          </button>
        </div>
      </div>

      {/* Active filter badge */}
      {(reportMonth || (reportFrom && reportTo)) && (
        <div className="mt-2">
          <small className="text-muted">
            Filtering:{" "}
            {reportMonth
              ? <span className="badge bg-info text-dark">
                  {new Date(reportMonth + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}
                </span>
              : <span className="badge bg-warning text-dark">{reportFrom} → {reportTo}</span>
            }
            <button
              className="btn btn-sm btn-link text-danger ms-2 p-0"
              onClick={() => { setReportMonth(""); setReportFrom(""); setReportTo(""); }}
            >
              Clear
            </button>
          </small>
        </div>
      )}
    </div>

    {/* ── Report Output ── */}
    {reportLoading && <p className="text-muted">Generating report...</p>}

    {reportGenerated && !reportLoading && (
      <>
        {/* Summary Row */}
        {reportData.length > 0 && (
          <div className="row g-3 mb-4">
            {[
              {
                label: "Total Entries",
                value: reportType === "date_range"
                  ? reportData.length
                  : reportData.reduce((s, r) => s + Number(r.total_entries || 0), 0),
                color: "#1a237e", isCurrency: false
              },
              {
                label: "Total Amount",
                value: reportType === "date_range"
                  ? reportData.reduce((s, r) => s + Number(r.total_amount || 0), 0)
                  : reportData.reduce((s, r) => s + Number(r.total_amount || 0), 0),
                color: "#2e7d32", isCurrency: true
              },
              {
                label: "Total GST",
                value: reportData.reduce((s, r) => s + Number(r.gst_amount || r.total_gst || 0), 0),
                color: "#1565c0", isCurrency: true
              },
              ...(reportType !== "date_range" ? [
                {
                  label: "Total Paid",
                  value: reportData.reduce((s, r) => s + Number(r.paid || 0), 0),
                  color: "#558b2f", isCurrency: true
                },
                {
                  label: "Total Unpaid",
                  value: reportData.reduce((s, r) => s + Number(r.unpaid || 0), 0),
                  color: "#c62828", isCurrency: true
                }
              ] : [])
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3 col-lg-2">
                <div className="card text-center p-3"
                  style={{ background: s.color, color: "white", borderRadius: "10px" }}>
                  <div style={{ fontSize: s.isCurrency ? "13px" : "22px", fontWeight: "700" }}>
                    {s.isCurrency ? fmt(s.value) : s.value}
                  </div>
                  <div style={{ fontSize: "11px", opacity: 0.9 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
       

        {/* Export + Title */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h6 className="fw-bold mb-0">
            {reportType === "category"   && " Category Wise Report"}
            {reportType === "vendor"     && " Vendor Wise Report"}
            {reportType === "date_range" && "Date Range Report"}
            <span className="badge bg-secondary ms-2">{reportData.length} records</span>
          </h6>
          <div className="d-flex gap-2">
            <button
              className="btn btn-success btn-sm"
              onClick={exportToCSV}
              disabled={reportData.length === 0}
            >
              <FiDownload /> Export CSV
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.print()}
            >
              <FiPrinter /> Print
            </button>
          </div>
        </div>

        {reportData.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No data found for selected filters.</p>
          </div>
        ) : (
          <>
            {/* ── Category Wise Table ── */}
            {reportType === "category" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead style={{ background: "#1a237e", color: "white" }}>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Entries</th>
                      <th>Subtotal</th>
                      <th>GST</th>
                      <th>Total Amount</th>
                      <th>Paid</th>
                      <th>Unpaid</th>
                      <th>Partial</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><strong>{r.category}</strong></td>
                        <td><span className="badge bg-primary">{r.total_entries}</span></td>
                        <td>{fmt(r.subtotal)}</td>
                        <td className="text-muted">{fmt(r.total_gst)}</td>
                        <td className="fw-bold">{fmt(r.total_amount)}</td>
                        <td className="text-success fw-semibold">{fmt(r.paid)}</td>
                        <td className="text-danger fw-semibold">{fmt(r.unpaid)}</td>
                        <td className="text-warning fw-semibold">{fmt(r.partial)}</td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="fw-bold" style={{ background: "#e8eaf6" }}>
                      <td colSpan="2">Total</td>
                      <td>{reportData.reduce((s, r) => s + Number(r.total_entries), 0)}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.subtotal), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.total_gst), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.total_amount), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.paid), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.unpaid), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.partial), 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Vendor Wise Table ── */}
            {reportType === "vendor" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead style={{ background: "#1a237e", color: "white" }}>
                    <tr>
                      <th>#</th>
                      <th>Vendor</th>
                      <th>GST No</th>
                      <th>Entries</th>
                      <th>Subtotal</th>
                      <th>GST</th>
                      <th>Total Amount</th>
                      <th>Paid</th>
                      <th>Unpaid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><strong>{r.vendor}</strong></td>
                        <td>
                          {r.gst_number
                            ? <span className="badge bg-success">{r.gst_number}</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td><span className="badge bg-primary">{r.total_entries}</span></td>
                        <td>{fmt(r.subtotal)}</td>
                        <td className="text-muted">{fmt(r.total_gst)}</td>
                        <td className="fw-bold">{fmt(r.total_amount)}</td>
                        <td className="text-success fw-semibold">{fmt(r.paid)}</td>
                        <td className="text-danger fw-semibold">{fmt(r.unpaid)}</td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="fw-bold" style={{ background: "#e8eaf6" }}>
                      <td colSpan="3">Total</td>
                      <td>{reportData.reduce((s, r) => s + Number(r.total_entries), 0)}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.subtotal), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.total_gst), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.total_amount), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.paid), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.unpaid), 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Date Range Table ── */}
            {reportType === "date_range" && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead style={{ background: "#1a237e", color: "white" }}>
                    <tr>
                      <th>#</th>
                      <th>Exp No</th>
                      <th>Date</th>
                      <th>Vendor</th>
                      <th>Category</th>
                      <th>Client</th>
                      <th>Unit Amt</th>
                      <th>Units</th>
                      <th>Subtotal</th>
                      <th>GST%</th>
                      <th>GST Amt</th>
                      <th>Total</th>
                      <th>Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((r, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><strong>{r.expense_number}</strong></td>
                        <td className="text-muted small">
                          {new Date(r.expense_date).toLocaleDateString("en-IN")}
                        </td>
                        <td>{r.vendor}</td>
                        <td>{r.category}</td>
                        <td>{r.client_name || <span className="text-muted">—</span>}</td>
                        <td>{fmt(r.unit_amount || r.amount)}</td>
                        <td>{Number(r.units || 1).toLocaleString("en-IN")}</td>
                        <td>{fmt(r.amount)}</td>
                        <td>{r.gst_percent}%</td>
                        <td className="text-muted">{fmt(r.gst_amount)}</td>
                        <td className="fw-bold">{fmt(r.total_amount)}</td>
                        <td className="text-muted small">
                          {r.payment_mode?.replace("_", " ") || "—"}
                        </td>
                        <td>
                          <span className={`badge bg-${
                            r.payment_status === "paid"    ? "success" :
                            r.payment_status === "unpaid"  ? "danger"  : "warning"
                          }`}>
                            {r.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Total row */}
                    <tr className="fw-bold" style={{ background: "#e8eaf6" }}>
                      <td colSpan="8">Total</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.amount), 0))}</td>
                      <td>—</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.gst_amount), 0))}</td>
                      <td>{fmt(reportData.reduce((s, r) => s + Number(r.total_amount), 0))}</td>
                      <td colSpan="2">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ── Bar Chart for Category/Vendor ── */}
            {(reportType === "category" || reportType === "vendor") && reportData.length > 0 && (
              <div className="card mt-4 p-3">
                <h6 className="fw-bold mb-3">
                  {reportType === "category" ? <FiFolder/> : <FiBriefcase />} Amount Distribution
                </h6>
                <div style={{ overflowX: "auto" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", minHeight: "160px", padding: "0 8px" }}>
                    {reportData.map((r, i) => {
                      const maxVal = Math.max(...reportData.map(x => Number(x.total_amount)));
                      const height = maxVal > 0 ? (Number(r.total_amount) / maxVal) * 140 : 0;
                      const colors = ["#1a237e","#4a148c","#1565c0","#2e7d32","#c62828","#f57f17","#00838f","#558b2f"];
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                          <div style={{ fontSize: "10px", color: "#666", marginBottom: "4px", textAlign: "center" }}>
                            {fmt(r.total_amount)}
                          </div>
                          <div style={{
                            width: "100%", height: `${height}px`,
                            background: colors[i % colors.length],
                            borderRadius: "6px 6px 0 0", minHeight: "4px"
                          }} />
                          <div style={{ fontSize: "11px", color: "#555", marginTop: "6px", textAlign: "center", wordBreak: "break-word" }}>
                            {reportType === "category" ? r.category : r.vendor}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </>
    )}
  </div>
)}

      </div>
    </div>
  );
}

export default ExpensePage;
