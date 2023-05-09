import React, { useState, useEffect } from "react";
import { Button, Stack, Offcanvas, Placeholder } from "react-bootstrap";
import qrcode from "qrcode";
import { ArrowLeftShort } from "react-bootstrap-icons";
import useAppUrl from "../hooks/useAppUrl";
import { useCartContext } from "../context/CartProvider";
import { get as getBill, update as updateBill, BillStatus } from "../apis/bill";
import { ApiStatus } from "../constants/app";

const PaymentPage = () => {
  const { shopId, orderId, navigateApp } = useAppUrl();
  const { reloadCartAsync, status: cartStatus } = useCartContext();

  const [status, setStatus] = useState(ApiStatus.PENDING);
  const [actionStatus, setActionStatus] = useState(ApiStatus.COMPLETE);
  const [bill, setBill] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState(null);
  const [confirmType, setConfirmType] = useState(null);
  const [promptpay, setPromptpay] = useState(null);

  useEffect(() => {
    if (cartStatus === ApiStatus.COMPLETE) {
      fetchData(shopId, orderId);
    }
  }, [cartStatus, shopId, orderId]);
  const fetchData = async (shopId, orderId) => {
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
      qrcode.toString(bill?.promptpay, options, (err, promptpay) => {
        if (!err) {
          setBill(bill);
          setPromptpay(promptpay);
          setStatus(ApiStatus.COMPLETE);
        }
      });
    }
  };
  const handleClose = () => {
    if (status !== ApiStatus.COMPLETE || actionStatus !== ApiStatus.COMPLETE) {
      return;
    }
    setConfirmMessage(null);
  };
  const handleCancel = () => {
    handleConfirmPopup("คุณแน่ใจที่จะทำการยกเลิกรายการ?", "CANCEL");
  };
  const handleConfirm = async () => {
    if (confirmType !== "CANCEL" && confirmType !== "PAYMENT") {
      handleClose();
      return;
    }
    setActionStatus(ApiStatus.PENDING);
    const status =
      confirmType === "PAYMENT" ? BillStatus.PAYMENT : BillStatus.CANCEL;
    const response = await updateBill({
      shopId,
      orderId,
      billId: bill?.id,
      status,
    });
    const isActived = response.bills[0].isActived;
    await reloadCartAsync(shopId, orderId);
    if (!isActived) {
      navigateApp("/basket");
    }
  };
  const handleConfirmPopup = (confirmMessage, confirmType) => {
    if (status !== ApiStatus.COMPLETE || actionStatus !== ApiStatus.COMPLETE) {
      return;
    }
    setConfirmMessage(confirmMessage);
    setConfirmType(confirmType);
  };
  return (
    <React.Fragment>
      {status === ApiStatus.PENDING && (
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
      {status === ApiStatus.COMPLETE && (
        <React.Fragment>
          <Stack className="p-2" gap={3}>
            <Stack direction="horizontal" gap={3}>
              <ArrowLeftShort size={36} onClick={handleCancel} />
              {bill && <div className="fw-bold fs-5">{bill.shopName}</div>}
            </Stack>
            <Stack>
              {promptpay && (
                <div dangerouslySetInnerHTML={{ __html: promptpay }}></div>
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
        show={!!confirmMessage}
        onHide={handleClose}
        placement="bottom"
      >
        <Offcanvas.Header closeButton size="lg">
          <Offcanvas.Title>{confirmMessage}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Stack gap={2}>
            {actionStatus === ApiStatus.PENDING && (
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
            {actionStatus === ApiStatus.COMPLETE && (
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
