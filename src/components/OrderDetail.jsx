import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Stack, Image, Placeholder } from "react-bootstrap";
import {
  XCircleFill,
  PlusSquareFill,
  DashSquareFill,
} from "react-bootstrap-icons";
import { update as updateOrderAsync } from "../apis/order";
import { ApiStatus } from "../constants/app";

const OrderDetail = ({
  shopId,
  orderId,
  menuId,
  itemId,
  name,
  imageUrl,
  price,
  quantity: quantityParam,
  note: noteParam,
  callback,
}) => {
  const [status, setStatus] = useState(ApiStatus.COMPLETE);
  const [quantity, setQuantity] = useState(Math.max(1, quantityParam));
  const [note, setNote] = useState(noteParam ?? "");
  const handleUpdateBasket = async () => {
    if (!itemId && quantity === 0) {
      return callback(null);
    }
    if (itemId && quantity === quantityParam && note === noteParam) {
      return callback(null);
    }
    setStatus(ApiStatus.PENDING);
    const params = {
      shopId,
      orderId,
      menuId,
      quantity,
      note,
    };
    try {
      const result = await updateOrderAsync(params);
      callback(result, quantity === 0);
    } catch (error) {
      callback(null, false, error);
    }
  };
  const handleOnNoteChange = (e) => {
    const value = e.target.value;
    setNote(value);
  };
  const handleAddQuantity = (value) => {
    if (status !== ApiStatus.COMPLETE) {
      return;
    }
    const qty = Math.max(0, quantity + value);
    setQuantity(qty);
  };
  const amount = quantity * price;
  let buttonText = "เพิ่มรายการ";
  if (!!itemId && quantity > 0) {
    buttonText = "อัพเดทรายการ";
  } else if (!!itemId && quantity === 0) {
    buttonText = "ลบรายการ";
  } else if (!itemId && quantity === 0) {
    buttonText = "กลับหน้าเมนู";
  }
  if (quantity > 0) {
    buttonText += ` - ฿${amount.toLocaleString("en-US")}`;
  }
  const buttonColor = itemId && quantity === 0 ? "danger" : "primary";
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
            <div className="fw-bold fs-2 ms-auto">฿{price}</div>
          </Stack>
          <hr />
          <Stack className="">
            <label htmlFor="txtNote" className="form-label">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              className="form-control"
              id="txtNote"
              onChange={handleOnNoteChange}
              value={note}
            />
          </Stack>
          <Stack direction="horizontal" gap={3} className="mx-auto my-3">
            <DashSquareFill size={36} onClick={() => handleAddQuantity(-1)} className="text-primary" />
            <label>{quantity}</label>
            <PlusSquareFill size={36} onClick={() => handleAddQuantity(1)} className="text-primary" />
          </Stack>
          <div className="my-2">&nbsp;</div>
        </Stack>
        <Stack className="position-fixed bottom-0 start-0 end-0 p-2 bg-white">
          {status === ApiStatus.PENDING && (
            <Button variant={buttonColor} size="lg" disabled>
              <Placeholder animation="glow">
                <Placeholder xs={8} />
              </Placeholder>
            </Button>
          )}
          {status === ApiStatus.COMPLETE && (
            <Button
              onClick={handleUpdateBasket}
              variant={buttonColor}
              size="lg"
            >
              {buttonText}
            </Button>
          )}
        </Stack>
      </Stack>
    </React.Fragment>
  );
};

OrderDetail.propTypes = {
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

export default OrderDetail;
