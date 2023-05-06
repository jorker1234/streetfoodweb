import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "./AppProvider";
import { useCartContext } from "./CartProvider";
import { OrderStatus } from "../apis/order";

const ProtectRouter = ({ children }) => {
  const location = useLocation();
  const { shopId, orderId, path, getAppUrl } = useAppContext();
  const {
    cart: { isLoaded, shop, order },
  } = useCartContext();
  if (!shopId || !orderId) {
    return <Navigate to="/notfound" replace state={{ form: location }} />;
  }
  if (!isLoaded) {
    return <React.Fragment>Loading</React.Fragment>;
  }
  if (!shop || !order) {
    return <Navigate to="/notfound" replace state={{ form: location }} />;
  }

  const permisionByUrlDict = {
    "/menu": [OrderStatus.INITIALIZE],
    "/basket": [OrderStatus.INITIALIZE],
    "/payment": [OrderStatus.PAYMENT_REQUEST],
    "/order": [
      OrderStatus.PAYMENT_COMMIT,
      OrderStatus.QUEUE,
      OrderStatus.COMPLETE,
    ],
  };

  const permisionByStatusDict = {};
  permisionByStatusDict[OrderStatus.INITIALIZE] = "/menu";
  permisionByStatusDict[OrderStatus.PAYMENT_REQUEST] = "/payment";
  permisionByStatusDict[OrderStatus.PAYMENT_COMMIT] = "/order";
  permisionByStatusDict[OrderStatus.QUEUE] = "/order";
  permisionByStatusDict[OrderStatus.COMPLETE] = "/order";

  const permissionStatus = permisionByUrlDict[path];
  if (permissionStatus.indexOf(order.status) === -1) {
    const path = getAppUrl(permisionByStatusDict[order.status]);
    return <Navigate to={path} replace state={{ form: location }} />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

ProtectRouter.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectRouter;
