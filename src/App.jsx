import React from "react";
import Router from "./Router";
import CartProvider from "./context/CartProvider";

const App = () => {
  return (
    <React.Fragment>
        <CartProvider>
          <Router />
        </CartProvider>
    </React.Fragment>
  );
};

export default App;
