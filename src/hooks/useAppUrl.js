import { useSearchParams, useLocation, useNavigate } from "react-router-dom";

const useAppUrl = () => {
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

  return { shopId, orderId, path, getAppUrl, navigateApp };
};
export default useAppUrl;
