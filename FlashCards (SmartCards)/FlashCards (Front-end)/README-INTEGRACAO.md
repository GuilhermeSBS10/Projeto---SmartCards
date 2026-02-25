# Integracao Front x Back (SmartCards)

Este guia deixa claro o que o dev de backend precisa para conectar no front sem retrabalho.

## 1) Onde configurar URL da API

- Arquivo: `js/services/api.js`
- Variavel usada: `API_BASE_URL`
- Ordem de prioridade:
  1. `window.__SMARTCARDS_API_URL__`
  2. `localStorage["smartcards_api_url"]`
  3. fallback: `http://localhost:3000/api`

## 2) Arquivos de integracao (camadas)

- `js/services/api.js`: todas as chamadas HTTP.
- `js/auth/auth.js`: sessao, token, redirecionamento.
- `js/utils/storage.js`: persistencia local (token, usuario, tema).
- `js/modules/*`: regras de cada tela (dashboard, study, materia, stats).

Regra: evitar `fetch` direto dentro de `modules/*`; chamar `api.js`.

## 3) Contrato minimo esperado da API

### Auth

- `POST /auth/register`
  - body: `{ nome, email, senha }`
  - response: `{ user, accessToken, refreshToken? }`

- `POST /auth/login`
  - body: `{ email, senha }`
  - response: `{ user, accessToken, refreshToken? }`

- `GET /auth/me`
  - header: `Authorization: Bearer <token>`
  - response: `{ id, nome, email }`

### Materias

- `GET /materias`
- `GET /materias/:materiaId`
- `POST /materias`
- `PUT /materias/:materiaId`
- `DELETE /materias/:materiaId`

Modelo recomendado de materia:

```json
{
  "id": "mat_01",
  "nome": "Biologia",
  "questoes": []
}
```

### Questoes

- `GET /materias/:materiaId/questoes`
- `POST /materias/:materiaId/questoes`
- `PUT /materias/:materiaId/questoes/:questaoId`
- `DELETE /materias/:materiaId/questoes/:questaoId`

Modelo recomendado de questao:

```json
{
  "id": "q_01",
  "enunciado": "Pergunta...",
  "alternativas": [
    { "letra": "A", "texto": "Opcao A" },
    { "letra": "B", "texto": "Opcao B" }
  ],
  "correta": "A"
}
```

### Estudo e estatisticas

- `POST /estudo/respostas`
  - body: `{ materiaId, questaoId, acertou, nota, data? }`

- `GET /estudo/progresso`
- `GET /stats/resumo`
- `GET /stats/diario?dias=7`

## 4) Padrao de erro

Quando houver erro, preferir:

```json
{
  "message": "Descricao do erro",
  "code": "VALIDATION_ERROR"
}
```

O `api.js` ja tenta ler `message` automaticamente.

## 5) Como ligar sem quebrar o front atual

Hoje o projeto usa `localStorage` nos modulos.
Estratégia segura:

1. Integrar `login/cadastro` usando `api.js` e `auth.js`.
2. Em `materia.js`, trocar gradualmente `ler/salvar` local por `get/create/update/delete`.
3. Em `study.js`, enviar resultado com `sendStudyResult`.
4. Em `dashboard.js` e `stats.js`, trocar agregacoes locais por endpoints de stats.

Fazendo nessa ordem, o sistema continua funcional durante a migracao.

## 6) Checklist rapido para o dev backend

1. Confirmar nomes dos campos com o front.
2. Implementar endpoints do item 3.
3. Garantir CORS para origem do front.
4. Devolver JSON em sucesso e erro.
5. Validar token Bearer nas rotas protegidas.
