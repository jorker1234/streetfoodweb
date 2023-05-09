import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useCartContext } from "../context/CartProvider";
import { OrderStatus } from "../apis/order";
import useAppUrl from "../hooks/useAppUrl";
import { ApiStatus } from "../constants/app";

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

const ProtectRouter = ({ children }) => {
  const location = useLocation();
  const { shopId, orderId, path, getAppUrl } = useAppUrl();
  const {
    status,
    shop,
    order,
  } = useCartContext();
  const permissionStatus = permisionByUrlDict[path];
  if (!shopId || !orderId || !permissionStatus) {
    return <Navigate to="/notfound" replace state={{ form: location }} />;
  }
  if (status !== ApiStatus.COMPLETE) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  if (!shop || !order) {
    return <Navigate to="/notfound" replace state={{ form: location }} />;
  }

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
