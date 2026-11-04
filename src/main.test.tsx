import { beforeEach, describe, expect, it, vi } from "vitest";

const { createRoot } = vi.hoisted(() => {
  const render = vi.fn();
  return { render, createRoot: vi.fn(() => ({ render })) };
});

vi.mock("react-dom/client", () => ({ createRoot }));
vi.mock("@/App.tsx", () => ({ default: () => null }));

describe("Given a document with a root element", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  describe("when the application entrypoint runs", () => {
    beforeEach(async () => {
      await import("@/main.tsx");
    });

    it("then it should mount the app on the root element", () => {
      expect(createRoot).toHaveBeenCalledWith(
        document.getElementById("root"),
      );
    });
  });
});
