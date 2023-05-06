import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

const AppContext = createContext({});

const AppProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get("shopId");
  const orderId = searchParams.get("orderId");
  const path = location.pathname;

  const getAppUrl = (url) => {
    const suffix = `shopId=${shopId}&orderId=${orderId}`;
    const hasQueryString = url.indexOf("?") >= 0;
    const seperator = hasQueryString ? "&" : "?";
    return url + seperator + suffix;
  };

  const navigateApp = (url) => {
    navigate(getAppUrl(url));
  };

  const value = { shopId, orderId, path, getAppUrl, navigateApp };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;
