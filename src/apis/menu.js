import _ from "lodash";
import axios from "axios";

const menuApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/menus`,
  withCredentials: true,
});

export const query = async ({ shopId, orderId }) => {
  const result = await menuApi.get("/", {
    params: {
      shopId,
      orderId,
    },
  });
  const { shops, menus, orders = [] } = result.data;
  const items = orders[0]?.items ?? [];
  const menuOrders = menus.map((menu) => {
    const item = _.find(items, (o) => o.menuId === menu.id);
    const quantity = item?.quantity ?? 0;
    const itemId = item?.id;
    const note = item?.note;
    return {
      ...menu,
      quantity,
      itemId,
      note,
    };
  });

  return {
    shop: shops[0],
    order: orders[0],
    menuOrders,
  };
};
