import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Stack, Image, Placeholder } from "react-bootstrap";
import {
  XCircleFill,
  PlusSquareFill,
  DashSquareFill,
} from "react-bootstrap-icons";
import { update } from "../../apis/order";
import { ApiStatus } from "../../constants/app";

const MenuDetail = ({
  shopId,
  orderId,
  menuId,
  itemId,
  name,
  imageUrl,
  note,
  price,
  quantity,
  callback,
}) => {
  const [state, setState] = useState({
    status: ApiStatus.COMPLETE,
    quantity: Math.max(1, quantity),
    note: note ?? "",
  });
  const handleAddToBasket = async () => {
    if (!itemId && state.quantity === 0) {
      return callback(null);
    }
    setState({
      ...state,
      status: ApiStatus.PENDING,
    });
    const params = {
      shopId,
      orderId,
      menuId,
      quantity: state.quantity,
      note: state.note,
    };
    const result = await update(params);
    callback(result, state.quantity === 0);
  };
  const handleOnChange = (e) => {
    const note = e.target.value;
    setState({
      ...state,
      note,
    });
  };
  const handleAddQuantity = (value) => {
    if (state.status !== ApiStatus.COMPLETE) {
      return;
    }
    let quantity = state.quantity + value;
    if (quantity < 0) {
      quantity = 0;
    }
    setState({
      ...state,
      quantity,
    });
  };
  const amount = state.quantity * price;
  const buttonText = !itemId
    ? "เพิ่มรายการ"
    : state.quantity > 0
    ? "อัพเดทรายการ"
    : "ลบรายการ";
  const buttonColor = itemId && state.quantity === 0 ? "danger" : "primary";
  return (
    <React.Fragment>
      <Stack>
        <XCircleFill
          size={36}
          className="position-fixed m-2"
          onClick={() => callback(null)}
        />
        <Image fluid src={imageUrl} style={{ height: "300px" }} />
        <Stack className="p-3">
          <Stack direction="horizontal" gap={3} className="align-items-start">
            <div className="fw-bold fs-2">{name}</div>
            <div className="fw-bold fs-2 ms-auto">{price}</div>
          </Stack>
          <hr />
          <Stack className="">
            <label htmlFor="txtNote" className="form-label">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              className="form-control"
              id="txtNote"
              onChange={handleOnChange}
              value={state.note}
            />
          </Stack>
          <Stack direction="horizontal" gap={3} className="mx-auto my-3">
            <DashSquareFill size={36} onClick={() => handleAddQuantity(-1)} />
            <label>{state.quantity}</label>
            <PlusSquareFill size={36} onClick={() => handleAddQuantity(1)} />
          </Stack>
          <div className="my-2">&nbsp;</div>
        </Stack>
        <Stack className="position-fixed bottom-0 start-0 end-0 p-2 bg-white">
          {state.status === ApiStatus.PENDING && (
            <Button variant={buttonColor} size="lg" disabled>
              <Placeholder animation="glow">
                <Placeholder xs={8} />
              </Placeholder>
            </Button>
          )}
          {state.status === ApiStatus.COMPLETE && (
            <Button onClick={handleAddToBasket} variant={buttonColor} size="lg">
              {buttonText} - ฿{amount.toLocaleString("en-US")}
            </Button>
          )}
        </Stack>
      </Stack>
    </React.Fragment>
  );
};

MenuDetail.propTypes = {
  shopId: PropTypes.string.isRequired,
  orderId: PropTypes.string.isRequired,
  menuId: PropTypes.string.isRequired,
  itemId: PropTypes.string,
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  description: PropTypes.string,
  note: PropTypes.string,
  price: PropTypes.number.isRequired,
  quantity: PropTypes.number,
  callback: PropTypes.func.isRequired,
};

export default MenuDetail;
