import { Route, Routes } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import BasketPage from "./pages/BasketPage";
import PaymentPage from "./pages/PaymentPage";
import OrderPage from "./pages/OrderPage";
import HistoryPage from "./pages/HistoryPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedContent from "./components/ProtectedContent";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<NotFoundPage />} />
      <Route path="/notfound" element={<NotFoundPage />} />
      <Route
        path="/*"
        element={
          <ProtectedContent>
            <ValidateRouter />
          </ProtectedContent>
        }
      />
    </Routes>
  );
};

const ValidateRouter = () => {
  return (
    <Routes>
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/basket" element={<BasketPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
};

export default Router;
