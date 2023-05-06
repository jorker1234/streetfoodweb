import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAppContext } from "./AppProvider";
import { get as getOrderAsync } from "../apis/order";

const CartContext = createContext({});

const initialCart = {
  isLoaded: false,
  shop: null,
  order: null,
};

const CartProvider = ({ children }) => {
  const { shopId, orderId } = useAppContext();
  useEffect(() => {
    if (!!shopId && !!orderId) {
      validateAsync(shopId, orderId);
    }
  }, []);
  const [cart, setCart] = useState(initialCart);
  const validateAsync = async (shopId, orderId) => {
    try {
      const result = await getOrderAsync({ shopId, orderId });
      const { shop, order } = result;
      setCart({
        ...cart,
        shop,
        order,
        isLoaded: true,
      });
      return result;
    } catch (error) {
      setCart({
        ...cart,
        isLoaded: true,
      });
      return error;
    }
  };

  // const updateCartOrder = (order) => {
  //   setCart({
  //     ...cart,
  //     order: { ...order },
  //   });
  // };
  const value = { cart, validateAsync };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCartContext = () => useContext(CartContext);

export default CartProvider;
