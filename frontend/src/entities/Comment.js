export const Comment = {
  // Fetch comments for a message
  async getAll(messageId) {
    const res = await fetch(`/api/v1/posts/${messageId}/comments`);
    return res.ok ? await res.json() : [];
  },

  // Add a new comment
  async add(messageId, data) {
    const res = await fetch(`/api/v1/posts/${messageId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  },

  // Delete a comment
  async delete(messageId, commentId) {
    const res = await fetch(`/api/v1/posts/${messageId}/comments/${commentId}`, {
      method: "DELETE",
    });
    return res.ok ? await res.json() : null;
  },

  // Optional: Update a comment (likes or content)
  async update(messageId, commentId, data) {
    const res = await fetch(`/api/v1/posts/${messageId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok ? await res.json() : null;
  }
};
