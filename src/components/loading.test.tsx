import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Loading } from "@/components/loading.tsx";

let container: HTMLElement;

describe("Given a loading state with a message", () => {
  describe("when it renders", () => {
    beforeEach(() => {
      const rendered = render(
        <Loading>
          <p>Carregando pagina inicial...</p>
        </Loading>,
      );
      container = rendered.container;
    });

    it("then it should mark the region as busy", () => {
      expect(container.firstElementChild).toHaveAttribute(
        "aria-busy",
        "true",
      );
    });

    it("then it should expose the spinner to assistive technology", () => {
      expect(
        screen.getByRole("status", { name: "Loading" }),
      ).toBeInTheDocument();
    });

    it("then it should render the provided message", () => {
      expect(
        screen.getByText("Carregando pagina inicial..."),
      ).toBeInTheDocument();
    });
  });
});
