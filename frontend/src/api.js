// src/api.js
export const API_BASE_URL = "https://vianzotech.onrender.com";
export function getJsonHeaders() {
  const token = localStorage.getItem("token");
  return token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };
}