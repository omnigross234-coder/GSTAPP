import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveInvoiceAPI,
  fetchInvoicesAPI,
  deleteInvoiceAPI,
  updateInvoiceStatusAPI,
  previewInvoicePDF,
  downloadInvoicePDF,
  fetchCustomerSuggestions
  
} from "../data/invoiceService";
import { logout, getUser } from "../utils/auth";
import {  FiLogOut ,  
          FiPlus,
          FiEye,
          FiDownload,
          FiTrash2,
          FiFileText,
          FiUser,
          FiMapPin,
          FiTag,
          FiHash,
          FiSave,  
          FiCheckCircle,
          FiMail,
          FiClock,
          FiX,
          FiPhone,
          FiHome
         } from "react-icons/fi";
import {
  INDIAN_STATES,
  validateInvoiceForm,
  validateCustomerName
} from "../utils/invoiceValidation";
import { fetchServicesAPI } from "../data/invoiceService";
// import logo from "../assets/OmniGrosslogo2.png"; 

// const SERVICE_CATALOGUE = [
//   { name: "Website Design",         sac_code: "998314", price: 25000 },
//   { name: "Website Development",    sac_code: "998314", price: 50000 },
//   { name: "SEO Services",           sac_code: "998361", price: 15000 },
//   { name: "Google Ads Management",  sac_code: "998361", price: 10000 },
//   { name: "Meta Ads Management",    sac_code: "998361", price: 10000 },
//   { name: "Social Media Marketing", sac_code: "998367", price: 12000 },
//   { name: "Content Marketing",      sac_code: "998363", price: 8000  },
//   { name: "Graphic Design",         sac_code: "998386", price: 7500  },
//   { name: "Landing Page Design",    sac_code: "998314", price: 15000 },
//   { name: "Email Marketing",        sac_code: "998367", price: 6000  },
//   { name: "Local SEO",              sac_code: "998361", price: 8000  },
//   { name: "Custom",                 sac_code: "",        price: 0    },
// ];

const EMPTY_ITEM = { description: "", sac_code: "", quantity: 1, unit_price: 0 };

// Today's date for due date min
const TODAY = new Date().toISOString().split("T")[0];

function Invoice() {
  const user        = JSON.parse(localStorage.getItem("user")) || { id: 1 };
  const navigate    = useNavigate();
  const currentUser = getUser();

  const handleLogout = () => { logout(); navigate("/login"); };

  // Form state
  const [customer_name, setCustomerName] = useState("");
  const [state,         setState]        = useState("");
  const [due_date,      setDueDate]      = useState("");
  const [notes,         setNotes]        = useState("");
  const [items,         setItems]        = useState([{ ...EMPTY_ITEM }]);
  const [invoices,      setInvoices]     = useState([]);
  const [loading,       setLoading]      = useState(false);
  const [activeTab,     setActiveTab]    = useState("create");

  // Validation errors
  const [errors,        setErrors]       = useState({});

  // Customer suggestions
  const [suggestions,     setSuggestions]     = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
 // service
  const [serviceCatalogue, setServiceCatalogue] = useState([]);

  const [emailModal,     setEmailModal]     = useState(null); // invoice object
  const [emailAddress,   setEmailAddress]   = useState("");
  const [emailType,      setEmailType]      = useState("invoice");
  const [emailSending,   setEmailSending]   = useState(false);
  const [emailSuccess,   setEmailSuccess]   = useState("");
  const [emailError,     setEmailError]     = useState("");

  // Add to useEffect
  useEffect(() => {
    loadInvoices();
    loadServices();
  }, []);

const loadServices = async () => {
    try {
      const data = await fetchServicesAPI();
      setServiceCatalogue(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  // useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoicesAPI();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  // ── Customer suggestions ────────────────────────────────
  const handleCustomerInput = async (value) => {
    setCustomerName(value);
    // Clear error on type
    setErrors(prev => ({ ...prev, customer_name: null }));

    if (value.trim().length < 1) {
      setSuggestions([]); setShowSuggestions(false); return;
    }
    try {
      const data = await fetchCustomerSuggestions(value);
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(data.length > 0);
    } catch (err) { console.error("Suggestions error:", err); }
  };

  const handleSelectSuggestion = (customer) => {
    setCustomerName(customer.name);
    setState(customer.state || "");
    setSuggestions([]);
    setShowSuggestions(false);
    setErrors(prev => ({ ...prev, customer_name: null, state: null }));
  };

  // ── Item handlers ───────────────────────────────────────
 
const handleServiceSelect = (index, serviceName) => {
  const service = serviceCatalogue.find(s => s.name === serviceName);
  if (!service) return;
  const updated = [...items];
  updated[index] = {
    ...updated[index],
    description: service.name === "Custom" ? "" : service.name,
    sac_code:    service.sac_code  || "",
    unit_price:  service.default_price || 0
  };
  setItems(updated);
};

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
    clearItemError(index, field);
  };

  const clearItemError = (index, field = null) => {
    setErrors(prev => {
      const itemErrors = [...(prev.items || [])];
      if (itemErrors[index]) {
        if (field) delete itemErrors[index][field];
        else itemErrors[index] = {};
      }
      return { ...prev, items: itemErrors };
    });
  };

  const addItem    = () => setItems([...items, { ...EMPTY_ITEM }]);
  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
    setErrors(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  // ── Calculations ────────────────────────────────────────
  const subtotal      = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const isMaharashtra = state.trim().toLowerCase() === "maharashtra";
  const cgst_amount   = isMaharashtra  ? subtotal * 0.09 : 0;
  const sgst_amount   = isMaharashtra  ? subtotal * 0.09 : 0;
  const igst_amount   = !isMaharashtra ? subtotal * 0.18 : 0;
  const total_amount  = subtotal + cgst_amount + sgst_amount + igst_amount;

  // ── Save ────────────────────────────────────────────────
  const handleSave = async () => {
    // Run validation
    const validationErrors = validateInvoiceForm({ customer_name, state, items });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const payload = {
      invoice_data: {
        customer_name, state, subtotal, discount_amount: 0,
        cgst_amount, sgst_amount, igst_amount, total_amount,
        tax_type: isMaharashtra ? "cgst_sgst" : "igst",
        user_id:  user.id,
        due_date: due_date || null,
        notes:    notes    || ""
      },
      items: items.map(item => ({
        ...item,
        quantity:   Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.quantity) * Number(item.unit_price)
      }))
    };

    try {
      const res = await saveInvoiceAPI(payload);
      if (res.invoice_id) {
        alert(`Invoice ${res.invoice_number} saved!`);
        setCustomerName(""); setState(""); setDueDate("");
        setNotes(""); setItems([{ ...EMPTY_ITEM }]); setErrors({});
        await loadInvoices();
        setActiveTab("list");
      } else {
        alert(res.error || "Save failed");
      }
    } catch (err) {
      alert("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    await deleteInvoiceAPI(id);
    await loadInvoices();
  };
     

  const statusColor = (s) => ({
    draft: "secondary", sent: "primary", paid: "success", overdue: "danger"
  }[s] || "secondary");

  const fmt = (n) => `₹ ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  // Helper: get item error
  const getItemError = (index, field) => errors.items?.[index]?.[field];

  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar px-3 px-md-4" style={{ background: "rgba(10,26,31,0.85) " }}>
        <span className="navbar-brand fw-bold text-white" style={{ fontSize: "clamp(14px, 4vw, 18px)" }}>
                   <div className="logo">
                              <img src="/OmniGrosslogo2.png" alt="logo" className="logo-img" />
                               
                               <span className="logo-text">OmniGross</span>
                          </div>
        </span>
        <div className="d-flex align-items-center gap-2">
          
          <span className="text-white d-none d-sm-inline" style={{ fontSize: "13px" }}>
            <FiUser />
             { currentUser?.username}
          </span>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
            onClick={handleLogout}
          >
            <FiLogOut size={14} /> <span className="d-none d-sm-inline">Logout</span>
          </button>
        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 mt-3">

        {/* ── Tabs ── */}
        <ul className="nav nav-tabs mb-3 flex-nowrap overflow-auto">
          <li className="nav-item">
            <button
              className={`nav-link text-nowrap ${activeTab === "create" ? "active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
               <FiPlus style={{ marginRight: "6px" }} /> Create Invoice
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link text-nowrap ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              <FiFileText style={{ marginRight: "6px" }} />Invoices ({invoices.length})
            </button>
          </li>
        </ul>

        {/* ════════════════════════════════════════════ */}
        {/* CREATE TAB                                   */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "create" && (
          <div>
            <h5 className="mb-3">Create GST Invoice</h5>

            {/* Customer + State */}
            <div className="row g-3 mb-3">

              {/* Customer Name with suggestions */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Customer Name *</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control ${errors.customer_name ? "is-invalid" : ""}`}
                    placeholder="Type to search or enter new customer..."
                    value={customer_name}
                    onChange={(e) => handleCustomerInput(e.target.value)}
                    onFocus={() => customer_name && setShowSuggestions(suggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                  />
                  {errors.customer_name && (
                    <div className="invalid-feedback">{errors.customer_name}</div>
                  )}

                  {/* Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0,
                      zIndex: 1050, background: "white",
                      border: "1px solid #dee2e6",
                      borderRadius: "0 0 8px 8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      maxHeight: "220px", overflowY: "auto"
                    }}>
                      {suggestions.map((c, i) => (
                        <div
                          key={c.id}
                          onMouseDown={() => handleSelectSuggestion(c)}
                          style={{
                            padding: "10px 14px", cursor: "pointer",
                            borderBottom: i < suggestions.length - 1 ? "1px solid #f0f0f0" : "none"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                        >
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "#1a237e" }}>
                            <FiUser /> {c.name}
                          </div>
                          <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                            {c.state && <span><FiMapPin /> {c.state}</span>}
                            {c.business_name && <span className="ms-2">  <FiHome  className="me-1 text-primary" /> {c.business_name}</span>}
                            {c.phone && <span className="ms-2"><FiPhone/> {c.phone}</span>} 
                          </div>
                        </div>
                      ))}
                      <div style={{
                        padding: "8px 14px", fontSize: "12px",
                        color: "#888", background: "#f8f9fa", borderTop: "1px solid #eee"
                      }}>
                        ! Not found? You can type a new name
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* State dropdown */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">State *</label>
                <select
                  className={`form-select ${errors.state ? "is-invalid" : ""}`}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setErrors(prev => ({ ...prev, state: null }));
                  }}
                >
                  <option value="">Select state...</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && (
                  <div className="invalid-feedback">{errors.state}</div>
                )}
              </div>
            </div>

            {/* Due Date + Notes */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={due_date}
                  min={TODAY}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <small className="text-muted">Cannot select past dates</small>
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold">
                  Notes
                  <small className="text-muted fw-normal ms-2">
                    ({notes.length}/200)
                  </small>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional notes"
                  value={notes}
                  maxLength={200}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Tax indicator */}
            {state && (
              <div className={`alert alert-${isMaharashtra ? "info" : "warning"} py-2 mb-3`}>
                {isMaharashtra
                  ? " Intra-state (Maharashtra) → CGST 9% + SGST 9%"
                  : " Inter-state → IGST 18%"}
              </div>
            )}

            {/* Items Table */}
            <h6 className="mt-3 fw-bold">Line Items</h6>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 160 }}>Service</th>
                    <th style={{ minWidth: 150 }}>Description *</th>
                    <th style={{ minWidth: 90  }}>SAC (6 digits)</th>
                    <th style={{ minWidth: 70  }}>Qty *</th>
                    <th style={{ minWidth: 110 }}>Unit Price *</th>
                    <th style={{ minWidth: 110 }}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          onChange={(e) => handleServiceSelect(index, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select</option>
                          {serviceCatalogue.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className={`form-control form-control-sm ${getItemError(index, "description") ? "is-invalid" : ""}`}
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        />
                        {getItemError(index, "description") && (
                          <div className="invalid-feedback">{getItemError(index, "description")}</div>
                        )}
                      </td>
                      <td>
                        <input
                          className={`form-control form-control-sm ${getItemError(index, "sac_code") ? "is-invalid" : ""}`}
                          placeholder="6 digits"
                          maxLength={6}
                          value={item.sac_code}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            handleItemChange(index, "sac_code", val);
                          }}
                        />
                        {getItemError(index, "sac_code") && (
                          <div className="invalid-feedback">{getItemError(index, "sac_code")}</div>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          className={`form-control form-control-sm ${getItemError(index, "quantity") ? "is-invalid" : ""}`}
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        />
                        {getItemError(index, "quantity") && (
                          <div className="invalid-feedback">{getItemError(index, "quantity")}</div>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          className={`form-control form-control-sm ${getItemError(index, "unit_price") ? "is-invalid" : ""}`}
                          min="1"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                        />
                        {getItemError(index, "unit_price") && (
                          <div className="invalid-feedback">{getItemError(index, "unit_price")}</div>
                        )}
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
                          onClick={() => deleteItem(index)}
                          disabled={items.length === 1}
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn btn-outline-secondary btn-sm mb-4" onClick={addItem}>
               <FiPlus style={{ marginRight: "6px" }} />Add Row
            </button>

            {/* Totals */}
            <div className="row justify-content-end mb-3">
              <div className="col-12 col-md-5 col-lg-4">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td className="text-end">{fmt(subtotal)}</td>
                    </tr>
                    {isMaharashtra ? (
                      <>
                        <tr><td>CGST (9%)</td><td className="text-end">{fmt(cgst_amount)}</td></tr>
                        <tr><td>SGST (9%)</td><td className="text-end">{fmt(sgst_amount)}</td></tr>
                      </>
                    ) : (
                      <tr><td>IGST (18%)</td><td className="text-end">{fmt(igst_amount)}</td></tr>
                    )}
                    <tr className="fw-bold table-dark">
                      <td>Total Payable</td>
                      <td className="text-end">{fmt(total_amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              className="btn btn-success w-100 w-md-auto px-4 py-2"
              onClick={handleSave}
              disabled={loading}
            > 
            {loading ? "" : <FiSave />}
              {loading ? "Saving..." : "Save Invoice"}
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* LIST TAB                                     */}
        {/* ════════════════════════════════════════════ */}
        {activeTab === "list" && (
          <div>
            <h5 className="mb-3">All Invoices</h5>
            {invoices.length === 0 ? (
              <p className="text-muted">No invoices found.</p>
            ) : (
              invoices.map(inv => (
                <div key={inv.invoice_id} className="card mb-3 shadow-sm">
                  <div className="card-header">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div>
                        <strong>{inv.invoice_number || `INV-#${inv.invoice_id}`}</strong>
                        <span className={`badge bg-${statusColor(inv.status)} ms-2`}>{inv.status}</span>
                      </div>
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        <span className="text-muted small">
                          {new Date(inv.created_at).toLocaleDateString("en-IN")}
                        </span>
                        <button className="btn btn-outline-primary btn-sm"
                          onClick={() => previewInvoicePDF(inv.invoice_id)}>
                          <FiEye /> Preview
                        </button>
                        <button className="btn btn-success btn-sm"
                          onClick={() => downloadInvoicePDF(inv.invoice_id, inv.invoice_number)}>
                          <FiDownload /> Download
                        </button>
{/* 
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
                          <FiMail/> Email
                        </button> */}

                        <button className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(inv.invoice_id)}>
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row g-2 mb-3">
                      <div className="col-12 col-sm-4">
                        <span className="text-muted small">Customer</span>
                        <div className="fw-semibold">{inv.customer_name}</div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <span className="text-muted small">State</span>
                        <div className="fw-semibold">{inv.state}</div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <span className="text-muted small">Tax Type</span>
                        <div><span className="badge bg-info text-dark">{inv.tax_type}</span></div>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>#</th><th>Description</th><th>SAC</th>
                            <th>Qty</th><th>Unit Price</th><th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((item, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{item.description}</td>
                              <td>{item.sac_code || "-"}</td>
                              <td>{item.quantity}</td>
                              <td>{fmt(item.unit_price)}</td>
                              <td>{fmt(item.line_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="row justify-content-end">
                      <div className="col-12 col-sm-6 col-md-4">
                        <table className="table table-sm">
                          <tbody>
                            <tr><td>Subtotal</td><td className="text-end">{fmt(inv.subtotal)}</td></tr>
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
                    <div className="d-flex flex-wrap gap-2 mt-2 align-items-center">
                      <span className="text-muted small">Update Status:</span>
                      {["draft","sent","paid","overdue"].map(s => (
                        <button
                          key={s}
                          className={`btn btn-sm btn-outline-${statusColor(s)}`}
                          disabled={inv.status === s}
                          onClick={async () => {
                            await updateInvoiceStatusAPI(inv.invoice_id, s);
                            await loadInvoices();
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>


    </div>
  );
}

export default Invoice;