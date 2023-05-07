import React, { useState, useEffect } from "react";
import {
  Button,
  Stack,
  Offcanvas,
  Placeholder,
} from "react-bootstrap";
import qrcode from "qrcode";
import { ArrowLeftShort } from "react-bootstrap-icons";
import { useAppContext } from "../components/AppProvider";
import { useCartContext } from "../components/CartProvider";
import { get as getBill, update as updateBill, BillStatus } from "../apis/bill";
import { ApiStatus } from "../constants/app";

const PaymentPage = () => {
  const { shopId, orderId, navigateApp } = useAppContext();
  const {
    validateAsync,
    cart: { isLoaded },
  } = useCartContext();
  const [state, setState] = useState({
    status: ApiStatus.PENDING,
    actionStatus: ApiStatus.COMPLETE,
    bill: null,
    confirmMessage: null,
    confirmType: null,
    qrcode: null,
  });
  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);
  const fetchData = async () => {
    const params = {
      shopId,
      orderId,
    };
    const { bills = [] } = await getBill(params);
    const bill = bills[0];
    if (bill?.promptpay) {
      const options = {
        type: "svg",
        color: { dark: "#003b6a", light: "#f7f8f7" },
      };
      qrcode.toString(bill?.promptpay, options, (err, qrcode) => {
        if (!err) {
          setState({
            ...state,
            status: ApiStatus.COMPLETE,
            bill,
            qrcode,
          });
        }
      });
    }
  };
  const handleClose = () => {
    if (
      state.status !== ApiStatus.COMPLETE ||
      state.actionStatus !== ApiStatus.COMPLETE
    ) {
      return;
    }
    setState({
      ...state,
      confirmMessage: null,
    });
  };
  const handleCancel = () => {
    handleConfirmPopup("คุณแน่ใจที่จะทำการยกเลิกรายการ?", "CANCEL");
  };
  const handleConfirm = async () => {
    if (state.confirmType !== "CANCEL" && state.confirmType !== "PAYMENT") {
      handleClose();
      return;
    }
    setState({
      ...state,
      actionStatus: ApiStatus.PENDING,
    });
    const status =
      state.confirmType === "PAYMENT" ? BillStatus.PAYMENT : BillStatus.CANCEL;
    const response = await updateBill({
      shopId,
      orderId,
      billId: state.bill?.id,
      status,
    });
    const isActived = response.bills[0].isActived;
    await validateAsync(shopId, orderId);
    if (!isActived) {
      navigateApp("/basket");
    }
  };
  const handleConfirmPopup = (confirmMessage, confirmType) => {
    if (
      state.status !== ApiStatus.COMPLETE ||
      state.actionStatus !== ApiStatus.COMPLETE
    ) {
      return;
    }
    setState({
      ...state,
      confirmMessage,
      confirmType,
    });
  };
  return (
    <React.Fragment>
      {state.status === ApiStatus.PENDING && (
        <React.Fragment>
          <Stack className="p-2" gap={3}>
            <Stack direction="horizontal" gap={3}>
              <ArrowLeftShort size={36} />
              <Placeholder
                as="div"
                animation="glow"
                className="fw-bold fs-5 text-black"
                xs={6}
              >
                <Placeholder xs={12} />
              </Placeholder>
            </Stack>
          </Stack>
          <Stack>
            <div
              className="bg-dark bg-opacity-50 p-0"
              style={{ width: "280px", height: "280px", margin: "40px auto" }}
            ></div>
          </Stack>
        </React.Fragment>
      )}
      {state.status === ApiStatus.COMPLETE && (
        <React.Fragment>
          <Stack className="p-2" gap={3}>
            <Stack direction="horizontal" gap={3}>
              <ArrowLeftShort size={36} onClick={handleCancel} />
              {state.bill && (
                <div className="fw-bold fs-5">{state.bill.shopName}</div>
              )}
            </Stack>
            <Stack>
              {state.qrcode && (
                <div dangerouslySetInnerHTML={{ __html: state.qrcode }}></div>
              )}
            </Stack>
          </Stack>
          <Stack
            className="position-fixed bottom-0 start-0 end-0 p-2 bg-white"
            gap={2}
          >
            <Button
              size="lg"
              onClick={() => {
                handleConfirmPopup("คุณทำการชำระเงินเรียบร้อยแล้ว?", "PAYMENT");
              }}
            >
              ยืนยันการชำระเงิน
            </Button>
            <Button variant="danger" onClick={handleCancel} size="lg">
              ยกเลิกรายการ
            </Button>
          </Stack>
        </React.Fragment>
      )}
      <Offcanvas
        show={!!state.confirmMessage}
        onHide={handleClose}
        placement="bottom"
      >
        <Offcanvas.Header closeButton size="lg">
          <Offcanvas.Title>{state.confirmMessage}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Stack gap={2}>
            {state.actionStatus === ApiStatus.PENDING && (
              <React.Fragment>
                <Button size="lg" disabled>
                  <Placeholder animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                </Button>
                <Button variant="danger" size="lg" disabled>
                  ยกเลิก
                </Button>
              </React.Fragment>
            )}
            {state.actionStatus === ApiStatus.COMPLETE && (
              <React.Fragment>
                <Button onClick={handleConfirm} size="lg">
                  ยืนยัน
                </Button>
                <Button variant="danger" onClick={handleClose} size="lg">
                  ยกเลิก
                </Button>
              </React.Fragment>
            )}
          </Stack>
        </Offcanvas.Body>
      </Offcanvas>
    </React.Fragment>
  );
};

export default PaymentPage;
