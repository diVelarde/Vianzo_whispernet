export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://vianzotech.onrender.com/api/v1";

export function getJsonHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}