import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { logout, getUser }     from "../utils/auth";
import { FiLogOut,FiXCircle, FiEdit, FiTrash2, FiPlus, FiTool, FiUser, FiCheck, FiX, FiDollarSign, FiCheckCircle, FiSave,FiSearch, FiCrosshair } from "react-icons/fi";
import {
  fetchServicesAPI,
  addServiceAPI,
  updateServiceAPI,
  deleteServiceAPI
} from "../data/serviceService";

const EMPTY_FORM = {
  name: "", sac_code: "", default_price: "", description: ""
};

function ServicePage() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [services,   setServices]   = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [searchText, setSearchText] = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchServicesAPI(true); // load all
      setServices(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFiltered(services.filter(s =>
      s.name?.toLowerCase().includes(text.toLowerCase()) ||
      s.sac_code?.includes(text) ||
      s.description?.toLowerCase().includes(text.toLowerCase())
    ));
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.name.trim()) { setError("Service name is required"); return; }
    if (form.sac_code && !/^\d{6}$/.test(form.sac_code)) {
      setError("SAC code must be 6 digits"); return;
    }
    if (form.default_price && Number(form.default_price) < 0) {
      setError("Price cannot be negative"); return;
    }

    try {
      const res = editingId
        ? await updateServiceAPI(editingId, form)
        : await addServiceAPI(form);

      if (res.error) { setError(res.error); return; }

      setSuccess(editingId ? "Service updated!" : "Service added!");
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      setEditingId(null);
      await loadServices();
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name:          s.name          || "",
      sac_code:      s.sac_code      || "",
      default_price: s.default_price || "",
      description:   s.description   || ""
    });
    setShowForm(true);
    setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"?`)) return;
    try {
      const res = await deleteServiceAPI(id);
      if (res.error) { setError(res.error); return; }
      setSuccess("Service deleted!");
      await loadServices();
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleToggle = async (s, e) => {
  if (e) e.preventDefault();
  try {
    const newStatus = s.is_active ? 0 : 1;
      const res = await updateServiceAPI(s.id, {
        name:          s.name,
        sac_code:      s.sac_code      || "",
        default_price: s.default_price || 0,
        description:   s.description   || "",
        is_active:     newStatus
      });
      if (res.error) { setError(res.error); return; }
      setSuccess(`Service "${s.name}" ${newStatus ? "activated" : "deactivated"}!`);
      await loadServices();
    } catch (err) {
      setError("Update failed.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setError(""); setSuccess("");
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const fmt = (n) =>
    `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // Stats
  const stats = {
    total:    services.length,
    active:   services.filter(s => s.is_active).length,
    inactive: services.filter(s => !s.is_active).length,
    avgPrice: services.length
      ? services.reduce((s, x) => s + Number(x.default_price || 0), 0) / services.length
      : 0
  };

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar px-3 px-md-4" style={{ background: "rgba(10,26,31,0.85)" }}>
        <span
          className="navbar-brand fw-bold text-white mb-0"
          style={{ fontSize: "clamp(13px, 4vw, 17px)" }}
        >
         <FiTool/> Service Management
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="text-white d-none d-sm-inline" style={{ fontSize: "13px" }}>
          <FiUser/> {currentUser?.username}
          </span>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/admin")}
          >
            ← Admin
          </button>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={handleLogout}
          >
            <FiLogOut size={14} />
            <span className="d-none d-sm-inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 mt-3">

        {/* ── Stats ── */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Services", value: stats.total,    color: "#1a237e", icon: <FiTool/> },
            { label: "Active",         value: stats.active,   color: "#2e7d32", icon: <FiCheckCircle/> },
            { label: "Inactive",       value: stats.inactive, color: "#c62828", icon: <FiX/>},
            { label: "Avg Price",      value: fmt(stats.avgPrice), color: "#1565c0", icon: <FiDollarSign/> },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div
                className="card text-center p-3"
                style={{ background: s.color, color: "white", borderRadius: "12px" }}
              >
                <div style={{ fontSize: "20px" }}>{s.icon}</div>
                <div style={{ fontSize: "20px", fontWeight: "700" }}>{s.value}</div>
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
            >  {editingId ? <FiEdit/> : <FiPlus/>}
              <span>{editingId ? "Edit Service" : " Add New Service"}</span>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={handleCancel}
              >
                ✕ Cancel
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Service Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Website Design"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold">
                    SAC Code
                    <small className="text-muted fw-normal ms-1">(6 digits)</small>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 998314"
                    maxLength={6}
                    value={form.sac_code}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setForm({ ...form, sac_code: val });
                    }}
                  />
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold">Default Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0.00"
                    min="0"
                    value={form.default_price}
                    onChange={(e) => setForm({ ...form, default_price: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief description of the service"
                    value={form.description}
                    maxLength={255}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-success px-4" onClick={handleSubmit}>
                  <FiSave/>{editingId ? "Update Service" : "Add Service"}
                </button>
                <button className="btn btn-outline-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Header + Search ── */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h5 className="mb-0">All Services ({filtered.length})</h5>
          {!showForm && (
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setForm({ ...EMPTY_FORM });
              }}
            >
              <FiPlus size={14} /> Add Service
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
        {/* ── Service List ── */}
        {loading ? (
          <p className="text-muted">Loading services...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No services found.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <FiPlus/>Add First Service
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="d-none d-md-block table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead style={{ background: "#1a237e", color: "white" }}>
                  <tr>
                    <th>#</th>
                    <th>Service Name</th>
                    <th>SAC Code</th>
                    <th>Default Price</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><strong>{s.name}</strong></td>
                      <td>
                        {s.sac_code
                          ? <span className="badge bg-info text-dark">{s.sac_code}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="fw-semibold text-success">{fmt(s.default_price)}</td>
                      <td className="text-muted small">{s.description || "—"}</td>
                      <td>
                        <span className={`badge ${s.is_active ? "bg-success" : "bg-secondary"}`}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className={`btn btn-sm ${s.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                           onClick={(e) => handleToggle(s, e)}
                          >  {s.is_active ? <FiXCircle /> :  <FiCheckCircle /> }
                            {s.is_active ? " Deactivate" : " Activate"}
                          </button>
                          <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => handleEdit(s)}
                          >
                            <FiEdit size={13} />
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(s.id, s.name)}
                          >
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
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="card mb-3"
                  style={{ borderLeft: `4px solid ${s.is_active ? "#2e7d32" : "#9e9e9e"}` }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>{s.name}</strong>
                        <span className={`badge ms-2 ${s.is_active ? "bg-success" : "bg-secondary"}`}>
                          {s.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => handleEdit(s)}
                        >
                          <FiEdit size={13} />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(s.id, s.name)}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {s.sac_code && (
                      <p className="small mb-1">
                        🏷 SAC: <span className="badge bg-info text-dark">{s.sac_code}</span>
                      </p>
                    )}
                    <p className="small mb-1 fw-semibold text-success">
                    <FiDollarSign/> {fmt(s.default_price)}
                    </p>
                    {s.description && (
                      <p className="small text-muted mb-2">{s.description}</p>
                    )}
                    <button
                      className={`btn btn-sm w-100 ${s.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                      onClick={(e) => handleToggle(s, e)}
                    >  {s.is_active ? <FiCheckCircle/> : <FiXCircle/>}
                      {s.is_active ? " Deactivate" : "Activate"}
                    </button>
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

export default ServicePage;