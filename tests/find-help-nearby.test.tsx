// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FindHelpNearby } from "@/components/find-help-nearby";
import { buildContactMessage, buildWhatsAppLink, centerMessages, type HelpCenter } from "@/lib/center-links";
import { trustCopy } from "@/config/content";

/**
 * The component reaches the database through the server actions in
 * src/lib/center-actions.ts. Mocking that one module keeps this test about the
 * UI: no network, no Supabase, no database.
 *
 * Why the arrow-function indirection instead of referencing the mock directly?
 * `vi.mock` is hoisted above these declarations, so the factory body must not
 * read `actionMocks` while it runs. It only reads it later, inside the returned
 * functions, which is why a plain object works here.
 */
const actionMocks = {
  findHelpCenters: vi.fn(),
  trackCenterContactClick: vi.fn(),
};

vi.mock("@/lib/center-actions", () => ({
  findHelpCenters: (serviceId: string, location: string) => actionMocks.findHelpCenters(serviceId, location),
  trackCenterContactClick: (centerId: string, serviceId: string) => actionMocks.trackCenterContactClick(centerId, serviceId),
}));

const serviceId = "6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa";
const serviceName = "Aadhaar Card Services";

const listedCenter: HelpCenter = {
  id: "8b0f6d9e-8a2a-4a1b-9a9a-2b1c3d4e5f60",
  name: "Pragati CSC Center",
  address: "Shop 4, GS Road, Ward 9",
  city: "Guwahati",
  pincode: "781001",
  // whatsapp stays null on purpose: the WhatsApp button must fall back to the
  // phone number, which is the common case for a small center.
  phone: "9876543210",
  whatsapp: null,
  verified: true,
};

beforeEach(() => {
  actionMocks.findHelpCenters.mockReset();
  actionMocks.trackCenterContactClick.mockReset();
  actionMocks.findHelpCenters.mockResolvedValue({ centers: [], error: null });
  actionMocks.trackCenterContactClick.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
});

/** Types a location and presses Search, then waits for the round trip. */
async function searchFor(location: string) {
  fireEvent.change(screen.getByLabelText("Your city or PIN code"), { target: { value: location } });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
  await waitFor(() => expect(actionMocks.findHelpCenters).toHaveBeenCalled());
}

describe("FindHelpNearby", () => {
  it("renders the search box and queries nothing until the visitor searches", () => {
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    expect(screen.getByRole("heading", { name: "Find help nearby" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your city or PIN code")).toBeInTheDocument();
    expect(actionMocks.findHelpCenters).not.toHaveBeenCalled();
  });

  it("lists a matching center with a Verified badge, a tel link, and a pre-filled wa.me link", async () => {
    actionMocks.findHelpCenters.mockResolvedValue({ centers: [listedCenter], error: null });
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    await searchFor("Guwahati");

    // The service id and the typed city are both sent, so the server can filter.
    expect(actionMocks.findHelpCenters).toHaveBeenCalledWith(serviceId, "Guwahati");
    expect(await screen.findByText("Pragati CSC Center")).toBeInTheDocument();
    expect(screen.getByText("Shop 4, GS Road, Ward 9")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();

    // "Call" is a real tel: link so the phone app can take over.
    expect(screen.getByRole("link", { name: /^Call / })).toHaveAttribute("href", "tel:+919876543210");

    // WhatsApp falls back to the phone number and carries a message that tells
    // the agent where the lead came from and which service is needed.
    const expectedHref = buildWhatsAppLink("9876543210", buildContactMessage(trustCopy.platformName, serviceName));
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute("href", expectedHref);
  });

  it("records a contact click when Call is tapped", async () => {
    actionMocks.findHelpCenters.mockResolvedValue({ centers: [listedCenter], error: null });
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    await searchFor("Guwahati");
    fireEvent.click(await screen.findByRole("link", { name: /^Call / }));

    // Tracking is fire-and-forget: the component never awaits it, so the link
    // still opens even if the insert is slow or fails.
    expect(actionMocks.trackCenterContactClick).toHaveBeenCalledWith(listedCenter.id, serviceId);
  });

  it("hides the Verified badge for a center that is not verified", async () => {
    actionMocks.findHelpCenters.mockResolvedValue({ centers: [{ ...listedCenter, verified: false }], error: null });
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    await searchFor("781001");

    expect(await screen.findByText("Pragati CSC Center")).toBeInTheDocument();
    expect(screen.queryByText("Verified")).not.toBeInTheDocument();
  });

  it("falls back to the self-guide when no center matches the area", async () => {
    actionMocks.findHelpCenters.mockResolvedValue({ centers: [], error: null });
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    await searchFor("Dibrugarh");

    expect(await screen.findByText(/No centers found yet for/)).toBeInTheDocument();
    expect(screen.getByText(/Try the self-guide above instead/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get your center listed/ })).toHaveAttribute("href", "/register-agent");
  });

  it("shows the friendly message when the search itself fails", async () => {
    actionMocks.findHelpCenters.mockResolvedValue({ centers: [], error: centerMessages.searchFailed });
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    await searchFor("Guwahati");

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(centerMessages.searchFailed));
  });

  it("asks for a location instead of calling the server when the box is empty", () => {
    render(<FindHelpNearby serviceId={serviceId} serviceName={serviceName} />);

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(screen.getByRole("alert")).toHaveTextContent(centerMessages.locationRequired);
    expect(actionMocks.findHelpCenters).not.toHaveBeenCalled();
  });
});
