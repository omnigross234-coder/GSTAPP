import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import { FiLogOut, FiEdit, FiTrash2, FiPlus, FiX, FiChevronDown, FiChevronUp ,FiUser, FiUsers ,FiEdit2 ,FiUserPlus, FiSave, FiSearch, FiFileText,FiMail, FiPhone, FiMapPin, FiCreditCard  } from "react-icons/fi";
import {
  fetchCustomersAPI,
  addCustomerAPI,
  updateCustomerAPI,
  deleteCustomerAPI
} from "../data/customerService";

const EMPTY_FORM = {
  name: "", business_name: "", email: "",
  phone: "", gst_number: "", address: "", state: ""
};

function CustomerPage() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [customers,   setCustomers]   = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [searchText,  setSearchText]  = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form,        setForm]        = useState({ ...EMPTY_FORM });
  const [expandedId,  setExpandedId]  = useState(null);

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await fetchCustomersAPI();
      setCustomers(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const f = customers.filter(c =>
      c.name?.toLowerCase().includes(text.toLowerCase()) ||
      c.business_name?.toLowerCase().includes(text.toLowerCase()) ||
      c.email?.toLowerCase().includes(text.toLowerCase()) ||
      c.phone?.includes(text) ||
      c.state?.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(f);
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.name.trim()) { setError("Customer name is required"); return; }

    try {
      const res = editingId
        ? await updateCustomerAPI(editingId, form)
        : await addCustomerAPI(form);

      if (res.error) { setError(res.error); return; }

      setSuccess(editingId ? "Customer updated!" : "Customer added!");
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      setEditingId(null);
      await loadCustomers();
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name:          c.name          || "",
      business_name: c.business_name || "",
      email:         c.email         || "",
      phone:         c.phone         || "",
      gst_number:    c.gst_number    || "",
      address:       c.address       || "",
      state:         c.state         || ""
    });
    setShowForm(true);
    setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"?`)) return;
    try {
      const res = await deleteCustomerAPI(id);
      if (res.error) { setError(res.error); return; }
      setSuccess("Customer deleted!");
      await loadCustomers();
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(""); setSuccess("");
  };

  const handleLogout = () => {
    logout(); navigate("/login");
  };

  // Stats
  const stats = {
    total:    customers.length,
    withEmail: customers.filter(c => c.email).length,
    withGST:  customers.filter(c => c.gst_number).length,
    revenue:  customers.reduce((s, c) => s + Number(c.total_revenue || 0), 0)
  };

  const fmt = (n) => `₹ ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar px-3 px-md-4" style={{ background: "rgba(10,26,31,0.85)" }}>
        <span
          className="navbar-brand fw-bold text-white mb-0"
          style={{ fontSize: "clamp(13px, 4vw, 17px)" }}
        >
         <FiUsers/>  Customers
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="text-white d-none d-sm-inline" style={{ fontSize: "13px" }}>
            <FiUser/> {currentUser?.username}
          </span>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={() => navigate("/admin")}
          >
            ← Admin
          </button>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={handleLogout}
          >
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 mt-3">

        {/* ── Stats ── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Customers", value: stats.total,     color: "#1a237e" },
            { label: "Total Revenue",   value: fmt(stats.revenue), color: "#2e7d32" },
            { label: "With Email",      value: stats.withEmail, color: "#1565c0" },
            { label: "With GST No",     value: stats.withGST,   color: "#6a1b9a" },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div
                className="card text-center p-3"
                style={{ background: s.color, color: "white", borderRadius: "12px" }}
              >
                <div style={{ fontSize: "22px", fontWeight: "700" }}>{s.value}</div>
                <div style={{ fontSize: "12px", opacity: 0.9 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

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

        {/* ── Add/Edit Form ── */}
        {showForm && (
          <div className="card mb-4 border-primary">
            <div
              className="card-header d-flex justify-content-between align-items-center fw-bold"
              style={{ background: "#1a237e", color: "white" }}
            >  
              <span>
                {editingId ? <FiEdit2 /> : <FiUserPlus />}
                {editingId ? "Edit Customer" : " Add New Customer"}</span>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleCancel}
              >
                <FiX size={14} /> Cancel
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Customer name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Business Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Business / company name"
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">GST Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GST number"
                    value={form.gst_number}
                    onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">State</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-success px-4"
                  onClick={handleSubmit}
                >
                   {editingId ? <FiSave /> : <FiUserPlus />}
                   {editingId ? "Update Customer" : "Add Customer"}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header + Search ── */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h5 className="mb-0">All Customers ({filtered.length})</h5>
          {!showForm && (
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
            >
              <FiPlus size={14} /> Add Customer
            </button>
          )}
        </div>


<div className="mb-3 position-relative">
  <FiSearch
    className="position-absolute"
    style={{
      top: "50%",
      left: "10px",
      transform: "translateY(-50%)",
      color: "#6c757d",
    }}
  />

  <input
    type="text"
    className="form-control ps-5"
    placeholder="Search by name, business, email, phone or state..."
    value={searchText}
    onChange={(e) => handleSearch(e.target.value)}
  />
</div>
        

        {/* ── Customer List ── */}
        {loading ? (
          <p className="text-muted">Loading customers...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted">No customers found.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="d-none d-md-block table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead style={{ background: "#1a237e", color: "white" }}>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Business</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>GST No</th>
                    <th>State</th>
                    <th>Invoices</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <>
                      <tr key={c.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>{c.business_name || <span className="text-muted">—</span>}</td>
                        <td>{c.email || <span className="text-muted">—</span>}</td>
                        <td>{c.phone || <span className="text-muted">—</span>}</td>
                        <td>
                          {c.gst_number
                            ? <span className="badge bg-success">{c.gst_number}</span>
                            : <span className="text-muted">—</span>}
                        </td>
                        <td>{c.state || <span className="text-muted">—</span>}</td>
                        <td>
                          <span className="badge bg-primary">{c.total_invoices}</span>
                        </td>
                        <td className="fw-semibold text-success">
                          {fmt(c.total_revenue || 0)}
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              title="Invoice history"
                              onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            >
                              {expandedId === c.id ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                            </button>
                            <button
                              className="btn btn-outline-warning btn-sm"
                              title="Edit"
                              onClick={() => handleEdit(c)}
                            >
                              <FiEdit size={13} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              title="Delete"
                              onClick={() => handleDelete(c.id, c.name)}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded invoice history */}
                      {expandedId === c.id && (
                        <tr key={`exp-${c.id}`} style={{ background: "#f8f9fa" }}>
                          <td colSpan="10">
                            <div className="p-3">
                              <h6 className="fw-bold mb-2">
                              <FiFileText/> Invoice History for {c.name}
                              </h6>
                              {c.total_invoices === 0 ? (
                                <p className="text-muted small">No invoices yet.</p>
                              ) : (
                                <table className="table table-sm table-bordered">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Invoice No</th>
                                      <th>Amount</th>
                                      <th>Status</th>
                                      <th>Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(c.invoices || []).map((inv, j) => (
                                      <tr key={j}>
                                        <td>{inv.invoice_number || `#${inv.id}`}</td>
                                        <td>{fmt(inv.total_amount)}</td>
                                        <td>
                                          <span className={`badge bg-${
                                            inv.status === "paid"    ? "success"   :
                                            inv.status === "overdue" ? "danger"    :
                                            inv.status === "sent"    ? "primary"   : "secondary"
                                          }`}>
                                            {inv.status}
                                          </span>
                                        </td>
                                        <td className="text-muted small">
                                          {new Date(inv.created_at).toLocaleDateString("en-IN")}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
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
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="card mb-3"
                  style={{ borderLeft: "4px solid #1a237e" }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>{c.name}</strong>
                        {c.business_name && (
                          <div className="text-muted small">{c.business_name}</div>
                        )}
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleEdit(c)}
                        >
                          <FiEdit size={13} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(c.id, c.name)}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="row g-1 small text-muted mb-2">
                      {c.email && <div className="col-12"><FiMail /> {c.email}</div>}
                      {c.phone && <div className="col-12"><FiPhone /> {c.phone}</div>}
                      {c.state && <div className="col-12"><FiMapPin /> {c.state}</div>}
                      {c.gst_number && (
                        <div className="col-12">
                           <FiCreditCard /><span className="badge bg-success">{c.gst_number}</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-3 small">
                      <span>
                        <FiFileText /><strong>{c.total_invoices}</strong> invoices
                      </span>
                      <span className="text-success fw-semibold">
                        {fmt(c.total_revenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerPage;