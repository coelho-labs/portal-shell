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

*   **Framework:** React 18+ com TypeScript.
*   **Build Tool:** Vite (utilizando `@originjs/vite-plugin-federation`).
*   **Estilização:** Tailwind CSS (Arquitetura de Grid Responsiva).
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
O layout foi projetado em **CSS Grid** para reservar "gavetas" laterais estáticas para anúncios (Skyscrapers). O uso de um Micro Frontend dedicado para o AdSense garante que o carregamento de scripts externos não bloqueie o render principal das ferramentas de negócio.

### 3. Integração de IA
O Portal consome serviços de IA através de um backend robusto em FastAPI, utilizando técnicas de *Few-shot prompting* para calibrar estimativas de esforço de forma neutra e técnica.

---

## ⚙️ Configuração Local

Este projeto depende de MFEs remotos para funcionar plenamente.

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

*Nota: Por ser um orquestrador, certifique-se de que os projetos remotos (ex: planning-poker-mfe) também estejam em execução para a renderização completa das rotas.*

---

## 📩 Contato

Desenvolvido por **Herivelton Coelho**  
[LinkedIn](https://linkedin.com) | [Portfólio Coelho Labs](https://github.com)
