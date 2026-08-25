import { useState } from "react";
import { inputStyle, fieldLabelStyle, fieldErrorStyle, fieldHintStyle } from "../fieldStyles";
import { validateGuestEmail, validateFirstName, validateLastName, validatePassword } from "../validation";

// Contacto: correo de la cuenta si hay sesión, o correo de invitado + opción de crear
// cuenta con estos mismos datos (se conserva del CheckoutForm.jsx anterior — el
// contrato de POST /orders/checkout sigue aceptando createAccount/firstName/lastName/
// password aunque el checkout haya cambiado de modal a página).
export const ContactStep = ({ user, guest, onGuestChange, errors, touched, onBlur }) => {
  const [visible, setVisible] = useState(false);

  if (user) {
    return (
      <div>
        <div className="eyebrow" style={fieldLabelStyle}>Contacto</div>
        <div style={{ fontSize: 14 }}>{user.email}</div>
      </div>
    );
  }

  const set = (field) => (e) => onGuestChange(field, e.target.value);

  return (
    <div>
      <div>
        <label htmlFor="checkout-guest-email" className="eyebrow" style={fieldLabelStyle}>
          Correo electrónico
        </label>
        <input
          id="checkout-guest-email"
          value={guest.email}
          onChange={set("email")}
          onBlur={() => onBlur("email")}
          type="email"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          style={inputStyle(touched.email && errors.email)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.email && errors.email ? (
            <span role="alert" style={fieldErrorStyle}>{errors.email}</span>
          ) : (
            <span style={fieldHintStyle}>Ahí te enviamos la confirmación de tu pedido.</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={guest.createAccount}
            onChange={(e) => onGuestChange("createAccount", e.target.checked)}
            style={{ accentColor: "var(--botanic-deep)", width: 16, height: 16 }}
          />
          Crear una cuenta con estos datos
        </label>

        {guest.createAccount && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="checkout-grid">
              <div>
                <label htmlFor="checkout-firstName" className="eyebrow" style={fieldLabelStyle}>Nombre</label>
                <input
                  id="checkout-firstName"
                  value={guest.firstName}
                  onChange={set("firstName")}
                  onBlur={() => onBlur("firstName")}
                  type="text"
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                  style={inputStyle(touched.firstName && errors.firstName)}
                />
                <div style={{ minHeight: 18, marginTop: 4 }}>
                  {touched.firstName && errors.firstName && <span role="alert" style={fieldErrorStyle}>{errors.firstName}</span>}
                </div>
              </div>
              <div>
                <label htmlFor="checkout-lastName" className="eyebrow" style={fieldLabelStyle}>Apellido</label>
                <input
                  id="checkout-lastName"
                  value={guest.lastName}
                  onChange={set("lastName")}
                  onBlur={() => onBlur("lastName")}
                  type="text"
                  placeholder="Tu apellido"
                  autoComplete="family-name"
                  style={inputStyle(touched.lastName && errors.lastName)}
                />
                <div style={{ minHeight: 18, marginTop: 4 }}>
                  {touched.lastName && errors.lastName && <span role="alert" style={fieldErrorStyle}>{errors.lastName}</span>}
                </div>
              </div>
            </div>

            <label htmlFor="checkout-password" className="eyebrow" style={fieldLabelStyle}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                id="checkout-password"
                value={guest.password}
                onChange={set("password")}
                onBlur={() => onBlur("password")}
                type={visible ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                style={{ ...inputStyle(touched.password && errors.password), paddingRight: 46 }}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: 0, padding: 8, cursor: "pointer", fontSize: 11, color: "var(--ink-soft)",
                }}
              >
                {visible ? "Ocultar" : "Ver"}
              </button>
            </div>
            <div style={{ minHeight: 18, marginTop: 4 }}>
              {touched.password && errors.password ? (
                <span role="alert" style={fieldErrorStyle}>{errors.password}</span>
              ) : (
                <span style={fieldHintStyle}>Mínimo 8 caracteres, con una letra y un número.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function validateGuestFields(guest) {
  const errors = { email: validateGuestEmail(guest.email) };
  if (guest.createAccount) {
    errors.firstName = validateFirstName(guest.firstName);
    errors.lastName = validateLastName(guest.lastName);
    errors.password = validatePassword(guest.password);
  }
  return errors;
}
