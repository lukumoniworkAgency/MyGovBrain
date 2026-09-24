// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RegisterAgentForm } from "@/components/register-agent-form";
import { centerMessages, type ServiceOption } from "@/lib/center-links";

// Same pattern as find-help-nearby.test.tsx: replace the server action module so
// the test never touches the network. See that file for why the wrapper arrows
// are needed (vi.mock is hoisted above this declaration).
const actionMocks = {
  registerCenter: vi.fn(),
};

vi.mock("@/lib/center-actions", () => ({
  registerCenter: (previousState: unknown, formData: FormData) => actionMocks.registerCenter(previousState, formData),
}));

const services: ServiceOption[] = [
  { id: "6f1e6a3c-1f5a-4f0c-9c33-2b8d0e5a77aa", name: "Aadhaar Card Services", stateCode: "AS" },
  { id: "7a2f7b4d-2a6b-4f1d-8d44-3c9e1f6b88bb", name: "PAN Card Application", stateCode: "AS" },
];

beforeEach(() => {
  actionMocks.registerCenter.mockReset();
  // Default to a failure state; tests that need success override this.
  actionMocks.registerCenter.mockResolvedValue({ status: "error", message: centerMessages.saveFailed });
});

afterEach(() => {
  cleanup();
});

/** The form element, found through its submit button. */
function getForm() {
  const form = screen.getByRole("button", { name: "Submit for review" }).closest("form");
  if (!form) throw new Error("Submit button is not inside a form");
  return form;
}

function fillValidDetails() {
  fireEvent.change(screen.getByLabelText(/Center name/), { target: { value: "Pragati CSC Center" } });
  fireEvent.change(screen.getByLabelText(/Full address/), { target: { value: "Shop 4, GS Road, Ward 9" } });
  fireEvent.change(screen.getByLabelText(/City or town/), { target: { value: "Guwahati" } });
  fireEvent.change(screen.getByLabelText(/PIN code/), { target: { value: "781001" } });
  fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: "9876543210" } });
}

describe("RegisterAgentForm", () => {
  it("renders every field and one checkbox per service, labelled with its state code", () => {
    render(<RegisterAgentForm services={services} />);

    expect(screen.getByLabelText(/Center name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/City or town/)).toBeInTheDocument();
    expect(screen.getByLabelText(/PIN code/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone number/)).toBeInTheDocument();
    // WhatsApp is the only optional field.
    expect(screen.getByLabelText(/WhatsApp number/)).toBeInTheDocument();

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByRole("checkbox", { name: /Aadhaar Card Services/ })).toBeInTheDocument();
    // Both fixtures share the state code, so the label shows one per service.
    expect(screen.getAllByText("(AS)")).toHaveLength(2);
  });

  it("shows an instant message and skips the server call when required fields are missing", () => {
    render(<RegisterAgentForm services={services} />);

    fireEvent.submit(getForm());

    // The browser-side check stops the submission, so the action never runs.
    expect(screen.getByRole("alert")).toHaveTextContent(centerMessages.nameRequired);
    expect(actionMocks.registerCenter).not.toHaveBeenCalled();
  });

  it("rejects an invalid PIN code before contacting the server", () => {
    render(<RegisterAgentForm services={services} />);

    fillValidDetails();
    fireEvent.change(screen.getByLabelText(/PIN code/), { target: { value: "78100" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Aadhaar Card Services/ }));
    fireEvent.submit(getForm());

    expect(screen.getByRole("alert")).toHaveTextContent(centerMessages.pincodeInvalid);
    expect(actionMocks.registerCenter).not.toHaveBeenCalled();
  });

  it("sends the details, then shows the review confirmation instead of the form", async () => {
    actionMocks.registerCenter.mockResolvedValue({ status: "success", message: centerMessages.success });
    render(<RegisterAgentForm services={services} />);

    fillValidDetails();
    fireEvent.click(screen.getByRole("checkbox", { name: /Aadhaar Card Services/ }));
    fireEvent.submit(getForm());

    await waitFor(() => expect(screen.getByRole("heading", { name: centerMessages.success })).toBeInTheDocument());

    // What the action actually received: a FormData built from the fields.
    const [, formData] = actionMocks.registerCenter.mock.calls[0] as [unknown, FormData];
    expect(formData.get("name")).toBe("Pragati CSC Center");
    expect(formData.get("city")).toBe("Guwahati");
    expect(formData.get("whatsapp")).toBe("");
    expect(formData.getAll("service_ids")).toEqual([services[0].id]);

    // Nothing was published: the confirmation says the listing is pending.
    expect(screen.getByText(/pending review/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument();
  });

  it("keeps the form visible and shows the error when the save fails", async () => {
    actionMocks.registerCenter.mockResolvedValue({ status: "error", message: centerMessages.saveFailed });
    render(<RegisterAgentForm services={services} />);

    fillValidDetails();
    fireEvent.click(screen.getByRole("checkbox", { name: /Aadhaar Card Services/ }));
    fireEvent.submit(getForm());

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(centerMessages.saveFailed));
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeInTheDocument();
  });

  it("disables submission when the service list could not be loaded", () => {
    render(<RegisterAgentForm services={[]} servicesUnavailable />);

    expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(/service list could not be loaded/i);
  });
});
