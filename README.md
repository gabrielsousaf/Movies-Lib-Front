# 🎬 Movies Lib - Frontend Action Plan

Este documento contém o planejamento e o roteiro passo a passo para o desenvolvimento do frontend do **Movies Lib**, construído com **Next.js** (App Router).

## 🗂 1. Estrutura Inicial e Configurações Básicas
- [ ] **Limpar o boilerplate:** Remover código padrão do Next.js (`app/page.tsx`, `app/globals.css`, etc.) e definir um estilo base limpo.
- [ ] **Variáveis de Ambiente:** Criar arquivo `.env.local` para armazenar a URL da API do backend (`movies-lib-api`) ou serviços externos como TMDB.
- [ ] **Padronização e Paths:** Verificar se o `tsconfig.json` possui os atalhos de pastas (`@/components`, `@/services`, etc.).
- [ ] **Bibliotecas e Ferramentas:**
  - Ícones: Instalar pacote de ícones (ex: `lucide-react` ou `react-icons`).
  - Requisições: Configurar cliente de API (Axios ou utilizar o Fetch nativo com funções utilitárias).
  - UI (Opcional): Configurar biblioteca de componentes acessíveis como Shadcn UI ou seguir com TailwindCSS puro.

## 🧱 2. Componentes de Base (UI)
- [ ] **Layout Principal (`layout.tsx`):**
  - `Header`: Barra superior contendo a logo, links de navegação e a barra de busca de filmes.
  - `Footer`: Rodapé com informações do projeto.
- [ ] **`MovieCard`:** Componente para exibir um filme individual nas listagens (Imagem do pôster, título, ano e avaliação).
- [ ] **Skeletons/Loadings:** Skeletons visuais para o estado de carregamento dos filmes, melhorando a experiência do usuário (UX).

## 📡 3. Comunicação com a API (Services)
- [ ] **Setup da API:** Criar a estrutura em `services/api.ts` para conectar com o backend.
- [ ] **Funções de Busca:**
  - Listar filmes em destaque / populares.
  - Buscar detalhes completos de um filme específico pelo ID.
  - Buscar filmes com base em um termo de pesquisa digitado pelo usuário.
  - *(Se houver)*: Chamadas para criação de usuário, login e salvamento de filmes favoritos.

## 🗺️ 4. Páginas e Roteamento
- [ ] **Página Inicial (`/`):**
  - Listagem principal dos filmes consumindo a API.
- [ ] **Página de Busca (`/search?q=termo`):**
  - Capturar o parâmetro de query e exibir os resultados correspondentes ou uma mensagem de "Nenhum filme encontrado".
- [ ] **Página de Detalhes (`/movie/[id]`):**
  - Mostrar o banner/poster do filme, sinopse, duração, orçamento, receita e gêneros.
- [ ] **Tratamento de Erros:**
  - Criar o `app/not-found.tsx` (Página 404 personalizada).
  - Criar o `app/error.tsx` para falhas nas requisições.

## ✨ 5. Funcionalidades Extras (Próximos Passos)
- [ ] **Paginação / Infinite Scroll:** Para navegar por páginas com muitos resultados.
- [ ] **Filtros Adicionais:** Filtrar filmes por gênero, nota e ano.
- [ ] **Sistema de Favoritos:** Permitir que o usuário "salve" filmes para ver depois (usando backend ou local storage).

---

## 🚀 Como começar?

Para darmos o primeiro passo, me diga o que prefere atacar primeiro:
1. Limpar a estrutura inicial, configurar fontes/Tailwind e criar o Header?
2. Criar o design do `MovieCard` com dados falsos (mock) para vermos a aparência?
3. Já preparar a conexão com sua API do backend (`movies-lib-api`)?
