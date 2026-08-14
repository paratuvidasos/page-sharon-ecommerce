// Capas de superposición de toda la UI, de fondo a frente.
// Cada modal ocupa dos niveles consecutivos: overlay en Z.<nombre>, panel en Z.<nombre> + 1.
// Se deja separación de 5–10 entre capas para permitir diálogos anidados sin colisionar.
export const Z = {
  toast: 70, // App.jsx, notificación "agregado a la bolsa"
  cart: 80, // CartDrawer
  search: 90, // SearchModal
  auth: 92, // AuthModal
  resetPassword: 93, // ResetPasswordModal (aterrizaje del enlace de recuperación)
  profile: 94, // ProfileModal (editar perfil)
  addressBook: 96, // AddressBookModal, anidado dentro de ProfileModal
  addressForm: 98, // AddressFormModal, anidado dentro de AddressBookModal
  mobileMenu: 101, // MobileMenu
  checkout: 106, // CheckoutModal (anidado dentro de CartDrawer)
  googleDialog: 116, // diálogo simulado de Google, anidado dentro de AuthModal
};
