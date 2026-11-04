import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App.tsx";

const loadRemote = vi.hoisted(() => vi.fn(async () => null));

vi.mock("@module-federation/runtime", () => ({ loadRemote }));

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <p>remote-error</p> : this.props.children;
  }
}

async function waitForLoadingToSettle(message: string) {
  await waitFor(() => {
    if (screen.queryByText(message)) {
      throw new Error("still loading");
    }
  });
}

let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  window.history.replaceState({}, "", "/");
  user = userEvent.setup();
});

describe("Given a remote that resolves without an entry and the app at home", () => {
  describe("when the user opens the Planning Poker route", () => {
    beforeEach(async () => {
      render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>,
      );
      await user.click(screen.getByRole("link", { name: "Planning Poker" }));
      await waitForLoadingToSettle("Carregando Planning Poker...");
    });

    it("then it should not surface a remote error", () => {
      expect(screen.queryByText("remote-error")).not.toBeInTheDocument();
    });
  });

  describe("when the user opens the JSON formatter route", () => {
    beforeEach(async () => {
      render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>,
      );
      await user.click(screen.getByRole("link", { name: "Formatador JSON" }));
      await waitForLoadingToSettle(
        "Carregando Formatador e Validador JSON...",
      );
    });

    it("then it should not surface a remote error", () => {
      expect(screen.queryByText("remote-error")).not.toBeInTheDocument();
    });
  });
});
