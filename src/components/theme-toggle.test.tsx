import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle.tsx";

const STORAGE_KEY = "coelho-theme";

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
  user = userEvent.setup();
});

describe("Given a theme toggle and the system prefers light", () => {
  beforeEach(() => {
    stubMatchMedia(false);
  });

  describe("when the trigger is clicked", () => {
    beforeEach(async () => {
      render(<ThemeToggle />);
      await user.click(screen.getByRole("button", { name: "Alternar tema" }));
    });

    it("then it should offer the light option", async () => {
      expect(
        await screen.findByRole("menuitem", { name: "Light" }),
      ).toBeInTheDocument();
    });

    it("then it should offer the dark option", async () => {
      expect(
        await screen.findByRole("menuitem", { name: "Dark" }),
      ).toBeInTheDocument();
    });

    it("then it should offer the system option", async () => {
      expect(
        await screen.findByRole("menuitem", { name: "System" }),
      ).toBeInTheDocument();
    });
  });
});

describe("Given an open theme menu and the system prefers light", () => {
  beforeEach(async () => {
    stubMatchMedia(false);
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "Alternar tema" }));
    await screen.findByRole("menuitem", { name: "Dark" });
  });

  describe("when the user chooses dark", () => {
    beforeEach(async () => {
      await user.click(screen.getByRole("menuitem", { name: "Dark" }));
    });

    it("then it should persist the dark theme", () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
    });

    it("then it should mark the document as dark", () => {
      expect(document.documentElement).toHaveClass("dark");
    });

    it("then it should set the document color scheme to dark", () => {
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  describe("when the user chooses light", () => {
    beforeEach(async () => {
      await user.click(screen.getByRole("menuitem", { name: "Light" }));
    });

    it("then it should persist the light theme", () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
    });

    it("then it should not mark the document as dark", () => {
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });
});

describe("Given an open theme menu with a stored light theme and the system prefers dark", () => {
  beforeEach(async () => {
    stubMatchMedia(true);
    localStorage.setItem(STORAGE_KEY, "light");
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: "Alternar tema" }));
    await screen.findByRole("menuitem", { name: "System" });
  });

  describe("when the user chooses system", () => {
    beforeEach(async () => {
      await user.click(screen.getByRole("menuitem", { name: "System" }));
    });

    it("then it should persist the system theme", () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe("system");
    });

    it("then it should resolve the system preference to dark", () => {
      expect(document.documentElement).toHaveClass("dark");
    });
  });
});
