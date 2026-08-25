import { request } from "./http";

export const quoteShipping = ({ countryCode, stateProvince, subtotal, currency }, accessToken) =>
  request("/shipping/quote", {
    method: "POST",
    body: { countryCode, stateProvince, subtotal, currency },
    token: accessToken,
  });
