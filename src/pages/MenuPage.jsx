import React, { useState, useEffect } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import MenuDetail from "../components/menu/MenuDetail";
import { query } from "../apis/menu";
import {
  Button,
  Container,
  Stack,
  Col,
  Row,
  Image,
  Modal,
  Card,
} from "react-bootstrap";
import { useAppContext } from "../components/AppProvider";

const MenuPage = () => {
  const { shopId, orderId, navigateApp } = useAppContext();
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
      keyword: "",
    };
    const { shop, order, menuOrders = [] } = await query(params);
    setState({
      ...state,
      shop,
      order,
      menuOrders,
    });
  };

  const navigate = useNavigate();
  const handleClick = (menuOrder) => {
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
    const menuOrders = state.menuOrders.map((o) => {
      const updated = _.find(menuOrderUpdated, (menu) => menu.id === o.id);
      if (!updated) {
        if(isRemove && o.id === state.menuSelect.menuId) {
          return {
            ...o,
            itemId: null,
            quantity: 0,
            note: null,
          }
        }
        return o;
      }
      return updated;
    });
    setState({
      ...state,
      show: false,
      order: { ...order },
      menuOrders: [...menuOrders],
    });
  };
  const handleClose = () => setState({ ...state, show: false });
  const handleGotoBasket = () => navigateApp("/basket");
  const totalAmount = state.order?.amount ?? 0;
  const totalItem = _.sumBy(state.order?.items ?? [], "quantity");
  return (
    <React.Fragment>
      <Stack>
        {state.shop && (
          <React.Fragment>
            <Image fluid src={state.shop.imageUrl} />
            <Card className="m-2">
              <Card.Body>{state.shop.name}</Card.Body>
            </Card>
          </React.Fragment>
        )}
        <Container fluid className="pb-5">
          {state.menuOrders.map((menuOrder) => (
            <Row
              className="my-2"
              onClick={() => handleClick(menuOrder)}
              key={menuOrder.id}
            >
              <Col xs="3">
                <Image fluid rounded src={menuOrder.imageUrl} />
              </Col>
              <Col>
                {!!menuOrder.quantity && (
                  <div className="text-primary fw-bold">
                    {menuOrder.quantity} x {menuOrder.name}
                  </div>
                )}
                {!menuOrder.quantity && <div>{menuOrder.name}</div>}
                <div className="text-black-50">{menuOrder.description}</div>
                <p>
                  <strong>฿{menuOrder.price}</strong>
                </p>
              </Col>
            </Row>
          ))}
        </Container>
        {totalItem > 0 && (
          <Stack className="position-fixed bottom-0 start-0 end-0 p-2 bg-white">
            <Button className="d-flex text-start" onClick={handleGotoBasket}>
              <label className="flex-grow-1">จำนวน {totalItem} รายการ</label>
              <label>฿{totalAmount}</label>
            </Button>
          </Stack>
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
              callback={(value, isRemove) => handleUpdateBasket(value, isRemove)}
            />
          )}
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

export default MenuPage;
