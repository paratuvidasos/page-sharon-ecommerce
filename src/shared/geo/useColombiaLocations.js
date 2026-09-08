import { useEffect, useMemo, useState } from "react";
import { listDepartments, listCitiesByDepartment } from "./colombiaLocations";

// Cascada departamento → municipio contra api-colombia.com, solo activa cuando
// `enabled` es true (el formulario decide eso según el país elegido — hoy solo
// Colombia). Los forms guardan `stateProvince`/`city` como texto libre (así los
// espera el backend propio), así que este hook trabaja por NOMBRE, no por id: recibe
// el nombre de departamento ya seleccionado y resuelve internamente a qué id
// corresponde para pedir sus municipios.
//
// Si la carga de departamentos falla, `departmentsError` queda en true — el
// formulario que consume esto decide volver a los inputs de texto libre en ese caso,
// en vez de mostrarle al usuario un select roto.
export function useColombiaLocations(enabled, departmentName) {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [departmentsError, setDepartmentsError] = useState(false);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState(false);

  useEffect(() => {
    if (!enabled || departments.length > 0) return;
    let cancelled = false;
    setLoadingDepartments(true);
    setDepartmentsError(false);
    listDepartments()
      .then((list) => {
        if (!cancelled) setDepartments(list);
      })
      .catch(() => {
        if (!cancelled) setDepartmentsError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingDepartments(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const department = useMemo(
    () => departments.find((d) => d.name === departmentName) || null,
    [departments, departmentName]
  );

  useEffect(() => {
    if (!enabled || !department) {
      setCities([]);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    setCitiesError(false);
    listCitiesByDepartment(department.id)
      .then((list) => {
        if (!cancelled) setCities(list);
      })
      .catch(() => {
        if (!cancelled) setCitiesError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, department]);

  return { departments, loadingDepartments, departmentsError, cities, loadingCities, citiesError };
}
