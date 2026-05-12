const BASE_URL = "http://localhost:5000/api";

export const fetchServicesAPI = async (all = false) => {
  const res = await fetch(`${BASE_URL}/services${all ? "?all=true" : ""}`);
  return res.json();
};

export const addServiceAPI = async (data) => {
  const res = await fetch(`${BASE_URL}/services`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

export const updateServiceAPI = async (id, data) => {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data)
  });
  return res.json();
};

export const deleteServiceAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: "DELETE"
  });
  return res.json();
};