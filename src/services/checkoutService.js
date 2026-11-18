import apiClient from "./apiClient";

export default {
  async getOptions(signal) {
    const { data } = await apiClient.get("/setting/form/order", { signal });
    if (data.error || !Array.isArray(data.data?.deliveries))
      throw new Error(data.message || "Unable to load checkout options.");
    return data.data;
  },
  async submit(payload) {
    const { data } = await apiClient.post("/checkout", payload);
    if (data.error || data.error !== false)
      throw new Error(data.message || "The order could not be confirmed.");
    return data;
  },

  async resumePayment(orderId, signal) {
    const { data } = await apiClient.post(`/orders/${orderId}/payment/resume`, {}, { signal });
    if (data.error || !data.data?.payment)
      throw new Error(data.message || "Unable to resume payment.");
    return data.data;
  },

  async checkPayment(orderId, signal) {
    const { data } = await apiClient.post(
      `/orders/${orderId}/payment/check`, {}, { signal },
    );

    if (data.error) {
      throw new Error(data.message || "Unable to check payment status.");
    }

    return data;
  },
};
