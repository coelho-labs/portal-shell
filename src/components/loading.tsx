import { Spinner } from "@/components/ui/spinner";
import { type ReactNode } from "react";

type LoadingProps = {
  children: ReactNode;
};

export function Loading({ children }: LoadingProps) {
  return (
    <div
      className="grid h-full w-full place-items-center p-6 lg:min-h-[calc(100svh-12rem)]"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Spinner className="size-6 text-foreground" />
        {children}
      </div>
    </div>
  );
}
