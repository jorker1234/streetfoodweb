import React, { useState, useEffect } from "react";
import { Stack, Card, Placeholder } from "react-bootstrap";
import { useAppContext } from "../components/AppProvider";
import { useCartContext } from "../components/CartProvider";
import { get as getBill, BillStatus } from "../apis/bill";
import { ApiStatus } from "../constants/app";
const OrderPage = () => {
  const { shopId, orderId } = useAppContext();
  const {
    cart: { isLoaded },
  } = useCartContext();
  const [state, setState] = useState({
    status: ApiStatus.PENDING,
    bill: null,
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
    setState({
      ...state,
      status: ApiStatus.COMPLETE,
      bill: bills[0],
    });
  };
  const billStatus = state.bill?.status;
  const totalAmount = state.bill?.amount ?? 0;
  let progressBarWidth = 0;
  let classStatusPayment = "btn-secondary";
  let classStatusQueue = "btn-secondary";
  let classStatusComplete = "btn-secondary";
  if (state.status === ApiStatus.COMPLETE) {
    classStatusPayment = "btn-primary";
    if (billStatus === BillStatus.QUEUE) {
      progressBarWidth = 50;
      classStatusQueue = "btn-primary";
    } else if (billStatus === BillStatus.COMPLETE) {
      progressBarWidth = 100;
      classStatusQueue = "btn-primary";
      classStatusComplete = "btn-primary";
    }
  }
  return (
    <React.Fragment>
      <Stack className="p-2">
        <Stack direction="horizontal" gap={3}>
          {state.status === ApiStatus.PENDING && (
            <Placeholder
              as="div"
              animation="glow"
              className="fw-bold fs-5 mx-auto"
              xs={6}
            >
              <Placeholder xs={12} />
            </Placeholder>
          )}
          {state.status === ApiStatus.COMPLETE && state.bill && (
            <div className="fw-bold fs-5 mx-auto">{state.bill.shopName}</div>
          )}
        </Stack>
        <div className="position-relative m-5">
          <div
            className="progress"
            role="progressbar"
            aria-label="Progress"
            aria-valuenow="50"
            aria-valuemin="0"
            aria-valuemax="100"
            style={{ height: "2px" }}
          >
            <div
              className="progress-bar"
              style={{ width: progressBarWidth + "%" }}
            ></div>
          </div>
          <button
            type="button"
            className={
              "position-absolute top-0 start-0 translate-middle btn btn-sm rounded-pill " +
              classStatusPayment
            }
            style={{ width: "3rem", height: "3rem" }}
          >
            1
          </button>
          <button
            type="button"
            className={
              "position-absolute top-0 start-50 translate-middle btn btn-sm rounded-pill " +
              classStatusQueue
            }
            style={{ width: "3rem", height: "3rem" }}
          >
            2
          </button>
          <button
            type="button"
            className={
              "position-absolute top-0 start-100 translate-middle btn btn-sm rounded-pill " +
              classStatusComplete
            }
            style={{ width: "3rem", height: "3rem" }}
          >
            3
          </button>
          <div
            style={{ top: "2rem" }}
            className="position-absolute bottom-0 start-0 translate-middle"
          >
            รอร้านค้ายืนยัน
          </div>
          <div
            style={{ top: "2rem" }}
            className="position-absolute bottom-0 start-50 translate-middle"
          >
            กำลังทำอาหาร
          </div>
          <div
            style={{ top: "2rem" }}
            className="position-absolute bottom-0 start-100 translate-middle"
          >
            สำเร็จ
          </div>
        </div>

        <Stack className="px-2" gap={3}>
          <hr />
          {state.status === ApiStatus.PENDING && (
            <React.Fragment>
              <Stack direction="horizontal">
                <div className="fw-bold fs-5">ชื่อลูกค้า </div>
                <Placeholder
                  as="div"
                  className="fs-5 ms-auto"
                  xs={3}
                  animation="glow"
                >
                  <Placeholder xs={12} />
                </Placeholder>
              </Stack>
              <hr />
              <div className="fw-bold">รายการอาหาร</div>
              {[0, 1, 2].map((o) => (
                <Stack
                  direction="horizontal"
                  gap={3}
                  className="align-items-start"
                  key={o}
                >
                  <Card>
                    <Card.Body className="p-2">
                      <Placeholder as="div" animation="glow" xs={2}>
                        <Placeholder xs={12} className="px-2" />
                      </Placeholder>
                    </Card.Body>
                  </Card>
                  <Stack>
                    <Placeholder as="div" animation="glow">
                      <Placeholder xs={9} />
                    </Placeholder>
                    <Placeholder
                      as="div"
                      animation="glow"
                      className="text-black-50"
                    >
                      <Placeholder xs={4} />
                    </Placeholder>
                  </Stack>
                  <Placeholder
                    as="div"
                    animation="glow"
                    className="ms-auto"
                    xs={2}
                  >
                    <Placeholder xs={12} />
                  </Placeholder>
                </Stack>
              ))}
              <hr />
              <Stack direction="horizontal">
                <div className="fw-bold">ยอดรวม</div>
                <Placeholder
                  as="div"
                  animation="glow"
                  className=" fw-bold ms-auto"
                  xs={2}
                >
                  <Placeholder xs={12} />
                </Placeholder>
              </Stack>
            </React.Fragment>
          )}

          {state.status === ApiStatus.COMPLETE && (
            <React.Fragment>
              {state.bill && state.bill.name && (
                <Stack direction="horizontal">
                  <div className="fw-bold fs-4">คำสั่งซื้อเลขที่</div>
                  <div className="fw-bold ms-auto text-primary fs-4">
                    {state.bill.name}
                  </div>
                </Stack>
              )}
              <Stack direction="horizontal">
                <div className="fw-bold fs-5">ชื่อลูกค้า </div>
                <div className="fs-5 ms-auto">{state.bill?.customer}</div>
              </Stack>
              <hr />
              <div className="fw-bold">รายการอาหาร</div>
              {state.bill &&
                state.bill.items.map((item) => (
                  <Stack
                    direction="horizontal"
                    gap={3}
                    className="align-items-start"
                    key={item.id}
                  >
                    <Card>
                      <Card.Body className="p-2">{item.quantity}x</Card.Body>
                    </Card>
                    <Stack>
                      <div>{item.name}</div>
                      <div className="text-black-50">{item.note}</div>
                    </Stack>
                    <div className="ms-auto">฿{item.amount.toLocaleString('en-US')}</div>
                  </Stack>
                ))}
              <hr />
              <Stack direction="horizontal">
                <div className="fw-bold">ยอดรวม</div>
                <div className="fw-bold ms-auto">฿{totalAmount.toLocaleString('en-US')}</div>
              </Stack>
            </React.Fragment>
          )}
        </Stack>
      </Stack>
    </React.Fragment>
  );
};

export default OrderPage;
