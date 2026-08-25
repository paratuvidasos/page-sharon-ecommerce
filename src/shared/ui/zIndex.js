// Capas de superposición de toda la UI, de fondo a frente.
// Cada modal ocupa dos niveles consecutivos: overlay en Z.<nombre>, panel en Z.<nombre> + 1.
// Se deja separación de 5–10 entre capas para permitir diálogos anidados sin colisionar.
export const Z = {
  toast: 70, // App.jsx, notificación "agregado a la bolsa"
  accountMenu: 79, // AccountMenu, dropdown desde el ícono de cuenta en Nav (no es un <Modal>)
  cart: 80, // CartDrawer
  wishlist: 82, // WishlistModal
  search: 90, // SearchModal
  productDetail: 91, // ProductDetailModal — se abre tanto desde ProductCard/Products
  // como desde dentro de SearchModal (resultado de búsqueda), por eso va arriba de
  // Z.search: si se abre desde la búsqueda, tiene que quedar encima del propio modal.
  auth: 92, // AuthModal
  resetPassword: 93, // ResetPasswordModal (aterrizaje del enlace de recuperación)
  profile: 94, // ProfileModal (editar perfil)
  addressBook: 96, // AddressBookModal, anidado dentro de ProfileModal
  addressForm: 98, // AddressFormModal, anidado dentro de AddressBookModal
  orderHistory: 100, // OrderHistoryModal — hermano top-level en App.jsx, se abre directo
  // desde el menú desplegable de la cuenta (AccountMenu), no anidado dentro de ProfileModal.
  orderDetail: 102, // OrderDetailModal, anidado dentro de OrderHistoryModal
  deleteAccount: 103, // DeleteAccountModal — se abre desde ProfileModal pero se renderiza
  // como hermano top-level en App.jsx (no anidado dentro de ProfileModal), porque
  // ProfileModal se auto-oculta (`if (!user) return null`) apenas la cuenta se elimina
  // y perdería la pantalla de éxito si viviera dentro de su árbol.
  mobileMenu: 104, // MobileMenu
  notifications: 105, // NotificationsPanel (dropdown desde la campana en Nav, no es un <Modal>)
  orderTracking: 106, // OrderDetailModal abierto desde una notificación — se renderiza como
  // hermano top-level en App.jsx (mismo motivo que Z.deleteAccount: la instancia de
  // OrderDetailModal que vive dentro de OrderHistoryModal solo se monta si esa modal está abierta).
  // checkout ya no es modal: es una vista dedicada en /checkout (ver src/pages/CheckoutPage.jsx).
  googleDialog: 119, // diálogo simulado de Google, anidado dentro de AuthModal
  verifyEmail: 121, // EmailVerificationModal (aterrizaje del enlace de verificación de correo)
};
