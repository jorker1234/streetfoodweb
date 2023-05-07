import React, { useState, useEffect } from "react";
import _ from "lodash";
import MenuDetail from "../components/menu/MenuDetail";
import { query } from "../apis/menu";
import {
  Button,
  Stack,
  Image,
  Modal,
  Placeholder,
} from "react-bootstrap";
import { useAppContext } from "../components/AppProvider";
import { ApiStatus } from "../constants/app";
import { useCartContext } from "../components/CartProvider";

const MenuPage = () => {
  const { shopId, orderId, navigateApp } = useAppContext();
  const {
    cart: { isLoaded },
  } = useCartContext();
  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  const [state, setState] = useState({
    status: ApiStatus.PENDING,
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
      status: ApiStatus.COMPLETE,
      shop,
      order,
      menuOrders,
    });
  };

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
        if (isRemove && o.id === state.menuSelect.menuId) {
          return {
            ...o,
            itemId: null,
            quantity: 0,
            note: null,
          };
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
        {state.status === ApiStatus.PENDING && (
          <React.Fragment>
            <div
              className="bg-dark bg-gradient bg-opacity-50"
              style={{ height: "300px" }}
            ></div>
            <Stack className="p-3">
              <Placeholder as="div" animation="glow">
                <Placeholder xs={6} className="fw-bold fs-2" />
              </Placeholder>
              <hr />
              <Stack gap={3} style={{ marginBottom: "60px" }}>
                {[0, 1, 2].map((o) => (
                  <Stack
                    key={o}
                    direction="horizontal"
                    gap={3}
                    className="align-items-start"
                  >
                    <div
                      className="bg-dark bg-opacity-25 rounded"
                      style={{ width: "70px", height: "70px" }}
                    ></div>
                    <Stack>
                      <Placeholder as="div" animation="glow">
                        <Placeholder xs={9} />
                      </Placeholder>
                      <Placeholder
                        as="div"
                        className="font-weight"
                        animation="glow"
                      >
                        <Placeholder xs={4} />
                        &nbsp;
                      </Placeholder>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </React.Fragment>
        )}
        {state.status === ApiStatus.COMPLETE && (
          <React.Fragment>
            <Image
              fluid
              src={state.shop.imageUrl}
              style={{ height: "300px" }}
            />
            <Stack className="p-3">
              <div className="fw-bold fs-2">{state.shop.name}</div>
              <hr />
              <Stack gap={3} style={{ marginBottom: "60px" }}>
                {state.menuOrders.map((menuOrder) => (
                  <Stack
                    key={menuOrder.id}
                    direction="horizontal"
                    gap={3}
                    className="align-items-start"
                    onClick={() => handleClick(menuOrder)}
                  >
                    <Image
                      rounded
                      src={menuOrder.imageUrl}
                      style={{ width: "70px", height: "70px" }}
                    />
                    <div>
                      {!!menuOrder.quantity && (
                        <div className="text-primary fw-bold">
                          {menuOrder.quantity} x {menuOrder.name}
                        </div>
                      )}
                      {!menuOrder.quantity && <div>{menuOrder.name}</div>}
                      <div className="text-black-50">
                        {menuOrder.description}
                      </div>
                      <div className="fw-bold">
                        ฿{menuOrder.price.toLocaleString("en-US")}
                      </div>
                    </div>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            {totalItem > 0 && (
              <Stack className="position-fixed bottom-0 start-0 end-0 p-2 bg-white">
                <Button
                  className="d-flex text-start"
                  onClick={handleGotoBasket}
                  size="lg"
                >
                  <label className="flex-grow-1">
                    จำนวน {totalItem} รายการ
                  </label>
                  <label>฿{totalAmount.toLocaleString("en-US")}</label>
                </Button>
              </Stack>
            )}
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

export default MenuPage;
