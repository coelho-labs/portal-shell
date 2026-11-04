import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Home from "@/pages/home/Home.page.tsx";

describe("Given the home page", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <Home />
        </MemoryRouter>,
      );
    });

    it("then it should show the portal heading", () => {
      expect(
        screen.getByRole("heading", { name: "Portal Coelho Labs" }),
      ).toBeInTheDocument();
    });

    it("then it should link to the Planning Poker tool", () => {
      expect(
        screen.getByRole("link", { name: /planning poker/i }),
      ).toHaveAttribute("href", "/planning");
    });

    it("then it should link to the JSON formatter tool", () => {
      expect(
        screen.getByRole("link", { name: /formatador e validador json/i }),
      ).toHaveAttribute("href", "/json-formatter");
    });

    it("then it should describe both available tools", () => {
      expect(screen.getByText("Ferramentas")).toBeInTheDocument();
    });
  });
});
