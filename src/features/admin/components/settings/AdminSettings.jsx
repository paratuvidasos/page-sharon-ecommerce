import { AdminShippingZones } from "./AdminShippingZones";
import { AdminFeaturedConfig } from "./AdminFeaturedConfig";

// /admin/settings compone las dos configuraciones de tienda que existen hoy: zonas
// de envío (ya real desde la iteración anterior) y destacados de home (nuevo).
export const AdminSettings = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
    <AdminShippingZones />
    <AdminFeaturedConfig />
  </div>
);
