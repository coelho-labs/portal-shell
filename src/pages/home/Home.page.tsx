import { Link } from "react-router-dom";
import { ArrowRight, Braces, Spade } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TOOLS = [
  {
    to: "/planning",
    icon: Spade,
    title: "Planning Poker",
    description:
      "Salas dinâmicas em tempo real para estimativas ágeis do seu time, com o suporte de IA para sugestões pontuais de esforço.",
  },
  {
    to: "/json-formatter",
    icon: Braces,
    title: "Formatador e Validador JSON",
    description:
      "Formate, valide e analise seus payloads JSON em segundos — com suporte a visualização em árvore e execução 100% no cliente.",
  },
];

function Home() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <section className="flex flex-col items-center gap-3 px-5 pt-10 pb-8 text-center lg:gap-5 lg:pt-14">
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          Coelho Labs
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          Portal Coelho Labs
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Um hub de ferramentas inteligentes, rápidas e minimalistas projetado
          para impulsionar a produtividade e a colaboração de equipes de
          tecnologia.
        </p>
      </section>
      <section className="my-auto px-5 pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Ferramentas
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.to}
                  to={tool.to}
                  className="block h-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Card className="h-full transition-shadow duration-200 hover:shadow-md hover:ring-primary/30">
                    <CardHeader className="gap-3">
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon
                            className="h-5 w-5 text-foreground"
                            aria-hidden="true"
                          />
                        </span>
                        <ArrowRight
                          className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover/card:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </div>
                      <CardTitle>{tool.title}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
