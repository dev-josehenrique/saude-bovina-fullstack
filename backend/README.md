# SGDSB — Back-end (Node.js + Express + Prisma)

API REST do Sistema de Gerenciamento de Dados para Saúde Bovina. Arquitetura em camadas:
`routes → controllers → services → Prisma (PostgreSQL)`.

## Instalação e execução

Requer Node.js 20 ou superior e um PostgreSQL acessível.

```bash
cp .env.example .env     # Windows (PowerShell): Copy-Item .env.example .env
                         # depois preencha DATABASE_URL e JWT_SECRET
npm install              # também roda "prisma generate" (script postinstall)
npm run db:setup         # prisma db push + seed (dados do trabalho de BD + usuário demo)
npm run dev              # nodemon; ou: npm start
```

> **Atenção (Windows):** pare a API antes de rodar `npm install` de novo. Com o servidor ligado, o Windows
> mantém o motor do Prisma em uso e o `prisma generate` falha com `EPERM`. Se isso acontecer, pare a API e
> rode `npx prisma generate`.

### Variáveis de ambiente (`.env.example`)

| Variável | Descrição |
|---|---|
| `PORT` | Porta da API (padrão 3001) |
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` | Segredo para assinar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (padrão `1d`) |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula (URL do front) |

Usuário demo do seed: `admin@fazenda.com` / `123456`.

## Endpoints

Base: `/api`. 🔒 = exige `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Status da API |
| POST | `/auth/register` | Cadastro `{nome, email, senha}` → `{usuario, token}` |
| POST | `/auth/login` | Login `{email, senha}` → `{usuario, token}` |
| GET 🔒 | `/auth/me` | Usuário autenticado |
| GET 🔒 | `/bovinos?busca=&sexo=&id_raca=` | Lista bovinos (filtros opcionais); inclui raça, matriz e piquete atual |
| GET 🔒 | `/bovinos/:id` | Detalhe com raça, matriz, filhos, pesagens, histórico, vacinas, tratamentos e piquetes |
| POST 🔒 | `/bovinos` | Cria `{nome, sexo, n_brinco, data_nascimento?, registro_po?, id_raca?, idbovino_matriz?}` |
| PUT 🔒 | `/bovinos/:id` | Atualiza (parcial) |
| DELETE 🔒 | `/bovinos/:id` | Remove o animal e seus registros dependentes |
| POST 🔒 | `/bovinos/:id/pesagens` | Registra pesagem `{peso, data?}` |
| POST 🔒 | `/bovinos/:id/historico` | Nova ocorrência `{data, descricao}` (uma por animal por dia) |
| POST 🔒 | `/bovinos/:id/tratamentos` | Novo tratamento `{data, id_doenca, id_tipo_tratamento, id_veterinario, id_medicamento?, dose?}` |
| GET 🔒 | `/piquetes` | Lista piquetes com nº de animais atuais |
| GET 🔒 | `/piquetes/:id` | Detalhe com os animais que estão no piquete agora |
| POST 🔒 | `/piquetes` | Cria `{nome, lotacao_max, id_propriedade}` |
| GET 🔒 | `/veterinarios` | Lista veterinários com total de tratamentos |
| GET 🔒 | `/veterinarios/:id` | Detalhe com tratamentos e animais atendidos |
| POST 🔒 | `/veterinarios` | Cria `{nome, crmv}` (CRMV único) |
| PUT 🔒 | `/veterinarios/:id` | Atualiza nome/CRMV (parcial) |
| GET 🔒 | `/tratamentos?id_veterinario=&id_bovino=&id_tipo_tratamento=&limite=` | Lista tratamentos, mais recentes primeiro |
| POST 🔒 | `/vacinacoes/lote` | Vacina vários animais `{id_vacina` ou `nova_vacina:{marca,antigeno}`, `dose, data, ids:[...]}` |
| GET 🔒 | `/racas`, `/propriedades`, `/vacinas`, `/tipos-tratamento`, `/doencas`, `/medicamentos` | Leitura das entidades relacionadas |
| GET 🔒 | `/relatorios/veterinarios` | Animais tratados por veterinário |
| GET 🔒 | `/relatorios/peso-medio` | Peso médio atual de adultos (raça × sexo) |
| GET 🔒 | `/relatorios/lotacao-piquetes` | Histórico de lotação dos piquetes |

Erros seguem `{ "error": "mensagem", "details"?: [...] }` com status 400 (validação), 401, 404, 409 (duplicidade/FK) e 500.

### Exemplo (curl)

```bash
TOKEN=$(curl -s -X POST localhost:3001/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"admin@fazenda.com","senha":"123456"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl -H "Authorization: Bearer $TOKEN" localhost:3001/api/bovinos
```

## Decisões de design

- **Prisma sobre o DDL original**: os nomes de tabelas/colunas do trabalho de BD foram preservados com `@@map`; PKs compostas (`historico`, `pesagem`, `piquete_bovino`, `vacina_bovino`, `receita`) e chaves candidatas (`n_brinco`, `(data, id_bovino, id_tipo_tratamento)`) viraram `@@id`/`@@unique`.
- **Exclusão de bovino** em transação: o DDL original não tem `ON DELETE CASCADE`, então o service apaga os dependentes e desvincula os filhos (`idbovino_matriz = NULL`) antes.
- **Relatórios** usam `$queryRaw` com as mesmas consultas SQL (CTEs, `DISTINCT ON`, window functions) do trabalho original.
- **bcryptjs** (implementação em JS puro do bcrypt) evita compilação nativa no deploy.

## Deploy (ex.: Render)

Build: `npm install && npx prisma db push` · Start: `npm start` · defina as variáveis acima (e rode `npm run db:seed` uma vez).
