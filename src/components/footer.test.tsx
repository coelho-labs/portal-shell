import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Footer } from "@/components/footer.tsx";

describe("Given the footer", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      render(<Footer />);
    });

    it("then it should credit Herivelton Coelho", () => {
      expect(screen.getByText("Herivelton Coelho")).toBeInTheDocument();
    });

    it("then the Coelho Labs link should point to the GitHub organization", () => {
      expect(
        screen.getByRole("link", { name: "Coelho Labs no GitHub" }),
      ).toHaveAttribute("href", "https://github.com/coelho-labs");
    });

    it("then the Coelho Labs link should open in a new tab", () => {
      expect(
        screen.getByRole("link", { name: "Coelho Labs no GitHub" }),
      ).toHaveAttribute("target", "_blank");
    });

    it("then the Coelho Labs link should not leak the referrer", () => {
      expect(
        screen.getByRole("link", { name: "Coelho Labs no GitHub" }),
      ).toHaveAttribute("rel", "noreferrer");
    });

    it("then the Herivelton Coelho link should point to his GitHub profile", () => {
      expect(
        screen.getByRole("link", { name: "GitHub de Herivelton Coelho" }),
      ).toHaveAttribute("href", "https://github.com/hericoelho");
    });

    it("then the Herivelton Coelho link should open in a new tab", () => {
      expect(
        screen.getByRole("link", { name: "GitHub de Herivelton Coelho" }),
      ).toHaveAttribute("target", "_blank");
    });

    it("then the Herivelton Coelho link should not leak the referrer", () => {
      expect(
        screen.getByRole("link", { name: "GitHub de Herivelton Coelho" }),
      ).toHaveAttribute("rel", "noreferrer");
    });
  });
});
