import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "@/hooks/use-theme.ts";

const STORAGE_KEY = "coelho-theme";

type MatchMediaStub = {
  setMatches: (matches: boolean) => void;
  listenerCount: () => number;
};

function stubMatchMedia(initialMatches: boolean): MatchMediaStub {
  const state = { matches: initialMatches };
  const listeners = new Set<() => void>();

  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return state.matches;
    },
    media: query,
    onchange: null,
    addEventListener: (_event: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));

  return {
    setMatches(matches) {
      state.matches = matches;
      listeners.forEach((listener) => listener());
    },
    listenerCount: () => listeners.size,
  };
}

let result: { current: ReturnType<typeof useTheme> };
let unmount: () => void;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  document.documentElement.style.colorScheme = "";
});

describe("Given no theme stored and the system prefers light", () => {
  let media: MatchMediaStub;

  beforeEach(() => {
    media = stubMatchMedia(false);
  });

  describe("when the hook mounts", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
    });

    it("then it should fall back to the system theme", () => {
      expect(result.current.theme).toBe("system");
    });

    it("then it should resolve to light", () => {
      expect(result.current.resolved).toBe("light");
    });

    it("then it should not mark the document as dark", () => {
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("then it should set the document color scheme to light", () => {
      expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("then it should not persist a theme", () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe("when the system preference changes to dark", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
      act(() => {
        media.setMatches(true);
      });
    });

    it("then it should resolve to dark", () => {
      expect(result.current.resolved).toBe("dark");
    });

    it("then it should mark the document as dark", () => {
      expect(document.documentElement).toHaveClass("dark");
    });

    it("then it should set the document color scheme to dark", () => {
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  describe("when the hook unmounts", () => {
    beforeEach(() => {
      const rendered = renderHook(() => useTheme());
      unmount = rendered.unmount;
      act(() => {
        unmount();
      });
    });

    it("then it should stop listening to system preference changes", () => {
      expect(media.listenerCount()).toBe(0);
    });
  });
});

describe("Given a stored dark theme and the system prefers light", () => {
  beforeEach(() => {
    stubMatchMedia(false);
    localStorage.setItem(STORAGE_KEY, "dark");
  });

  describe("when the hook mounts", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
    });

    it("then it should keep the stored theme", () => {
      expect(result.current.theme).toBe("dark");
    });

    it("then it should resolve to dark", () => {
      expect(result.current.resolved).toBe("dark");
    });

    it("then it should mark the document as dark", () => {
      expect(document.documentElement).toHaveClass("dark");
    });

    it("then it should set the document color scheme to dark", () => {
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });
  });

  describe("when the theme changes to light", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
      act(() => {
        result.current.setTheme("light");
      });
    });

    it("then it should persist the light theme", () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
    });

    it("then it should resolve to light", () => {
      expect(result.current.resolved).toBe("light");
    });

    it("then it should remove the dark class from the document", () => {
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });
});

describe("Given a stored light theme and the system prefers dark", () => {
  let media: MatchMediaStub;

  beforeEach(() => {
    media = stubMatchMedia(true);
    localStorage.setItem(STORAGE_KEY, "light");
  });

  describe("when the system preference changes", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
      act(() => {
        media.setMatches(false);
      });
    });

    it("then it should keep resolving to light", () => {
      expect(result.current.resolved).toBe("light");
    });
  });
});

describe("Given a stored system theme and the system prefers dark", () => {
  beforeEach(() => {
    stubMatchMedia(true);
    localStorage.setItem(STORAGE_KEY, "system");
  });

  describe("when the theme changes to system", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
      act(() => {
        result.current.setTheme("system");
      });
    });

    it("then it should persist the system theme", () => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe("system");
    });

    it("then it should resolve to dark", () => {
      expect(result.current.resolved).toBe("dark");
    });
  });
});

describe("Given an invalid stored theme and the system prefers light", () => {
  beforeEach(() => {
    stubMatchMedia(false);
    localStorage.setItem(STORAGE_KEY, "blue");
  });

  describe("when the hook mounts", () => {
    beforeEach(() => {
      result = renderHook(() => useTheme()).result;
    });

    it("then it should fall back to the system theme", () => {
      expect(result.current.theme).toBe("system");
    });

    it("then it should resolve to light", () => {
      expect(result.current.resolved).toBe("light");
    });
  });
});
