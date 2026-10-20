// import { SupportDialog } from "@/components/support-dialog.tsx";

export function Footer() {
  return (
    <footer className="flex flex-col w-full max-w-7xl mx-auto items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 md:px-8">
      <p>
        Desenvolvido por{" "}
        <span className="font-medium text-foreground">Herivelton Coelho</span>
      </p>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/coelho-labs"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          Coelho Labs no GitHub
        </a>
        <span aria-hidden="true" className="text-muted-foreground/50">
          ·
        </span>
        <a
          href="https://github.com/hericoelho"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-foreground hover:underline underline-offset-4"
        >
          GitHub de Herivelton Coelho
        </a>
        {/* <span aria-hidden="true" className="text-muted-foreground/50">
          ·
        </span> */}
        {/* <SupportDialog /> */}
      </div>
    </footer>
  );
}
