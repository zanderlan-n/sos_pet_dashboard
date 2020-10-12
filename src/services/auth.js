export default {
  set: async (token) => {
    try {
      await localStorage.setItem('token', token);
      return true;
    } catch {
      return false;
    }
  },

  get: () => localStorage.getItem('token'),

  clear: async () => {
    await localStorage.removeItem('token');
  },
};
