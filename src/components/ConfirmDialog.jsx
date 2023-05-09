import { Offcanvas, Stack, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const ConfirmDialog = ({
  show,
  message,
  buttonPrimaryText,
  buttonSecondaryText,
  callback,
}) => {
  const handleClose = () => callback(false);
  const handleConfirm = () => callback(true);
  return (
    <Offcanvas show={show} onHide={handleClose} placement="bottom">
      <Offcanvas.Header closeButton size="lg">
        <Offcanvas.Title>{message}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Stack gap={2}>
          <Button onClick={handleConfirm} size="lg">
            {buttonPrimaryText}
          </Button>
          <Button variant="danger" onClick={handleClose} size="lg">
            {buttonSecondaryText}
          </Button>
        </Stack>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

ConfirmDialog.propTypes ={
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    buttonPrimaryText: PropTypes.string.isRequired,
    buttonSecondaryText: PropTypes.string.isRequired,
    callback: PropTypes.func.isRequired,
};

export default ConfirmDialog;
