import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App.tsx";

const loadRemote = vi.hoisted(() =>
  vi.fn((id: string) => Promise.resolve({ default: () => id })),
);

vi.mock("@module-federation/runtime", () => ({ loadRemote }));

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  window.history.replaceState({}, "", "/");
  user = userEvent.setup();
});

describe("Given the app shell open at the home route", () => {
  describe("when it renders", () => {
    beforeEach(async () => {
      render(<App />);
      await screen.findByRole("heading", { name: "Portal Coelho Labs" });
    });

    it("then it should expose the main landmark", () => {
      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("when the user clicks the Planning Poker link", () => {
    beforeEach(async () => {
      render(<App />);
      await user.click(screen.getByRole("link", { name: "Planning Poker" }));
    });

    it("then it should load the planning poker remote entry", () => {
      expect(loadRemote).toHaveBeenCalledWith("planning-poker/RemoteAppEntry");
    });

    it("then it should render the planning poker remote", async () => {
      expect(
        await screen.findByText("planning-poker/RemoteAppEntry"),
      ).toBeInTheDocument();
    });
  });

  describe("when the user clicks the JSON formatter link", () => {
    beforeEach(async () => {
      render(<App />);
      await user.click(screen.getByRole("link", { name: "Formatador JSON" }));
    });

    it("then it should load the json formatter remote entry", () => {
      expect(loadRemote).toHaveBeenCalledWith("json-formatter/RemoteAppEntry");
    });

    it("then it should render the json formatter remote", async () => {
      expect(
        await screen.findByText("json-formatter/RemoteAppEntry"),
      ).toBeInTheDocument();
    });
  });
});
