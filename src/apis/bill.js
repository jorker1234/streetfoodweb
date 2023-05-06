import _ from "lodash";
import axios from "axios";

const billApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/bills`,
  withCredentials: true,
});

export const get = async ({ shopId, orderId }) => {
  const result = await billApi.get(`/`, {
    params: {
      shopId,
      orderId,
    },
  });
  return result.data;
};

export const create = async ({ shopId, orderId, customer }) => {
  const result = await billApi.post(`/`, {
    shopId,
    orderId,
    customer,
  });
  return result.data;
};

export const update = async ({ shopId, orderId, billId, status }) => {
  const result = await billApi.put(`/${billId}`, {
    shopId,
    orderId,
    status,
  });
  return result.data;
};

export const BillStatus = {
  INITIALIZE: "initialize",
  PAYMENT: "payment",
  QUEUE: "queue",
  COMPLETE: "complete",
  REJECT: "reject",
  CANCEL: "cancel",
}; 
