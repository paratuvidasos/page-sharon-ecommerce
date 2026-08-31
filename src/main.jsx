import { ClerkProvider } from "@clerk/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "@shared/auth/AuthContext";
import { CartProvider } from "@shared/cart/CartContext";
import { LocalizationProvider } from "@shared/i18n/LocalizationContext";
import "@shared/i18n/i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LocalizationProvider>
          <CartProvider>
            <ClerkProvider afterSignOutUrl="/">
              <App />
            </ClerkProvider>
          </CartProvider>
        </LocalizationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);