import apiClient from "./apiClient";

const getOverview = async (signal) => {
  const { data } = await apiClient.get("/account/overview", { signal });

  if (data.error || !data.data) {
    throw new Error(data.message || "Unable to load account overview.");
  }

  return data.data;
};

const getOrders = async (signal, params = {}) => {
  const { data } = await apiClient.get("/account/orders", { signal, params });

  if (data.error || !Array.isArray(data.data)) {
    throw new Error(data.message || "Unable to load recent orders.");
  }

  return data;
};

const getOrderFilters = async (signal) => {
  const { data } = await apiClient.get("/setting/filter/order", { signal });

  if (data.error || !Array.isArray(data.data?.order_status)) {
    throw new Error(data.message || "Unable to load order filters.");
  }

  return data.data.order_status;
};
const cancelOrder = async (orderId) => {
  const { data } = await apiClient.patch(
    `/account/orders/${orderId}/cancel`
  );

  if (data.error) {
    throw new Error(data.message || "Unable to cancel order.");
  }

  return data;
};

export default { getOverview, getOrders, getOrderFilters,cancelOrder };
