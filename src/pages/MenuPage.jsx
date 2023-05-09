import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash";
import { query } from "../apis/menu";
import { Button, Stack, Image, Modal, Placeholder } from "react-bootstrap";
import useAppUrl from "../hooks/useAppUrl";
import { ApiStatus } from "../constants/app";
import { useCartContext } from "../context/CartProvider";
import OrderDetail from "../components/OrderDetail";

const MenuPage = () => {
  const { shopId, orderId, navigateApp } = useAppUrl();
  const { status: cartStatus, shop } = useCartContext();
  useEffect(() => {
    if (cartStatus === ApiStatus.COMPLETE) {
      fetchData(shopId, orderId);
    }
  }, [cartStatus, shopId, orderId]);

  const [status, setStatus] = useState(ApiStatus.PENDING);
  const [show, setShow] = useState(false);
  const [menuSelect, setMenuSelect] = useState(null);
  const [order, setOrder] = useState(null);
  const [menuOrders, setMenuOrders] = useState([]);

  const fetchData = async (shopId, orderId) => {
    const params = {
      shopId,
      orderId,
    };
    const { order, menuOrders = [] } = await query(params);
    setOrder(order);
    setMenuOrders(menuOrders);
    setStatus(ApiStatus.COMPLETE);
  };

  const handleClick = (menuOrder) => {
    const { id: menuId, ...params } = menuOrder;
    setMenuSelect({ ...params, menuId, shopId, orderId });
    setShow(true);
  };
  const handleUpdateBasket = (value, isRemove) => {
    if (!value) {
      handleClose();
      return;
    }

    const { order, menuOrders: menuOrderUpdated } = value;
    const menuOrderList = menuOrders.map((o) => {
      const updated = _.find(menuOrderUpdated, (menu) => menu.id === o.id);
      if (!updated) {
        if (isRemove && o.id === menuSelect.menuId) {
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
    setOrder(order);
    setMenuOrders(menuOrderList);
    handleClose();
  };
  const handleClose = () => setShow(false);
  const handleGotoBasket = () => navigateApp("/basket");
  const totalAmount = order?.amount ?? 0;
  const totalItem = useMemo(
    () => _.sumBy(order?.items ?? [], "quantity"),
    [order]
  );
  return (
    <React.Fragment>
      <Stack>
        {status === ApiStatus.PENDING && (
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
        {status === ApiStatus.COMPLETE && (
          <React.Fragment>
            <Image fluid src={shop.imageUrl} style={{ height: "300px" }} />
            <Stack className="p-3">
              <div className="fw-bold fs-2">{shop.name}</div>
              <hr />
              <Stack gap={3} style={{ marginBottom: "60px" }}>
                {menuOrders.map((menuOrder) => (
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
        show={show}
        onHide={handleClose}
        fullscreen={true}
        placement="bottom"
      >
        <Modal.Body className="p-0">
          {show && (
            <OrderDetail
              {...menuSelect}
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
