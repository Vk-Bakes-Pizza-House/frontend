import api from "../services/api";

export const apiRequest = async (method, url, payload = null, config = {}) => {
  const res = await api({ method, url, data: payload, ...config });
  return res.data;
};