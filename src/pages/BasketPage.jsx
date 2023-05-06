import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Link } from "react-router-dom";
import { Button, Stack, Modal, Card } from "react-bootstrap";
import MenuDetail from "../components/menu/MenuDetail";
import { ArrowLeftShort } from "react-bootstrap-icons";
import { get as getOrderAsync } from "../apis/order";
import { create as createBillAsync } from "../apis/bill";
import { useAppContext } from "../components/AppProvider";
import { useCartContext } from "../components/CartProvider";
const BasketPage = () => {
  const { shopId, orderId, getAppUrl } = useAppContext();
  const { validateAsync } = useCartContext();
  useEffect(() => {
    fetchData();
  }, []);

  const [state, setState] = useState({
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
      shop,
      order,
      menuOrders,
    });
  };
  const totalAmount = state.order?.amount ?? 0;

  const handleClose = () => setState({ ...state, show: false });
  const handleEdit = (menuOrder) => {
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
    const result = await createBillAsync({
      shopId,
      orderId,
      customer: "คุณอร",
    });
    if (result.bills.length > 0 && result.bills[0].isActived) {
      await validateAsync(shopId, orderId);
    }
  };
  return (
    <React.Fragment>
      <Stack className="p-2" gap={3}>
        <Stack direction="horizontal" gap={3}>
          <Link to={getAppUrl("/menu")}>
            <ArrowLeftShort size={36} />
          </Link>
          {state.shop && <div className="fw-bold fs-5">{state.shop.name}</div>}
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
            <div className="ms-auto">฿{menuOrder.amount}</div>
          </Stack>
        ))}
      </Stack>
      <Stack
        className="position-fixed bottom-0 start-0 end-0 p-2 bg-white"
        gap={2}
      >
        <Stack direction="horizontal" gap={3}>
          <div className="fs-5 fw-bold">ยอดรวม</div>
          <div className="fs-5 fw-bold ms-auto">฿{totalAmount}</div>
        </Stack>
        <Button onClick={handlePayment} size="lg">จ่ายเงิน</Button>
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
