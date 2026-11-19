import { decodeInvoiceDocument } from "./invoiceDownload.js";
import apiClient from "./apiClient";
export default {
  async get(orderId, signal) {
    const { data } = await apiClient.get(`/orders/${orderId}/invoice`, { signal });
    if (data.error || !data.data) throw new Error(data.message || "Invoice unavailable.");
    return data.data;
  },
  async pdf(orderId, signal) {
    const { data } = await apiClient.get(`/orders/${orderId}/invoice/document`, { signal });
    return decodeInvoiceDocument(data);
  },
};
