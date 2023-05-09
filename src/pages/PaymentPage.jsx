import React, { useState, useEffect, useCallback } from "react";
import { Button, Stack, Placeholder } from "react-bootstrap";
import qrcode from "qrcode";
import { ArrowLeftShort } from "react-bootstrap-icons";
import useAppUrl from "../hooks/useAppUrl";
import { useCartContext } from "../context/CartProvider";
import { get as getBill, update as updateBill, BillStatus } from "../apis/bill";
import { ApiStatus } from "../constants/app";
import { useDialog } from "../context/DialogProvider";

const PaymentPage = () => {
  const { shopId, orderId, navigateApp } = useAppUrl();
  const { reloadCartAsync, status: cartStatus } = useCartContext();
  const { alert, confirm } = useDialog();

  const [status, setStatus] = useState(ApiStatus.PENDING);
  const [actionStatus, setActionStatus] = useState(ApiStatus.COMPLETE);
  const [bill, setBill] = useState(null);
  const [promptpay, setPromptpay] = useState(null);

  const fetchData = useCallback(async () => {
    if (cartStatus !== ApiStatus.COMPLETE) {
      return;
    }
    const params = {
      shopId,
      orderId,
    };
    try {
      const { bills = [] } = await getBill(params);
      const bill = bills[0];
      if (bill?.promptpay) {
        const options = {
          type: "svg",
          color: { dark: "#003b6a", light: "#f7f8f7" },
        };
        qrcode.toString(bill?.promptpay, options, async (err, promptpay) => {
          if (err) {
            await alert("มีบางอย่างพิดพลาด กรุณาโหลดหน้าใหม่อีกครั้ง");
            return;
          }
          setBill(bill);
          setPromptpay(promptpay);
          setStatus(ApiStatus.COMPLETE);
        });
      }
    } catch (error) {
      await alert("มีบางอย่างพิดพลาด กรุณาติดต่อพนักงาน");
      navigateApp("/notfound");
    }
  }, [alert, cartStatus, navigateApp, orderId, shopId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancel = async () => {
    if (actionStatus !== ApiStatus.COMPLETE) {
      return;
    }
    const isConfirm = await confirm("คุณแน่ใจที่จะทำการยกเลิกรายการ?");
    if (isConfirm) {
      await handleUpdatBillStatus(BillStatus.CANCEL);
    }
  };

  const handleAccpet = async () => {
    if (actionStatus !== ApiStatus.COMPLETE) {
      return;
    }
    const isConfirm = await confirm("คุณทำการชำระเงินเรียบร้อยแล้ว?");
    if (isConfirm) {
      await handleUpdatBillStatus(BillStatus.PAYMENT);
    }
  };
  const handleUpdatBillStatus = async (status) => {
    setActionStatus(ApiStatus.PENDING);
    try {
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
    } catch (error) {
      await alert("มีบางอย่างพิดพลาด กรุณาลองใหม่อีกครั้ง");
      setActionStatus(ApiStatus.COMPLETE);
    }
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
            {actionStatus === ApiStatus.PENDING && (
              <React.Fragment>
                <Button size="lg" disabled>
                  <Placeholder animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                </Button>
                <Button variant="danger" disabled>
                  <Placeholder animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                </Button>
              </React.Fragment>
            )}
            {actionStatus === ApiStatus.COMPLETE && (
              <React.Fragment>
                <Button size="lg" onClick={handleAccpet}>
                  ยืนยันการชำระเงิน
                </Button>
                <Button variant="danger" onClick={handleCancel} size="lg">
                  ยกเลิกรายการ
                </Button>
              </React.Fragment>
            )}
          </Stack>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default PaymentPage;
