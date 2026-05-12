// ── Indian States list ─────────────────────────────────
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry"
];

// ── GST Number validation ──────────────────────────────
// Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 digit + Z + 1 alphanumeric
// Example: 27ABCDE1234F1Z5
export const validateGSTNumber = (gst) => {
  if (!gst) return true; // optional field
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gst.toUpperCase());
};

// ── Customer name validation ───────────────────────────
// Only letters, spaces, dots, hyphens — no numbers
export const validateCustomerName = (name) => {
  if (!name || !name.trim()) return "Customer name is required";
  if (name.trim().length < 2) return "Customer name must be at least 2 characters";
  const regex = /^[a-zA-Z\s.\-']+$/;
  if (!regex.test(name.trim())) return "Customer name can only contain letters";
  return null;
};

// ── Validate full invoice form ─────────────────────────
export const validateInvoiceForm = ({ customer_name, state, items }) => {
  const errors = {};

  // Customer name
  const nameError = validateCustomerName(customer_name);
  if (nameError) errors.customer_name = nameError;

  // State
  if (!state || !state.trim()) {
    errors.state = "Please select a state";
  }

  // Items
  const itemErrors = items.map((item, i) => {
    const err = {};
    if (!item.description || !item.description.trim()) {
      err.description = "Description is required";
    }
    if (!item.quantity || Number(item.quantity) < 1) {
      err.quantity = "Quantity must be at least 1";
    }
    if (Number(item.quantity) !== Math.floor(Number(item.quantity))) {
      err.quantity = "Quantity must be a whole number";
    }
    if (!item.unit_price || Number(item.unit_price) < 1) {
      err.unit_price = "Price must be at least ₹1";
    }
    if (item.sac_code && !/^\d{6}$/.test(item.sac_code)) {
      err.sac_code = "SAC code must be 6 digits";
    }
    return err;
  });

  if (itemErrors.some(e => Object.keys(e).length > 0)) {
    errors.items = itemErrors;
  }

  return errors;
};