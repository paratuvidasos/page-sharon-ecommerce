import { listDepartments, listCitiesByDepartment } from "@shared/geo/colombiaLocations";

function mockFetchOnce(body, ok = true) {
  global.fetch.mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(body),
  });
}

describe("colombiaLocations", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("fetches departments, maps id/name and sorts them alphabetically", async () => {
    mockFetchOnce([
      { id: 3, name: "Zulia", extraField: "ignored" },
      { id: 1, name: "Amazonas" },
    ]);

    const result = await listDepartments();

    expect(global.fetch).toHaveBeenCalledWith("https://api-colombia.com/api/v1/Department");
    expect(result).toEqual([
      { id: 1, name: "Amazonas" },
      { id: 3, name: "Zulia" },
    ]);
  });

  it("throws when the departments request fails", async () => {
    // Usa un id de departamento distinto al de otros tests: el caché de módulo es
    // compartido entre casos, y este test no debe reusar una respuesta ya cacheada.
    mockFetchOnce({}, false);
    await expect(listCitiesByDepartment(9991)).rejects.toThrow();
  });

  it("fetches cities for a department, maps id/name/postalCode and sorts them", async () => {
    mockFetchOnce([
      { id: 20, name: "El Encanto", postalCode: null },
      { id: 10, name: "Leticia", postalCode: "910001" },
    ]);

    const result = await listCitiesByDepartment(9001);

    expect(global.fetch).toHaveBeenCalledWith("https://api-colombia.com/api/v1/Department/9001/cities");
    expect(result).toEqual([
      { id: 20, name: "El Encanto", postalCode: null },
      { id: 10, name: "Leticia", postalCode: "910001" },
    ]);
  });

  it("caches cities per department and does not refetch on a second call", async () => {
    mockFetchOnce([{ id: 30, name: "Medellín", postalCode: "050001" }]);

    const first = await listCitiesByDepartment(9002);
    const second = await listCitiesByDepartment(9002);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });
});
