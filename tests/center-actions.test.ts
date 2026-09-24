import { beforeEach, describe, expect, it, vi } from "vitest";
import { centerMessages } from "@/lib/center-links";
import { findHelpCenters, registerCenter, trackCenterContactClick } from "@/lib/center-actions";

/**
 * Server actions are public HTTP endpoints, so they must validate their own
 * input. These tests use the real action code and mock only the database layer
 * (src/lib/centers.ts), which is what makes them fast and deterministic.
 */
const dbMocks = {
  findCentersForService: vi.fn(),
  insertCenterRegistration: vi.fn(),
  recordContactClick: vi.fn(),
};

vi.mock("@/lib/centers", () => ({
  findCentersForService: (serviceId: string, location: string) => dbMocks.findCentersForService(serviceId, location),
  insertCenterRegistration: (input: unknown) => dbMocks.insertCenterRegistration(input),
  recordContactClick: (centerId: string, serviceId: string) => dbMocks.recordContactClick(centerId, serviceId),
}));

const serviceId = "6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa";
const centerId = "8b0f6d9e-8a2a-4a1b-9a9a-2b1c3d4e5f60";

/** A complete, valid registration form, as the browser would send it. */
function validFormData() {
  const formData = new FormData();
  formData.set("name", "Pragati CSC Center");
  formData.set("address", "Shop 4, GS Road, Ward 9");
  formData.set("city", "Guwahati");
  formData.set("pincode", "781001");
  formData.set("phone", "9876543210");
  formData.set("whatsapp", "");
  formData.append("service_ids", serviceId);
  return formData;
}

beforeEach(() => {
  dbMocks.findCentersForService.mockReset();
  dbMocks.insertCenterRegistration.mockReset();
  dbMocks.recordContactClick.mockReset();
});

describe("findHelpCenters", () => {
  it("rejects a service id that is not a uuid instead of querying the database", async () => {
    await expect(findHelpCenters("../../../etc/passwd", "Guwahati")).resolves.toEqual({
      centers: [],
      error: centerMessages.searchFailed,
    });
    expect(dbMocks.findCentersForService).not.toHaveBeenCalled();
  });

  it("caps the location length before it reaches the query builder", async () => {
    dbMocks.findCentersForService.mockResolvedValue({ centers: [], error: null });

    await findHelpCenters(serviceId, "a".repeat(500));

    expect(dbMocks.findCentersForService).toHaveBeenCalledWith(serviceId, "a".repeat(80));
  });

  it("passes the database result straight back to the component", async () => {
    const result = { centers: [{ id: centerId }], error: null };
    dbMocks.findCentersForService.mockResolvedValue(result);

    await expect(findHelpCenters(serviceId, "Guwahati")).resolves.toBe(result);
  });
});

describe("trackCenterContactClick", () => {
  it("returns ok:false for ids that are not uuids", async () => {
    await expect(trackCenterContactClick("not-a-uuid", serviceId)).resolves.toEqual({ ok: false });
    expect(dbMocks.recordContactClick).not.toHaveBeenCalled();
  });

  it("records the click for a valid pair of ids", async () => {
    dbMocks.recordContactClick.mockResolvedValue(undefined);

    await expect(trackCenterContactClick(centerId, serviceId)).resolves.toEqual({ ok: true });
    expect(dbMocks.recordContactClick).toHaveBeenCalledWith(centerId, serviceId);
  });

  it("swallows a database failure so the Call button still works", async () => {
    dbMocks.recordContactClick.mockRejectedValue(new Error("network down"));

    await expect(trackCenterContactClick(centerId, serviceId)).resolves.toEqual({ ok: false });
  });
});

describe("registerCenter", () => {
  const initialState = { status: "idle" as const, message: "" };

  it("returns the first validation problem and writes nothing", async () => {
    const result = await registerCenter(initialState, new FormData());

    expect(result).toEqual({ status: "error", message: centerMessages.nameRequired });
    expect(dbMocks.insertCenterRegistration).not.toHaveBeenCalled();
  });

  it("turns an empty WhatsApp box into null and reports success", async () => {
    dbMocks.insertCenterRegistration.mockResolvedValue({ id: centerId, error: null });

    const result = await registerCenter(initialState, validFormData());

    expect(dbMocks.insertCenterRegistration).toHaveBeenCalledWith({
      name: "Pragati CSC Center",
      address: "Shop 4, GS Road, Ward 9",
      city: "Guwahati",
      pincode: "781001",
      phone: "9876543210",
      whatsapp: null,
      serviceIds: [serviceId],
    });
    expect(result).toEqual({ status: "success", message: centerMessages.success });
  });

  it("reports a database failure as an error state, never as success", async () => {
    dbMocks.insertCenterRegistration.mockResolvedValue({ id: null, error: centerMessages.saveFailed });

    await expect(registerCenter(initialState, validFormData())).resolves.toEqual({
      status: "error",
      message: centerMessages.saveFailed,
    });
  });
});
