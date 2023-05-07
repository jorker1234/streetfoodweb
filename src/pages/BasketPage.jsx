import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button, Stack, Modal, Card, Placeholder } from "react-bootstrap";
import MenuDetail from "../components/menu/MenuDetail";
import { ArrowLeftShort } from "react-bootstrap-icons";
import { get as getOrderAsync } from "../apis/order";
import { create as createBillAsync } from "../apis/bill";
import { useAppContext } from "../components/AppProvider";
import { useCartContext } from "../components/CartProvider";
import { ApiStatus } from "../constants/app";

const BasketPage = () => {
  const { shopId, orderId, getAppUrl } = useAppContext();
  const {
    validateAsync,
    cart: { isLoaded },
  } = useCartContext();
  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  const [state, setState] = useState({
    status: ApiStatus.PENDING,
    actionStatus: ApiStatus.COMPLETE,
    show: false,
    shop: null,
    order: null,
    menuSelect: {},
    menuOrders: [],
  });
  const fetchData = async () => {
    const params = {
      shopId,
      orderId,
    };
    const { shop, order, menuOrders = [] } = await getOrderAsync(params);
    setState({
      ...state,
      status: ApiStatus.COMPLETE,
      shop,
      order,
      menuOrders,
    });
  };
  const totalAmount = state.order?.amount ?? 0;

  const handleClose = () => setState({ ...state, show: false });
  const handleEdit = (menuOrder) => {
    if (
      state.status !== ApiStatus.COMPLETE ||
      state.actionStatus !== ApiStatus.COMPLETE
    ) {
      return;
    }
    const { id: menuId, ...params } = menuOrder;
    setState({
      ...state,
      menuSelect: { ...params, menuId, shopId, orderId },
      show: true,
    });
  };
  const handleUpdateBasket = (value, isRemove) => {
    if (!value) {
      setState({
        ...state,
        show: false,
      });
      return;
    }
    const { order, menuOrders: menuOrderUpdated } = value;
    let menuOrders = state.menuOrders.map((o) => {
      const updated = _.find(menuOrderUpdated, (menu) => menu.id === o.id);
      if (!updated) {
        return o;
      }
      return updated;
    });
    if (isRemove) {
      menuOrders = menuOrders.filter((o) => o.id !== state.menuSelect.menuId);
    }
    setState({
      ...state,
      show: false,
      order: { ...order },
      menuOrders: [...menuOrders],
    });
  };
  const handlePayment = async () => {
    setState({
      ...state,
      actionStatus: ApiStatus.PENDING,
    });
    const result = await createBillAsync({
      shopId,
      orderId,
      customer: "คุณอร",
    });
    if (result.bills.length > 0 && result.bills[0].isActived) {
      return await validateAsync(shopId, orderId);
    }
    setState({
      ...state,
      actionStatus: ApiStatus.COMPLETE,
    });
  };

  const renderButtonPayment = () => {
    if (
      state.status === ApiStatus.PENDING ||
      state.actionStatus === ApiStatus.PENDING
    ) {
      return (
        <Button size="lg" disabled>
          <Placeholder animation="glow">
            <Placeholder xs={4} />
          </Placeholder>
        </Button>
      );
    }
    return (
      <Button size="lg" onClick={handlePayment}>
        จ่ายเงิน
      </Button>
    );
  };
  return (
    <React.Fragment>
      <Stack className="p-2" gap={3}>
        {state.status === ApiStatus.PENDING && (
          <React.Fragment>
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
            <Stack direction="horizontal">
              <div className="fw-bold">สรุปรายการ</div>
              <div className="fw-bold text-decoration-none ms-auto text-primary">
                เพิ่มรายการ
              </div>
            </Stack>
            <Stack gap={3} style={{ marginBottom: "100px" }}>
              {[0, 1, 2].map((o) => (
                <Stack
                  direction="horizontal"
                  className="align-items-start"
                  gap={3}
                  key={o}
                >
                  <Card className="mt-2">
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
                    <div className="fw-bold text-primary">แก้ไข</div>
                  </Stack>
                  <Placeholder as="div" animation="glow" xs={2}>
                    <Placeholder xs={12} className="ms-auto" />
                  </Placeholder>
                </Stack>
              ))}
            </Stack>
            <Stack
              className="position-fixed bottom-0 start-0 end-0 p-2 bg-white"
              gap={2}
            >
              <Stack direction="horizontal" gap={3}>
                <div className="fs-5 fw-bold">ยอดรวม</div>
                <Placeholder
                  as="div"
                  animation="glow"
                  xs={2}
                  className="fs-5 fw-bold ms-auto"
                >
                  <Placeholder xs={12} />
                </Placeholder>
              </Stack>
              {renderButtonPayment()}
            </Stack>
          </React.Fragment>
        )}
        {state.status === ApiStatus.COMPLETE && (
          <React.Fragment>
            <Stack direction="horizontal" gap={3}>
              <Link to={getAppUrl("/menu")}>
                <ArrowLeftShort size={36} />
              </Link>
              {state.shop && (
                <div className="fw-bold fs-5">{state.shop.name}</div>
              )}
            </Stack>
            <Stack direction="horizontal">
              <div className="fw-bold">สรุปรายการ</div>
              <Link
                to={getAppUrl("/menu")}
                className="fw-bold text-decoration-none ms-auto"
              >
                เพิ่มรายการ
              </Link>
            </Stack>
            <Stack gap={3} style={{ marginBottom: "100px" }}>
              {state.menuOrders.map((menuOrder) => (
                <Stack
                  direction="horizontal"
                  gap={3}
                  className="align-items-start"
                  key={menuOrder.id}
                  onClick={() => handleEdit(menuOrder)}
                >
                  <Card className="mt-2">
                    <Card.Body className="p-2">{menuOrder.quantity}x</Card.Body>
                  </Card>
                  <Stack>
                    <div>{menuOrder.name}</div>
                    <div className="text-black-50">{menuOrder.note}</div>
                    <div className="fw-bold text-primary">แก้ไข</div>
                  </Stack>
                  <div className="ms-auto">
                    ฿{menuOrder.amount.toLocaleString("en-US")}
                  </div>
                </Stack>
              ))}
            </Stack>
            <Stack
              className="position-fixed bottom-0 start-0 end-0 p-2 bg-white"
              gap={2}
            >
              <Stack direction="horizontal" gap={3}>
                <div className="fs-5 fw-bold">ยอดรวม</div>
                <div className="fs-5 fw-bold ms-auto">
                  ฿{totalAmount.toLocaleString("en-US")}
                </div>
              </Stack>
              {renderButtonPayment()}
            </Stack>
          </React.Fragment>
        )}
      </Stack>

      <Modal
        show={state.show}
        onHide={handleClose}
        fullscreen={true}
        placement="bottom"
      >
        <Modal.Body className="p-0">
          {state.show && (
            <MenuDetail
              {...state.menuSelect}
              callback={(value, isRemove) =>
                handleUpdateBasket(value, isRemove)
              }
            />
          )}
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

export default BasketPage;
