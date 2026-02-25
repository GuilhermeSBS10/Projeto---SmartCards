# SmartCards Front-end

Front-end do projeto SmartCards (faculdade), com foco em organização por camadas para facilitar integração com backend.

## Tecnologias

- HTML
- CSS
- JavaScript (ES Modules)
- Persistência local temporária via `localStorage`

## Estrutura

- `index.html`: landing page
- `pages/`: telas internas (`login`, `cadastro`, `dashboard`, `materia`, `study`, `stats`)
- `css/`: estilos base + estilos por página
- `js/services/api.js`: camada de requisições HTTP
- `js/auth/auth.js`: autenticação/sessão
- `js/modules/`: lógica por página
- `js/utils/`: utilitários (storage, data, helpers)
- `assets/`: imagens, ícones, fontes

## Como rodar

Como o projeto usa módulos ES, rode com servidor local (não abrir via `file://`).

Exemplo com Python:

```bash
cd "FlashCards (Front-end)"
python3 -m http.server 5500
```

Depois acesse:

- `http://localhost:5500/`

## Status atual

- UI/UX e navegação: prontas
- Tema claro/escuro: pronto e persistido no `localStorage`
- Fluxo de estudo: pronto (cartão flip, avaliação, histórico local)
- Login/cadastro: conectados à camada `api.js`
- Dashboard/Stats/Matéria: ainda com dados locais (migração gradual para API)

## Integração com backend

Guia completo em:

- `README-INTEGRACAO.md`

Resumo:

1. Backend implementa endpoints do contrato.
2. Front consome via `js/services/api.js`.
3. Migração dos módulos locais para API ocorre sem quebrar telas.

## Convenções importantes

- Evitar `fetch` direto em `modules/*`.
- Centralizar chamadas em `api.js`.
- Manter nomes de campos consistentes com o contrato.

## Próximos passos recomendados

1. Migrar `materia.js` para CRUD via API.
2. Migrar `study.js` para envio de resultados em API.
3. Migrar `dashboard.js` e `stats.js` para endpoints de estatística.
4. Substituir mensagens simples por componente de feedback unificado (toasts já baseados em `helpers.js`).
