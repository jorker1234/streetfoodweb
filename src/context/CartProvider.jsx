import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import useAppUrl from "../hooks/useAppUrl";
import { get as getOrderAsync } from "../apis/order";
import { ApiStatus } from "../constants/app";

const CartContext = createContext({});

const CartProvider = ({ children }) => {
  const { shopId, orderId } = useAppUrl();
  const [status, setStatuse] = useState(ApiStatus.PENDING);
  const [shop, setShop] = useState(null);
  const [order, setOrder] = useState(null);
  const reloadCartAsync = useCallback(async (shopId, orderId) => {
    try {
      const result = await getOrderAsync({ shopId, orderId });
      const { shop, order } = result;
      setShop(shop);
      setOrder(order);
      setStatuse(ApiStatus.COMPLETE);
    } catch (error) {
      setStatuse(ApiStatus.ERROR);
    }
  }, []);

  useEffect(() => {
    if (!!shopId && !!orderId) {
      reloadCartAsync(shopId, orderId);
    }
  }, [shopId, orderId, reloadCartAsync]);

  const value = { status, shop, order, reloadCartAsync };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCartContext = () => useContext(CartContext);

export default CartProvider;
