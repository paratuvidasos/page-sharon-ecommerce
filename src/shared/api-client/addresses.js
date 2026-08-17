import { request } from "./http";

function addressBody({ alias, recipientName, phone, countryCode, stateProvince, city, postalCode, line1, line2 }) {
  return { alias, recipientName, phone, countryCode, stateProvince, city, postalCode, line1, line2 };
}

export function listAddresses(accessToken) {
  return request("/accounts/me/addresses", { token: accessToken });
}

export function createAddress(fields, accessToken) {
  return request("/accounts/me/addresses", {
    method: "POST",
    body: addressBody(fields),
    token: accessToken,
  });
}

export function updateAddress(addressId, fields, accessToken) {
  return request(`/accounts/me/addresses/${addressId}`, {
    method: "PATCH",
    body: addressBody(fields),
    token: accessToken,
  });
}

export function deleteAddress(addressId, accessToken) {
  return request(`/accounts/me/addresses/${addressId}`, {
    method: "DELETE",
    token: accessToken,
  });
}

export function setDefaultAddress(addressId, accessToken) {
  return request(`/accounts/me/addresses/${addressId}/default`, {
    method: "PATCH",
    token: accessToken,
  });
}

export function archiveAddress(addressId, accessToken) {
  return request(`/accounts/me/addresses/${addressId}/archive`, {
    method: "PATCH",
    token: accessToken,
  });
}

export function restoreAddress(addressId, accessToken) {
  return request(`/accounts/me/addresses/${addressId}/restore`, {
    method: "PATCH",
    token: accessToken,
  });
}
