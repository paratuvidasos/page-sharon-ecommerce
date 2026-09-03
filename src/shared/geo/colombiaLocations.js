// Cliente para la API pública de api-colombia.com (https://github.com/Mteheran/api-colombia):
// departamentos y municipios reales de Colombia, para que el selector de dirección deje
// de depender de texto libre (con los typos/variantes de nombre que eso implica) cuando
// el país elegido es Colombia. Es una API externa de solo lectura, sin autenticación, así
// que vive fuera de shared/api-client (ese cliente es específicamente para el backend
// propio de Sharon) pero sigue la misma regla de no hacer fetch directo desde componentes.
const BASE_URL = "https://api-colombia.com/api/v1";

let departmentsCache = null;
const citiesCache = new Map();

function normalize(list) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function listDepartments() {
  if (departmentsCache) return departmentsCache;
  const res = await fetch(`${BASE_URL}/Department`);
  if (!res.ok) throw new Error("No se pudieron cargar los departamentos");
  const data = await res.json();
  departmentsCache = normalize(data.map((d) => ({ id: d.id, name: d.name })));
  return departmentsCache;
}

export async function listCitiesByDepartment(departmentId) {
  if (citiesCache.has(departmentId)) return citiesCache.get(departmentId);
  const res = await fetch(`${BASE_URL}/Department/${departmentId}/cities`);
  if (!res.ok) throw new Error("No se pudieron cargar los municipios");
  const data = await res.json();
  const cities = normalize(data.map((c) => ({ id: c.id, name: c.name, postalCode: c.postalCode || null })));
  citiesCache.set(departmentId, cities);
  return cities;
}
