import React from "react";
import Router from "./Router";
import CartProvider from "./context/CartProvider";
import DialogProvider from "./context/DialogProvider";

const App = () => {
  return (
    <React.Fragment>
      <DialogProvider>
        <CartProvider>
          <Router />
        </CartProvider>
      </DialogProvider>
    </React.Fragment>
  );
};

export default App;
