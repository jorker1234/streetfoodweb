import React, { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { useCartContext } from "../context/CartProvider";
import { OrderStatus } from "../apis/order";
import useAppUrl from "../hooks/useAppUrl";
import { ApiStatus } from "../constants/app";
import { useDialog } from "../context/DialogProvider";

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
  const { alert } = useDialog();
  const { shopId, orderId, path, getAppUrl, navigateApp } = useAppUrl();
  const { status, shop, order } = useCartContext();
  const alertDataIsNotExits = useCallback(async () => {
    if (status === ApiStatus.PENDING) {
      return;
    }
    if (status === ApiStatus.ERROR || !shop || !order) {
      await alert("ไม่พบร้านค้า หรือ หมายเลขคิว กรุณาติดต่อพนักงาน");
      navigateApp("/notfound");
    }
  }, [status, shop, order, alert, navigateApp]);

  useEffect(() => {
    alertDataIsNotExits();
  }, [alertDataIsNotExits]);

  const permissionStatus = permisionByUrlDict[path];
  if (!shopId || !orderId || !permissionStatus) {
    return <Navigate to="/notfound" replace state={{ form: location }} />;
  }
  if (status === ApiStatus.PENDING) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  if (status === ApiStatus.ERROR || !shop || !order) {
    return <React.Fragment>{children}</React.Fragment>;
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
