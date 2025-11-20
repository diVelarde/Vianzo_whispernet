export const UserProfile = {
  // Fetch profiles with optional filter
  async filter(query = {}) {
    const params = new URLSearchParams();
    if (query) params.append("filter", JSON.stringify(query));

    const res = await fetch(`/api/v1/users/profiles?${params.toString()}`);
    return res.ok ? await res.json() : [];
  },

  // Fetch the current user's profile
  async me() {
    const res = await fetch(`/api/v1/users/me`);
    return res.ok ? await res.json() : null;
  },

  // Update profile fields (like display_name)
  async update(userId, data) {
    const res = await fetch(`/api/v1/users/profiles/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  },
};
