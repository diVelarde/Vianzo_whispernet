export const Message = {
  // Fetch messages with optional filter, sort, limit
  async filter(query = {}, sort = "-created_date", limit = 50) {
    const params = new URLSearchParams();
    if (query) params.append("filter", JSON.stringify(query));
    if (sort) params.append("sort", sort);
    if (limit) params.append("limit", limit);

    const res = await fetch(`/api/v1/posts?${params.toString()}`);
    return res.ok ? await res.json() : [];
  },

  // Update message fields (like likes_count, reported_count)
  async update(messageId, data) {
    const res = await fetch(`/api/v1/posts/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  },

  // Optional: create a new message (for Compose page)
  async create(data) {
    const res = await fetch(`/api/v1/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  },
};
