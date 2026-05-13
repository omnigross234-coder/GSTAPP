const BASE_URL = "https://backend-msas.onrender.com/api"; // Update with your backend URL

export const fetchCustomersAPI = async () => {
  const res = await fetch(`${BASE_URL}/customers`);
  return res.json();
};

export const fetchCustomerByIdAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`);
  return res.json();
};

export const addCustomerAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/customers`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

export const updateCustomerAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

export const deleteCustomerAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/customers/${id}`, {
    method: "DELETE"
  });
  return res.json();
};