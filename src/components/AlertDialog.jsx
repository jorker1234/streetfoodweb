import { Offcanvas, Stack, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const AlertDialog = ({ show, message, buttonPrimaryText, callback }) => {
  return (
    <Offcanvas show={show} onHide={callback} placement="bottom" backdrop="static">
      <Offcanvas.Header size="lg">
        <Offcanvas.Title>{message}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Stack gap={2} className="">
          <Button onClick={callback} size="lg">
            {buttonPrimaryText}
          </Button>
        </Stack>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

AlertDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  buttonPrimaryText: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,
};

export default AlertDialog;
