import React from "react";
import Router from "./Router";
import AppProvider from "./components/AppProvider";
import CartProvider from "./components/CartProvider";

const App = () => {
  return (
    <React.Fragment>
      <AppProvider>
        <CartProvider>
          <Router />
        </CartProvider>
      </AppProvider>
    </React.Fragment>
  );
};

export default App;
