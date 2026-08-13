# 🏛️ Portal Shell (MFE Host) - Coelho Labs

O **Portal Shell** é o orquestrador central (Host) do ecossistema de ferramentas da **Coelho Labs**. Este projeto utiliza a arquitetura de **Micro Frontends (MFE)** para entregar uma experiência de usuário unificada, enquanto mantém o desenvolvimento e o deploy de suas funcionalidades totalmente desacoplados.

---

## 🚀 Visão Geral da Arquitetura

Este repositório atua como a "casca" da aplicação, sendo responsável por:

*   **Orquestração de Módulos:** Consumo dinâmico de micro-apps remotos via **Module Federation**.
*   **Layout Global:** Gerenciamento de Shell UI (Navbar, Sidebar e containers de anúncios).
*   **Gerenciamento de Estado Global:** Compartilhamento de contextos e autenticação entre MFEs.
*   **Monetização Não-Intrusiva:** Integração de uma camada de anúncios (AdSense) via projeto remoto dedicado, isolando scripts de terceiros da lógica de negócio.

---

## 🛠️ Stack Tecnológica

*   **Framework:** React 19 com TypeScript.
*   **Build Tool:** Vite (utilizando `@module-federation/vite`).
*   **Estilização:** Tailwind CSS v4 + shadcn/ui (Base UI + Nova) com tokens oklch e suporte a dark mode.
*   **Estratégia de Micro Frontends:** Module Federation (Runtime Integration).

---

## 🧩 O Ecossistema (Distribuição de Repositórios)

Para simular um ambiente corporativo de larga escala, o projeto foi dividido em repositórios independentes:

1.  **Portal Shell (Este repo):** O orquestrador central [Público].
2.  **[Planning Poker MFE](https://github.com):** Módulo de planning poker estimativa por IA [Público].
3.  **Metrics Engine:** Camada privada de anúncios e analytics [Privado].
4.  **Planning Poker Service:** Backend em Python/FastAPI com WebSockets e integração com LLMs [Privado].

---

## 🧠 Decisões de Engenharia

### 1. Por que Micro Frontends?
Diferente de um monólito, esta arquitetura permite que novas ferramentas (ex: Retro, Daily Check-in) sejam adicionadas ao portal sem a necessidade de re-deploy do Shell. Isso demonstra a viabilidade de escalar o time de desenvolvimento, onde cada squad poderia ser dono de uma ferramenta específica.

### 2. UI/UX e Monetização Estratégica
O layout usa **CSS Grid** para reservar "gavetas" laterais estáticas para anúncios (Skyscrapers). O uso de um Micro Frontend dedicado para o AdSense garante que o carregamento de scripts externos não bloqueie o render principal das ferramentas de negócio. O **Host é dono do tema**: controla o dark mode (`.dark` + `colorScheme`, chave `coelho-theme`) em runtime, e os remotes consomem os mesmos tokens de design — mantendo a identidade visual consistente entre módulos.

### 3. Integração de IA
O Portal consome serviços de IA através de um backend robusto em FastAPI, utilizando técnicas de *Few-shot prompting* para calibrar estimativas de esforço de forma neutra e técnica.

---

## 🎨 UI, Tema e Layout

*   **Design System:** shadcn/ui sobre **Tailwind v4** (CSS-first) e **Base UI** — componentes em `src/components/ui/`, tokens oklch em `src/index.css`, alias `@` para `src/`.
*   **Tema (cross-MFE):** o host alterna `.dark` no `<html>` via `useTheme()` (`src/hooks/use-theme.ts`), persiste em `coelho-theme` (localStorage) e evita flash com um script anti-FOUC no `index.html`. Os remotes duplicam os tokens e seguem o tema do host.
*   **Layout Core-driven:** header `sticky` com marca, navegação e seletor de tema; coluna central (`<main>`) flanqueada por gavetas laterais de 200px (slots de anúncio — integração com o remote de AdSense é futura).

---

## ⚙️ Configuração Local

Este projeto depende de MFEs remotos para funcionar plenamente.

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Verificação padrão de uma mudança
npm run lint
npm run build

# Preview do build de produção
npm run preview
```

*Nota: Por ser um orquestrador, certifique-se de que os projetos remotos (ex: planning-poker-mfe) também estejam em execução para a renderização completa das rotas.*

---

## 📩 Contato

Desenvolvido por **Herivelton Coelho**  
[LinkedIn](https://linkedin.com) | [Portfólio Coelho Labs](https://github.com)
