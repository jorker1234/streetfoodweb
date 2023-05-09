import React, { createContext, useCallback, useContext, useState } from "react";
import PropTypes from "prop-types";
import ConfirmDialog from "../components/ConfirmDialog";
import AlertDialog from "../components/AlertDialog";

const DialogContext = createContext({});

let resolveConfirmCallback;
let resolveAlertCallback;
const DialogProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    show: false,
    message: "",
    buttonPrimaryText: "",
    buttonSecondaryText: "",
  });

  const [alertState, setAlertState] = useState({
    show: false,
    message: "",
    buttonPrimaryText: "",
  });

  const confirm = useCallback(
    async (
      message,
      buttonPrimaryText = "ยืนยัน",
      buttonSecondaryText = "ยกเลิก"
    ) => {
      setConfirmState({
        show: true,
        message,
        buttonPrimaryText,
        buttonSecondaryText,
      });
      return new Promise((resolve) => {
        resolveConfirmCallback = resolve;
      });
    },
    []
  );

  const alert = useCallback(async (message, buttonPrimaryText = "ปิด") => {
    setAlertState({
      show: true,
      message,
      buttonPrimaryText,
    });
    return new Promise((resolve) => {
      resolveAlertCallback = resolve;
    });
  }, []);

  const handleConfirm = (isConfirm) => {
    setConfirmState({
      ...confirmState,
      show: false,
    });
    resolveConfirmCallback(isConfirm);
  };

  const handleAlert = () => {
    setAlertState({
      ...alertState,
      show: false,
    });
    resolveAlertCallback(true);
  };

  const value = { confirm, alert };

  return (
    <DialogContext.Provider value={value}>
      <React.Fragment>
        {children}
        <ConfirmDialog {...confirmState} callback={handleConfirm} />
        <AlertDialog {...alertState} callback={handleAlert} />
      </React.Fragment>
    </DialogContext.Provider>
  );
};

DialogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useDialog = () => useContext(DialogContext);
export default DialogProvider;
