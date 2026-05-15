
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import { FiLogOut, FiEdit, 
  FiTrash2, 
  FiEye, 
  FiDownload, 
  FiChevronDown, 
  FiDollarSign,
  FiChevronUp, 
  FiSearch ,
  FiUser, 
  FiUsers,
  FiFileText, 
  FiPlus, 
  FiX, 
  FiUserPlus, 
  FiToggleLeft,
  FiToggleRight ,
  FiUserX,
  FiUserCheck,
  FiMail, 
  FiCalendar ,
  FiRefreshCw,
  FiMapPin, 
  FiTruck,
  FiSave,
  FiTool,
  FiClock, 
  FiCheckCircle,
  FiCloud,
  FiDatabase,
  FiFolder} from "react-icons/fi";
import { fetchAdminInvoicesAPI, 
  editInvoiceAPI,
  deleteInvoiceAPI, 
  updateInvoiceStatusAPI, 
  previewInvoicePDF, 
  downloadInvoicePDF,
  sendInvoiceEmailAPI,        
  sendPaymentReminderAPI 
 } from "../data/invoiceService";
import "./AdminPage.css";
// import logo from "../assets/OmniGrosslogo2.png"; 

const SERVICE_CATALOGUE = [
  { name: "Website Design",         sac_code: "998314", price: 25000 },
  { name: "Website Development",    sac_code: "998314", price: 50000 },
  { name: "SEO Services",           sac_code: "998361", price: 15000 },
  { name: "Google Ads Management",  sac_code: "998361", price: 10000 },
  { name: "Meta Ads Management",    sac_code: "998361", price: 10000 },
  { name: "Social Media Marketing", sac_code: "998367", price: 12000 },
  { name: "Content Marketing",      sac_code: "998363", price: 8000  },
  { name: "Graphic Design",         sac_code: "998386", price: 7500  },
  { name: "Landing Page Design",    sac_code: "998314", price: 15000 },
  { name: "Email Marketing",        sac_code: "998367", price: 6000  },
  { name: "Local SEO",              sac_code: "998361", price: 8000  },
  { name: "Custom",                 sac_code: "",        price: 0    },
];

const BASE_URL = "https://backend-msas.onrender.com";

function AdminPage() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [activeTab, setActiveTab] = useState("users");
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState("user");


// Invoice management states
const [invoices,       setInvoices]      = useState([]);
const [filteredInvs,   setFilteredInvs]  = useState([]);
const [invLoading,     setInvLoading]    = useState(false);
const [selectedUser,   setSelectedUser]  = useState("all");
const [searchText,     setSearchText]    = useState("");
const [expandedRow,    setExpandedRow]   = useState(null);
const [editingInvoice, setEditingInvoice]= useState(null);
const [editForm,       setEditForm]      = useState(null);
const [filterMonth,    setFilterMonth]   = useState("");
const [filterFrom,     setFilterFrom]    = useState("");
const [filterTo,       setFilterTo]      = useState("");

//Mail Managment States
   const [emailModal,     setEmailModal]     = useState(null); // invoice object
   const [emailAddress,   setEmailAddress]   = useState("");
   const [emailType,      setEmailType]      = useState("invoice");
   const [emailSending,   setEmailSending]   = useState(false);
   const [emailSuccess,   setEmailSuccess]   = useState("");
   const [emailError,     setEmailError]     = useState("");

   // Back Up AdminPage component ──────────
const [backupLoading, setBackupLoading] = useState(false);
const [backupMsg,     setBackupMsg]     = useState(null);
const [backupHistory, setBackupHistory] = useState([]);
const [backupStatus,  setBackupStatus]  = useState(null);
const [historyLoading, setHistoryLoading] = useState(false);

const fetchBackupStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/backup/status`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setBackupStatus(data);
  } catch (err) {
    console.error("Backup status fetch failed:", err);
  }
};

const fetchBackupHistory = async () => {
  setHistoryLoading(true);
  try {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${BASE_URL}/api/backup/history`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setBackupHistory(data.data);
  } catch (err) {
    console.error("History fetch failed:", err);
  } finally {
    setHistoryLoading(false);
  }
};

const handleManualBackup = async () => {
  setBackupLoading(true);
  setBackupMsg(null);
  try {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${BASE_URL}/api/backup/manual`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      setBackupMsg({ type: "success", text: ` ${data.data.fileName} uploaded to Drive` });
      fetchBackupHistory(); // refresh history after backup
    } else {
      setBackupMsg({ type: "error", text: `❌ ${data.message}` });
    }
  } catch (err) {
    setBackupMsg({ type: "error", text: "❌ Network error. Try again." });
  } finally {
    setBackupLoading(false);
  }
};

// fetch history when backup tab opens
useEffect(() => {
  if (activeTab === "backup") {
    fetchBackupStatus();
    fetchBackupHistory();
  }
}, [activeTab]);

// ── Add this state inside your AdminPage component ──────────End

  

useEffect(() => { loadUsers(); }, []);

useEffect(() => {
  if (activeTab === "invoices") loadAdminInvoices();
}, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setError(""); setSuccess("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required"); return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters"); return;
    }
    try {
      const res  = await fetch(`${BASE_URL}/api/users`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create user"); return; }
      setSuccess(`User "${username}" created successfully!`);
      setUsername(""); setEmail(""); setPassword(""); setRole("user");
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  const handleToggleStatus = async (id, currentStatus, uname) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const action    = newStatus === 1 ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} "${uname}"?`)) return;
    try {
      const res  = await fetch(`${BASE_URL}/api/users/${id}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ is_active: newStatus })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed"); return; }
      setSuccess(data.message);
      await loadUsers();
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  const handleDeleteUser = async (id, uname) => {
    if (id === currentUser?.id) {
      setError("You cannot delete your own account");
      return;
    }
    if (!window.confirm(`Delete user "${uname}"? Their existing invoices and records will remain, but will no longer be assigned to this user.`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_user_id: currentUser?.id })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Delete failed"); return; }
      setSuccess(data.message || `User "${uname}" deleted successfully`);
      await loadUsers();
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout(); navigate("/login");
    }
  };

// ── Load admin invoices ─────────────────────────────────
const loadAdminInvoices = async (uid = null) => {
  setInvLoading(true);
  try {
    const data = await fetchAdminInvoicesAPI(uid);
    setInvoices(Array.isArray(data) ? data : []);
    setFilteredInvs(Array.isArray(data) ? data : []);
  } catch (err) {
    setError("Failed to load invoices");
  } finally {
    setInvLoading(false);
  }
};

// ── Filter by user ──────────────────────────────────────
const handleUserFilter = (uid) => {
  setSelectedUser(uid);
  setSearchText("");
  loadAdminInvoices(uid === "all" ? null : uid);
};



const handleSearch = (text) => {
  setSearchText(text);
  applyFilters(invoices, text, filterMonth, filterFrom, filterTo);
};

const handleMonthFilter = (month) => {
  setFilterMonth(month);
  setFilterFrom("");
  setFilterTo("");
  applyFilters(invoices, searchText, month, "", "");
};

const handleDateRange = (from, to) => {
  setFilterFrom(from);
  setFilterTo(to);
  setFilterMonth("");
  applyFilters(invoices, searchText, "", from, to);
};

// ── Apply all filters together ──────────────────────────
const applyFilters = (data, search, month, from, to) => {
  let result = [...data];

  // Search filter
  if (search) {
    result = result.filter(inv =>
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.username?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Month filter
  if (month) {
    const [year, mon] = month.split("-");
    result = result.filter(inv => {
      const d = new Date(inv.created_at);
      return (
        d.getFullYear()  === Number(year) &&
        d.getMonth() + 1 === Number(mon)
      );
    });
  }

  // Date range filter
  if (from) {
    result = result.filter(inv =>
      new Date(inv.created_at) >= new Date(from)
    );
  }
  if (to) {
    result = result.filter(inv =>
      new Date(inv.created_at) <= new Date(to + "T23:59:59")
    );
  }

  setFilteredInvs(result);
};

// ── Reset all filters ───────────────────────────────────
const resetFilters = () => {
  setSearchText("");
  setFilterMonth("");
  setFilterFrom("");
  setFilterTo("");
  setFilteredInvs(invoices);
};

// ── Delete invoice ──────────────────────────────────────
const handleAdminDelete = async (id) => {
  if (!window.confirm("Delete this invoice?")) return;
  await deleteInvoiceAPI(id);
  await loadAdminInvoices(selectedUser === "all" ? null : selectedUser);
  setSuccess("Invoice deleted successfully");
};

// ── Open edit form ──────────────────────────────────────
const handleEditOpen = (inv) => {
  setEditingInvoice(inv.invoice_id);
  setEditForm({
    customer_name: inv.customer_name,
    state:         inv.state,
    due_date:      inv.due_date ? inv.due_date.split("T")[0] : "",
    notes:         inv.notes || "",
    items: inv.items.map(i => ({ ...i }))
  });
};

// ── Edit form item handlers ─────────────────────────────
const handleEditItemChange = (index, field, value) => {
  const updated = [...editForm.items];
  updated[index][field] = value;
  setEditForm({ ...editForm, items: updated });
};

const handleEditServiceSelect = (index, serviceName) => {
  const service = SERVICE_CATALOGUE.find(s => s.name === serviceName);
  if (!service) return;
  const updated = [...editForm.items];
  updated[index] = {
    ...updated[index],
    description: service.name === "Custom" ? "" : service.name,
    sac_code:    service.sac_code,
    unit_price:  service.price
  };
  setEditForm({ ...editForm, items: updated });
};

const addEditItem = () => {
  setEditForm({
    ...editForm,
    items: [...editForm.items, { description: "", sac_code: "", quantity: 1, unit_price: 0 }]
  });
};

const deleteEditItem = (index) => {
  setEditForm({
    ...editForm,
    items: editForm.items.filter((_, i) => i !== index)
  });
};

// ── Save edit ───────────────────────────────────────────
const handleEditSave = async () => {
  if (!editForm.customer_name.trim()) { setError("Customer name required"); return; }
  if (!editForm.state.trim())         { setError("State required"); return; }
  if (editForm.items.some(i => !i.description.trim())) {
    setError("Fill all item descriptions"); return;
  }

  const isMH      = editForm.state.trim().toLowerCase() === "maharashtra";
  const subtotal  = editForm.items.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const cgst      = isMH  ? subtotal * 0.09 : 0;
  const sgst      = isMH  ? subtotal * 0.09 : 0;
  const igst      = !isMH ? subtotal * 0.18 : 0;
  const total     = subtotal + cgst + sgst + igst;

  const payload = {
    invoice_data: {
      customer_name:   editForm.customer_name,
      state:           editForm.state,
      subtotal,
      discount_amount: 0,
      cgst_amount:     cgst,
      sgst_amount:     sgst,
      igst_amount:     igst,
      total_amount:    total,
      tax_type:        isMH ? "cgst_sgst" : "igst",
      notes:           editForm.notes,
      due_date:        editForm.due_date || null
    },
    items: editForm.items.map(i => ({
      ...i,
      quantity:   Number(i.quantity),
      unit_price: Number(i.unit_price),
      line_total: Number(i.quantity) * Number(i.unit_price)
    }))
  };

  try {
    const res = await editInvoiceAPI(editingInvoice, payload);
    if (res.message) {
      setSuccess("Invoice updated successfully!");
      setEditingInvoice(null);
      setEditForm(null);
      await loadAdminInvoices(selectedUser === "all" ? null : selectedUser);
    } else {
      setError(res.error || "Update failed");
    }
  } catch (err) {
    setError("Server error. Try again.");
  }
};

//email Handaller-----
   
  const handleSendEmail = async () => {
  setEmailError(""); setEmailSuccess("");

  if (!emailAddress.trim()) {
    setEmailError("Please enter email address"); return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
    setEmailError("Please enter a valid email address"); return;
  }

  setEmailSending(true);
  try {
    const res = emailType === "invoice"
      ? await sendInvoiceEmailAPI(emailModal.invoice_id, emailAddress)
      : await sendPaymentReminderAPI(emailModal.invoice_id, emailAddress);

    if (res.error) {
      setEmailError(res.error);
    } else {
      setEmailSuccess(res.message);
      setTimeout(() => {
        setEmailModal(null);
        setEmailAddress("");
        setEmailSuccess("");
      }, 2000);
    }
  } catch (err) {
    setEmailError("Failed to send email. Try again.");
  } finally {
    setEmailSending(false);
  }
};

//email Handaler-----end

// ── Computed stats ──────────────────────────────────────
const stats = {
  total:   invoices.length,
  revenue: invoices.reduce((s, i) => s + Number(i.total_amount), 0),
  paid:    invoices.filter(i => i.status === "paid").length,
  pending: invoices.filter(i => i.status === "draft" || i.status === "sent").length,
  overdue: invoices.filter(i => i.status === "overdue").length,
};

const fmt = (n) => `₹ ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const statusColor = (s) => ({
  draft: "secondary", sent: "primary", paid: "success", overdue: "danger"
}[s] || "secondary");

// Get unique users from invoices
const uniqueUsers = [...new Map(invoices.map(i => [i.user_id, { id: i.user_id, username: i.username }])).values()];


  const roleBadge = (r) => (
    <span className={`badge ${r === "admin" ? "bg-danger" : "bg-primary"}`}>{r}</span>
  );

  const statusBadge = (is_active) => (
    <span className={`badge ${is_active ? "bg-success" : "bg-secondary"}`}>
      {is_active ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar px-3 px-md-4" style={{ background: "rgba(10,26,31,0.85) "}}>
        <span
          className="navbar-brand fw-bold text-white mb-0"
          style={{ fontSize: "clamp(13px, 3.5vw, 17px)" }}
        >
          <div className="logo">
           
                      <img src="/OmniGrosslogo2.png" alt="OmniGross" className="logo-img" />
                      <span className="logo-text">OmniGross - Admin</span>
                 </div>
        </span>
        {/* current user */}

        <div className="d-flex align-items-center gap-2">
          <span
            className="text-white d-none d-sm-inline"
            style={{ fontSize: "13px" }}
          >
              <FiUser />
            {currentUser?.username}
            <span className="badge bg-danger ms-1">admin</span>
          </span>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={handleLogout}
          >
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
          <button
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate("/customers")}
           >
          <FiUsers /> Customers
         </button>
        <button
         className="btn btn-outline-light btn-sm"
         onClick={() => navigate("/services")}>
          <FiTool /> Services
      </button>
        <button
          className="btn btn-outline-light btn-sm"
          onClick={() => navigate("/expenses")}
        >
          <FiDollarSign />  Expenses
       </button>


        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 mt-3">

        {/* ── Tabs ── */}
        <ul
          className="nav nav-tabs mb-4"
          style={{ flexWrap: "nowrap", overflowX: "auto", overflowY: "hidden" }}
        >
          <li className="nav-item">
            <button
              className={`nav-link text-nowrap ${activeTab === "users" ? "active" : ""}`}
              style={{ fontSize: "clamp(12px, 3vw, 14px)", padding: "8px 12px" }}
              onClick={() => setActiveTab("users")}
            >
              <FiUsers /> Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-nowrap ${activeTab === "invoices" ? "active" : ""}`}
              style={{ fontSize: "clamp(12px, 3vw, 14px)", padding: "8px 12px" }}
              onClick={() => setActiveTab("invoices")}
            >
              <FiFileText /> Invoices
            </button>
          </li>

         <li className="nav-item">
          <button
              className={`nav-link text-nowrap ${activeTab === "backup" ? "active" : ""}`}
              style={{ fontSize: "clamp(12px, 3vw, 14px)", padding: "8px 12px" }}
              onClick={() => setActiveTab("backup")}
            >
              <FiCloud/> Backup
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
        {/* USER MANAGEMENT TAB                          */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div>
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h5 className="mb-0">All Users ({users.length})</h5>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
              > 
               {showForm ? <FiX /> : <FiPlus />}
               {showForm ? "Cancel" : " Add New User"}
              </button>
            </div>

            {/* ── Add User Form ── */}
            {showForm && (
              <div className="card mb-4 border-primary">
                <div
                  className="card-header fw-bold"
                  style={{ background: "#1a237e", color: "white" }}
                >
                  <FiPlus />Add New User
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6 col-lg-3">
                      <label className="form-label fw-semibold">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                      <label className="form-label fw-semibold">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                      <label className="form-label fw-semibold">Password *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-6 col-lg-3">
                      <label className="form-label fw-semibold">Role *</label>
                      <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button
                    className="btn btn-success mt-3 w-100 w-md-auto"
                    onClick={handleAddUser}
                  >
                    <FiUserPlus />
                     Create User
                  </button>
                </div>
              </div>
            )}

            {/* ── User List ── */}
            {loading ? (
              <p className="text-muted">Loading users...</p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="d-none d-md-block table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead style={{ background: "#1a237e", color: "white" }}>
                      <tr>
                        <th>#</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.id}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{u.username}</strong>
                            {u.id === currentUser?.id && (
                              <span className="badge bg-warning text-dark ms-2">You</span>
                            )}
                          </td>
                          <td>{u.email || <span className="text-muted">—</span>}</td>
                          <td>{roleBadge(u.role)}</td>
                          <td>{statusBadge(u.is_active)}</td>
                          <td className="text-muted small">
                            {new Date(u.created_at).toLocaleDateString("en-IN")}
                          </td>
                          <td>
                            {u.id === currentUser?.id ? (
                              <span className="text-muted small">Cannot modify</span>
                            ) : (
                              <div className="d-flex gap-1">
                                <button
                                  className={`btn btn-sm ${u.is_active
                                    ? "btn-outline-danger"
                                    : "btn-outline-success"}`}
                                  onClick={() => handleToggleStatus(u.id, u.is_active, u.username)}
                                >
                                  {u.is_active ? <FiUserX /> : <FiUserCheck />}
                                  {u.is_active ? " Deactivate" : " Activate"}
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                >
                                  <FiTrash2 /> Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="d-md-none">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="card mb-3"
                      style={{ borderLeft: "4px solid #1a237e" }}
                    >
                      <div className="card-body py-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div>
                            <strong>{u.username}</strong>
                            {u.id === currentUser?.id && (
                              <span className="badge bg-warning text-dark ms-2">You</span>
                            )}
                          </div>
                          <div className="d-flex gap-1">
                            {roleBadge(u.role)}
                            {statusBadge(u.is_active)}
                          </div>
                        </div>
                        <p className="text-muted small mb-1">
                          <FiMail />
                          {u.email || "No email"}
                        </p>
                        <p className="text-muted small mb-2">
                          <FiCalendar />
                           Joined: {new Date(u.created_at).toLocaleDateString("en-IN")}
                        </p>
                        {u.id !== currentUser?.id ? (
                          <div className="d-grid gap-2">
                            <button
                              className={`btn btn-sm ${u.is_active
                                ? "btn-outline-danger"
                                : "btn-outline-success"}`}
                              onClick={() => handleToggleStatus(u.id, u.is_active, u.username)}
                            >
                              {u.is_active ? <FiUserX /> : <FiUserCheck />}
                              {u.is_active ? " Deactivate" : " Activate"}
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteUser(u.id, u.username)}
                            >
                              <FiTrash2 /> Delete User
                            </button>
                          </div>
                        ) : (
                          <p className="text-muted small mb-0 text-center">
                            Cannot modify your own account
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* INVOICES TAB                                 */}
        {/* ════════════════════════════════════════════ */}
      
        {activeTab === "invoices" && (
  <div>

    {/* ── Stats Bar ── */}
    <div className="row g-3 mb-4">
      {[
        { label: "Total Invoices", value: stats.total,          color: "#1a237e", text: "white"  },
        { label: "Total Revenue",  value: fmt(stats.revenue),   color: "#2e7d32", text: "white"  },
        { label: "Paid",           value: stats.paid,           color: "#1565c0", text: "white"  },
        { label: "Pending",        value: stats.pending,        color: "#f57f17", text: "white"  },
        { label: "Overdue",        value: stats.overdue,        color: "#c62828", text: "white"  },
      ].map((s, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-2">
          <div
            className="card text-center p-3"
            style={{ background: s.color, color: s.text, borderRadius: "12px" }}
          >
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{s.value}</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>

    {/* ── User Filter Buttons ── */}
    <div className="d-flex flex-wrap gap-2 mb-3">
      <button
        className={`btn btn-sm ${selectedUser === "all" ? "btn-dark" : "btn-outline-dark"}`}
        onClick={() => handleUserFilter("all")}
      >
        All Users ({invoices.length})
      </button>
      {uniqueUsers.map(u => (
        <button
          key={u.id}
          className={`btn btn-sm ${selectedUser == u.id ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => handleUserFilter(u.id)}
        >
        <FiUser/> {u.username} ({invoices.filter(i => i.user_id === u.id).length})
        </button>
      ))}
    </div>

   
{/* ── Search + Date Filters ── */}
<div className="card mb-4 p-3" style={{ background: "#f8f9fa" }}>

  {/* Row 1: Search */}
  <div className="mb-3">
    <label className="form-label fw-semibold small"><FiSearch />Search</label>
    <input
      type="text"
      className="form-control"
      placeholder="Search by invoice no, customer, or user..."
      value={searchText}
      onChange={(e) => handleSearch(e.target.value)}
    />
  </div>

  {/* Row 2: Month + Date Range */}
  <div className="row g-3 align-items-end">

    {/* Month filter */}
    <div className="col-12 col-md-4">
      <label className="form-label fw-semibold small"> <FiCalendar /> Filter by Month</label>
      <input
        type="month"
        className="form-control"
        value={filterMonth}
        onChange={(e) => handleMonthFilter(e.target.value)}
      />
    </div>

    {/* Date from */}
    <div className="col-12 col-md-3">
      <label className="form-label fw-semibold small"> <FiCalendar /> From Date</label>
      <input
        type="date"
        className="form-control"
        value={filterFrom}
        onChange={(e) => handleDateRange(e.target.value, filterTo)}
      />
    </div>

    {/* Date to */}
    <div className="col-12 col-md-3">
      <label className="form-label fw-semibold small"> <FiCalendar /> To Date</label>
      <input
        type="date"
        className="form-control"
        value={filterTo}
        onChange={(e) => handleDateRange(filterFrom, e.target.value)}
      />
    </div>

    {/* Reset button */}
    <div className="col-12 col-md-2">
      <button
        className="btn btn-outline-secondary w-100"
        onClick={resetFilters}
      >
      <FiRefreshCw /> Reset
      </button>
    </div>

  </div>

  {/* Active filter indicator */}
  {(searchText || filterMonth || filterFrom || filterTo) && (
    <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
      <small className="text-muted">Active filters:</small>
      {searchText && (
        <span className="badge bg-primary">
          Search: "{searchText}"
          <button
            className="btn-close btn-close-white ms-1"
            style={{ fontSize: "8px" }}
            onClick={() => { setSearchText(""); applyFilters(invoices, "", filterMonth, filterFrom, filterTo); }}
          />
        </span>
      )}
      {filterMonth && (
        <span className="badge bg-info text-dark">
          Month: {new Date(filterMonth + "-01").toLocaleString("en-IN", { month: "long", year: "numeric" })}
          <button
            className="btn-close ms-1"
            style={{ fontSize: "8px" }}
            onClick={() => { setFilterMonth(""); applyFilters(invoices, searchText, "", filterFrom, filterTo); }}
          />
        </span>
      )}
      {(filterFrom || filterTo) && (
        <span className="badge bg-warning text-dark">
          Range: {filterFrom || "..."} → {filterTo || "..."}
          <button
            className="btn-close ms-1"
            style={{ fontSize: "8px" }}
            onClick={() => { setFilterFrom(""); setFilterTo(""); applyFilters(invoices, searchText, filterMonth, "", ""); }}
          />
        </span>
      )}
      <small className="text-muted">
        Showing {filteredInvs.length} of {invoices.length} invoices
      </small>
    </div>
  )}

</div>
    {/* ── Invoice Table ── */}
    {invLoading ? (
      <p className="text-muted">Loading invoices...</p>
    ) : filteredInvs.length === 0 ? (
      <p className="text-muted">No invoices found.</p>
    ) : (
      <>
        {/* Desktop Table */}
        <div className="d-none d-md-block table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead style={{ background: "#1a237e", color: "white" }}>
              <tr>
                <th></th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvs.map(inv => (
                <>
                  <tr key={inv.invoice_id}>
                    {/* Expand toggle */}
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setExpandedRow(expandedRow === inv.invoice_id ? null : inv.invoice_id)}
                      >
                        {expandedRow === inv.invoice_id ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </td>
                    <td><strong>{inv.invoice_number}</strong></td>
                    <td>{inv.customer_name}</td>
                    <td>
                      <span className="badge bg-secondary">{inv.username}</span>
                    </td>
                    <td className="fw-bold">{fmt(inv.total_amount)}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={inv.status}
                        style={{ width: "110px" }}
                        onChange={async (e) => {
                          await updateInvoiceStatusAPI(inv.invoice_id, e.target.value);
                          await loadAdminInvoices(selectedUser === "all" ? null : selectedUser);
                        }}
                      >
                        {["draft","sent","paid","overdue"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="text-muted small">
                      {new Date(inv.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          title="Preview"
                          onClick={() => previewInvoicePDF(inv.invoice_id)}
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          title="Download"
                          onClick={() => downloadInvoicePDF(inv.invoice_id, inv.invoice_number)}
                        >
                          <FiDownload size={14} />
                        </button>
                        <button
                          className="btn btn-outline-warning btn-sm"
                          title="Edit"
                          onClick={() => handleEditOpen(inv)}
                        >
                          <FiEdit size={14} />
                        </button>
                        
                                                <button
                                                    className="btn btn-outline-info btn-sm"
                                                    onClick={() => {
                                                      setEmailModal(inv);
                                                      setEmailAddress("");
                                                      setEmailError("");
                                                      setEmailSuccess("");
                                                      setEmailType("invoice");
                                                    }}
                                                  >
                                                  <FiMail/> 
                                                </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          title="Delete"
                          onClick={() => handleAdminDelete(inv.invoice_id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expandedRow === inv.invoice_id && (
                    <tr key={`exp-${inv.invoice_id}`} style={{ background: "#f8f9fa" }}>
                      <td colSpan="8">
                        <div className="p-3">
                          <div className="row mb-2">
                            <div className="col-md-3">
                              <small className="text-muted">State</small>
                              <div>{inv.state}</div>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted">Tax Type</small>
                              <div><span className="badge bg-info text-dark">{inv.tax_type}</span></div>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted">Due Date</small>
                              <div>{inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "N/A"}</div>
                            </div>
                            <div className="col-md-3">
                              <small className="text-muted">Notes</small>
                              <div>{inv.notes || "—"}</div>
                            </div>
                          </div>

                          <table className="table table-sm table-bordered mt-2">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Description</th>
                                <th>SAC</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map((item, i) => (
                                <tr key={i}>
                                  <td>{i + 1}</td>
                                  <td>{item.description}</td>
                                  <td>{item.sac_code}</td>
                                  <td>{item.quantity}</td>
                                  <td>{fmt(item.unit_price)}</td>
                                  <td>{fmt(item.line_total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="row justify-content-end">
                            <div className="col-md-4">
                              <table className="table table-sm">
                                <tbody>
                                  <tr>
                                    <td>Subtotal</td>
                                    <td className="text-end">{fmt(inv.subtotal)}</td>
                                  </tr>
                                  {inv.tax_type === "cgst_sgst" ? (
                                    <>
                                      <tr><td>CGST (9%)</td><td className="text-end">{fmt(inv.cgst_amount)}</td></tr>
                                      <tr><td>SGST (9%)</td><td className="text-end">{fmt(inv.sgst_amount)}</td></tr>
                                    </>
                                  ) : (
                                    <tr><td>IGST (18%)</td><td className="text-end">{fmt(inv.igst_amount)}</td></tr>
                                  )}
                                  <tr className="fw-bold table-success">
                                    <td>Total</td>
                                    <td className="text-end">{fmt(inv.total_amount)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="d-md-none">
          {filteredInvs.map(inv => (
            <div key={inv.invoice_id} className="card mb-3" style={{ borderLeft: "4px solid #1a237e" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{inv.invoice_number}</strong>
                    <span className={`badge bg-${statusColor(inv.status)} ms-2`}>{inv.status}</span>
                  </div>
                  <span className="badge bg-secondary">{inv.username}</span>
                </div>
                <p className="mb-1"><strong>Customer:</strong> {inv.customer_name}</p>
                <p className="mb-1"><strong>Amount:</strong> {fmt(inv.total_amount)}</p>
                <p className="mb-2 text-muted small">
                  {new Date(inv.created_at).toLocaleDateString("en-IN")}
                </p>

                {/* Status select */}
                <select
                  className="form-select form-select-sm mb-2"
                  value={inv.status}
                  onChange={async (e) => {
                    await updateInvoiceStatusAPI(inv.invoice_id, e.target.value);
                    await loadAdminInvoices(selectedUser === "all" ? null : selectedUser);
                  }}
                >
                  {["draft","sent","paid","overdue"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm flex-fill"
                    onClick={() => previewInvoicePDF(inv.invoice_id)}>
                    <FiEye size={13} /> Preview
                  </button>
                  <button className="btn btn-outline-success btn-sm flex-fill"
                    onClick={() => downloadInvoicePDF(inv.invoice_id, inv.invoice_number)}>
                    <FiDownload size={13} /> Download
                  </button>
                  <button className="btn btn-outline-warning btn-sm flex-fill"
                    onClick={() => handleEditOpen(inv)}>
                    <FiEdit size={13} /> Edit
                  </button>
                  <button
                                                      className="btn btn-outline-info btn-sm"
                                                      onClick={() => {
                                                        setEmailModal(inv);
                                                        setEmailAddress("");
                                                        setEmailError("");
                                                        setEmailSuccess("");
                                                        setEmailType("invoice");
                                                      }}
                                                    >
                                                  <FiMail/> 
                                                </button>
                  <button className="btn btn-outline-danger btn-sm flex-fill"
                    onClick={() => handleAdminDelete(inv.invoice_id)}>
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* ════════════════════════════════════════════ */}
    {/* EDIT INVOICE MODAL                           */}
    {/* ════════════════════════════════════════════ */}
    
    {editingInvoice && editForm && (
      <div
        style={{
          position:   "fixed",
          top: 0, left: 0,
          width:      "100%",
          height:     "100%",
          background: "rgba(0,0,0,0.5)",
          zIndex:     1050,
          overflowY:  "auto"
        }}
      >
        <div
          className="card mx-auto my-4"
          style={{ maxWidth: "900px", borderRadius: "16px" }}
        >
          <div
            className="card-header d-flex justify-content-between align-items-center"
            style={{ background: "#1a237e", color: "white", borderRadius: "16px 16px 0 0" }}
          >
            <h5 className="mb-0">✏ Edit Invoice</h5>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => { setEditingInvoice(null); setEditForm(null); }}
            >
              ✕ Close
            </button>
          </div>

          <div className="card-body p-4">

            {/* Customer + State */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Customer Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">State *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.state}
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                />
              </div>
            </div>

            {/* Due Date + Notes */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Tax indicator */}
            {editForm.state && (
              <div className={`alert alert-${editForm.state.trim().toLowerCase() === "maharashtra" ? "info" : "warning"} py-2 mb-3`}>
                {editForm.state.trim().toLowerCase() === "maharashtra" ? (
                 <>
                <FiMapPin />
                <span>Intra-state → CGST 9% + SGST 9%</span>
                </>
                ) : (
    <>
      <FiTruck />
      <span>Inter-state → IGST 18%</span>
    </>
  )}
              </div>
            )}

            {/* Items */}
            <h6 className="fw-bold">Line Items</h6>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 150 }}>Service</th>
                    <th style={{ minWidth: 140 }}>Description</th>
                    <th style={{ minWidth: 85  }}>SAC</th>
                    <th style={{ minWidth: 65  }}>Qty</th>
                    <th style={{ minWidth: 100 }}>Unit Price</th>
                    <th style={{ minWidth: 100 }}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {editForm.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          onChange={(e) => handleEditServiceSelect(index, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select</option>
                          {SERVICE_CATALOGUE.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.description}
                          onChange={(e) => handleEditItemChange(index, "description", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          value={item.sac_code === "-" ? "" : item.sac_code}
                          onChange={(e) => handleEditItemChange(index, "sac_code", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleEditItemChange(index, "quantity", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleEditItemChange(index, "unit_price", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control form-control-sm"
                          readOnly
                          value={(Number(item.quantity) * Number(item.unit_price)).toLocaleString("en-IN")}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteEditItem(index)}
                          disabled={editForm.items.length === 1}
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={addEditItem}
            >
              <FiPlus/> Add Row
            </button>

            {/* Save button */}
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-secondary"
                onClick={() => { setEditingInvoice(null); setEditForm(null); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success px-4"
                onClick={handleEditSave}
              >
              <FiSave/> Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    )}

    {/* ════════════════════════════════════════════ */}
    {/* EMAIL MODAL                                  */}
    {/* ════════════════════════════════════════════ */}
  {emailModal && (
  <div className="omni-email-overlay">
    <div className="omni-email-card">
      <div className="omni-email-header">
        <h6>
          <FiMail /> Send Email
        </h6>

        <button
          type="button"
          className="omni-close-btn"
          onClick={() => {
            setEmailModal(null);
            setEmailAddress("");
            setEmailError("");
            setEmailSuccess("");
          }}
        >
          <FiX />
        </button>
      </div>

      <div className="omni-email-body">
        <div className="omni-invoice-info">
          <strong>{emailModal.invoice_number}</strong>
          <span>{emailModal.customer_name}</span>
        </div>

        <label className="omni-label">Email Type</label>

        <div className="omni-email-type-row">
          <button
            type="button"
            className={
              emailType === "invoice"
                ? "omni-type-btn active-invoice"
                : "omni-type-btn"
            }
            onClick={() => setEmailType("invoice")}
          >
            <FiFileText /> Send Invoice
          </button>

          <button
            type="button"
            className={
              emailType === "reminder"
                ? "omni-type-btn active-reminder"
                : "omni-type-btn reminder-outline"
            }
            onClick={() => setEmailType("reminder")}
          >
            <FiClock /> Payment Reminder
          </button>
        </div>

        <label className="omni-label">Recipient Email *</label>

        <input
          type="email"
          className="omni-input"
          placeholder="customer@example.com"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
        />

        {emailError && <div className="omni-error">{emailError}</div>}

        {emailSuccess && (
          <div className="omni-success">
            <FiCheckCircle /> {emailSuccess}
          </div>
        )}

        <button
          type="button"
          className="omni-send-btn"
          onClick={handleSendEmail}
          disabled={emailSending}
        >
          {emailSending ? null : <FiMail />}
          {emailSending
            ? "Sending..."
            : `Send ${emailType === "invoice" ? "Invoice" : "Reminder"}`}
        </button>

        <p className="omni-note">
          {emailType === "invoice"
            ? "PDF invoice will be attached to the email"
            : "Payment reminder will be sent without attachment"}
        </p>
      </div>
    </div>
  </div>
)}

</div>
)}
    {/* ════════════════════════════════════════════ */}
    {/* EMAIL MODAL                                  */}
    {/* ════════════════════════════════════════════ */}

{activeTab === "backup" && (
  <div style={{ padding: "24px", maxWidth: "750px" }}>

    {/* ── Top Row ── */}
    <div style={{ display: "flex", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>

      {/* Manual Backup Card */}
      <div style={{
        flex: "1",
        minWidth: "280px",
        background: "#1a1a2e",
        border: "1px solid #2d2d4e",
        borderRadius: "14px",
        padding: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "24px" }}><FiCloud/></span>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "16px", fontWeight: 600 }}>
            Manual Backup
          </h3>
        </div>
        <p style={{ color: "#888", fontSize: "13px", margin: "0 0 20px 0", lineHeight: "1.6" }}>
          Instantly backup your entire database to Google Drive.
        </p>
        <button
          onClick={handleManualBackup}
          disabled={backupLoading}
          style={{
            width:        "100%",
            background:   backupLoading ? "#374151" : "#2563eb",
            color:        "#fff",
            border:       "none",
            borderRadius: "8px",
            padding:      "11px",
            fontSize:     "14px",
            fontWeight:   "600",
            cursor:       backupLoading ? "not-allowed" : "pointer",
            transition:   "background 0.2s",
          }}
        >  {backupLoading ?<FiClock/>: <FiCloud/>}
          {backupLoading ? " Backing up..." : "Backup Now"}
        </button>

        {backupMsg && (
          <p style={{
            marginTop:    "12px",
            fontSize:     "13px",
            padding:      "10px 14px",
            borderRadius: "6px",
            background:   backupMsg.type === "success" ? "#052e16" : "#2d0a0a",
            color:        backupMsg.type === "success" ? "#4ade80" : "#f87171",
            margin:       "12px 0 0 0",
          }}>
            {backupMsg.text}
          </p>
        )}
      </div>

      {/* Auto Backup Info Card */}
      <div style={{
        flex: "1",
        minWidth: "280px",
        background: "#1a1a2e",
        border: "1px solid #2d2d4e",
        borderRadius: "14px",
        padding: "24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <span style={{ fontSize: "24px" }}><FiClock/></span>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "16px", fontWeight: 600 }}>
            Backup Mode
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            background: "#0f172a",
            borderRadius: "8px",
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#888", fontSize: "13px" }}>Schedule</span>
            <span style={{ color: "#a5b4fc", fontWeight: 600, fontSize: "14px" }}>
              {backupStatus?.schedule || "Daily 2:00 AM IST"}
            </span>
          </div>

          <div style={{
            background: "#0f172a",
            borderRadius: "8px",
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#888", fontSize: "13px" }}>Storage</span>
            <span style={{ color: "#34d399", fontWeight: 600, fontSize: "14px" }}>
              Google Drive
            </span>
          </div>

          <div style={{
            background: "#0f172a",
            borderRadius: "8px",
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#888", fontSize: "13px" }}>Last Backup</span>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: "13px" }}>
              {backupHistory.length > 0
                ? new Date(backupHistory[0].created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                : "No backups yet"}
            </span>
          </div>

          <div style={{
            background: "#0f172a",
            borderRadius: "8px",
            padding: "14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ color: "#888", fontSize: "13px" }}>Status</span>
            <span style={{
              background: backupStatus?.autoBackup ? "#052e16" : "#2d1f06",
              color: backupStatus?.autoBackup ? "#4ade80" : "#facc15",
              padding: "3px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600
            }}>
              {backupStatus?.autoBackup ? "Auto active" : "Setup needed"}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* ── Backup History Table ── */}
    <div style={{
      background:   "#1a1a2e",
      border:       "1px solid #2d2d4e",
      borderRadius: "14px",
      padding:      "24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ color: "#fff", margin: 0, fontSize: "16px", fontWeight: 600 }}>
        <FiFolder/> Backup History
        </h3>
        <button
          onClick={fetchBackupHistory}
          style={{
            background: "transparent",
            border: "1px solid #374151",
            color: "#9ca3af",
            borderRadius: "6px",
            padding: "5px 12px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          <FiRefreshCw/> Refresh
        </button>
      </div>

      {historyLoading ? (
        <p style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>
          Loading history...
        </p>
      ) : backupHistory.length === 0 ? (
        <p style={{ color: "#888", fontSize: "13px", textAlign: "center", padding: "20px" }}>
          No backups yet. Click "Backup Now" to create your first backup.
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #2d2d4e" }}>
              <th style={{ color: "#6b7280", fontWeight: 500, padding: "8px 12px", textAlign: "left" }}>#</th>
              <th style={{ color: "#6b7280", fontWeight: 500, padding: "8px 12px", textAlign: "left" }}>File Name</th>
              <th style={{ color: "#6b7280", fontWeight: 500, padding: "8px 12px", textAlign: "left" }}>Type</th>
              <th style={{ color: "#6b7280", fontWeight: 500, padding: "8px 12px", textAlign: "left" }}>Created By</th>
              <th style={{ color: "#6b7280", fontWeight: 500, padding: "8px 12px", textAlign: "left" }}>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {backupHistory.map((b, i) => (
              <tr key={b.id} style={{
                borderBottom: "1px solid #1f2937",
                background: i % 2 === 0 ? "transparent" : "#0f172a"
              }}>
                <td style={{ color: "#6b7280", padding: "10px 12px" }}>{i + 1}</td>
                <td style={{ color: "#e5e7eb", padding: "10px 12px", fontFamily: "monospace", fontSize: "12px" }}>
                  {b.filename}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    background: b.type === "manual" ? "#1e3a5f" : "#052e16",
                    color:      b.type === "manual" ? "#60a5fa" : "#4ade80",
                    padding:    "3px 10px",
                    borderRadius: "20px",
                    fontSize:   "11px",
                    fontWeight: 600,
                    textTransform: "capitalize"
                  }}>
                     {b.type === "manual" ? <FiCloud/>: <FiClock/>}
                    {b.type === "manual" ? " Manual" : " Auto"}
                  </span>
                </td>
                <td style={{ color: "#9ca3af", padding: "10px 12px" }}>
                  {b.created_by || "System"}
                </td>
                <td style={{ color: "#9ca3af", padding: "10px 12px" }}>
                  {new Date(b.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

  </div>
)}
 </div>
 
  </div>
  );
}

export default AdminPage;
