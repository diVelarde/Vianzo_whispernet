export const AppSettings = {
  async get(settingKey) {
    const res = await fetch(`/api/v1/settings/${settingKey}`);
    if (res.ok) return await res.json();
    return null;
  },

  async update(settingKey, settingValue) {
    const res = await fetch(`/api/v1/settings/${settingKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setting_value: settingValue }),
    });
    return res.ok ? await res.json() : null;
  },

  async getAll() {
    const res = await fetch(`/api/v1/settings`);
    return res.ok ? await res.json() : [];
  }
};
