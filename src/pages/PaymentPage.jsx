import React, { useState, useEffect } from "react";
import { Button, Stack, Offcanvas } from "react-bootstrap";
import qrcode from "qrcode";
import { ArrowLeftShort } from "react-bootstrap-icons";
import { useAppContext } from "../components/AppProvider";
import { useCartContext } from "../components/CartProvider";
import { get as getBill, update as updateBill, BillStatus } from "../apis/bill";
const PaymentPage = () => {
  const { shopId, orderId, navigateApp } = useAppContext();
  const { validateAsync } = useCartContext();
  const [state, setState] = useState({
    bill: null,
    confirmMessage: null,
    confirmType: null,
    qrcode: null,
  });
  useEffect(() => {
    fetchData();
  }, []);
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
            bill,
            qrcode,
          });
        }
      });
    }
  };
  const handleClose = () =>
    setState({
      ...state,
      confirmMessage: null,
    });
  const handleCancel = () => {
    handleConfirmPopup("คุณแน่ใจที่จะทำการยกเลิกรายการ?", "CANCEL");
  };
  const handleConfirm = async () => {
    if (state.confirmType !== "CANCEL" && state.confirmType !== "PAYMENT") {
      handleClose();
      return;
    }
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
    // console.log(response.bills[0]);
    // const isActived = response.bills[0].isActived;
    // const billStatus = response.bills[0].status;
    // if(!isActived) {
    //   navigateApp("/basket");
    //   return;
    // }
    // if(billStatus !== BillStatus.INITIALIZE) {
    //   navigateApp("/order");
    //   return;
    // }
    // handleClose();
  };
  const handleConfirmPopup = (confirmMessage, confirmType) => {
    setState({
      ...state,
      confirmMessage,
      confirmType,
    });
  };
  return (
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
            handleConfirmPopup(
              "คุณทำการชำระเงินผ่าน QR CODE เรียบร้อยแล้ว?",
              "PAYMENT"
            );
          }}
        >
          ยืนยันการชำระเงิน
        </Button>
        <Button variant="danger" onClick={handleCancel} size="lg">
          ยกเลิกรายการ
        </Button>
      </Stack>

      <Offcanvas
        show={!!state.confirmMessage}
        onHide={handleClose}
        placement="bottom"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{state.confirmMessage}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Stack gap={2}>
            <Button onClick={handleConfirm} size="lg">ยืนยัน</Button>
            <Button variant="danger" onClick={handleClose} size="lg">
              ยกเลิก
            </Button>
          </Stack>
        </Offcanvas.Body>
      </Offcanvas>
    </React.Fragment>
  );
};

export default PaymentPage;
