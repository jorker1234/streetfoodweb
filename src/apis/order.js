import _ from "lodash";
import axios from "axios";

const orderApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/orders`,
  withCredentials: true,
});

const serialize = ({shops = [], menus = [], orders = []}) => {
  const items = orders[0]?.items ?? [];
  const menuOrders = menus.map((menu) => {
    const item = _.find(items, (o) => o.menuId === menu.id);
    const quantity = item?.quantity ?? 0;
    const itemId = item?.id;
    const note = item?.note;
    const amount = item?.amount;
    return {
      ...menu,
      quantity,
      itemId,
      note,
      amount,
    };
  });

  return {
    shop: shops[0],
    order: orders[0],
    menuOrders,
  };
};

export const get = async ({ shopId, orderId }) => {
  const result = await orderApi.get(`/${orderId}`, {
    params: {
      shopId,
    },
  });
  return serialize(result.data);
};

export const update = async ({ shopId, orderId, menuId, quantity, note }) => {
  const result = await orderApi.put(`/${orderId}`, {
    shopId,
    menuId,
    quantity,
    note,
  });
  return serialize(result.data);
};

export const OrderStatus = {
  INITIALIZE: "initialize",
  PAYMENT_REQUEST: "paymentRequest",
  PAYMENT_COMMIT: "paymentCommit",
  QUEUE: "queue",
  COMPLETE: "complete",
};
