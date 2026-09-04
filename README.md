# Pizzaria Callidus — Integração completa Front-end + API REST + Banco

Este pacote contém a implementação integrada do site, incluindo catálogo, pedidos, cozinha, balcão, entrega, funcionários e persistência.

## 1. O que foi integrado

As listas JSON existentes:

- `public/api/todasPizzas.json`
- `public/api/todosCombos.json`
- `public/api/todasBebidas.json`

são utilizadas somente como **carga inicial**. Na primeira execução do backend, seus dados são importados para o banco quando as respectivas tabelas estão vazias.

Depois disso, o front-end consulta a API REST, e o banco passa a ser a fonte de verdade.

Entidades persistidas:

- pizzas
- combos
- bebidas
- extras
- configurações
- pedidos
- funcionários

## 2. Fluxo de pedidos

`Site/Balcão → API → Banco → Cozinha → Aguardando envio → Entrega → Entregue`

Status disponíveis:

- `recebido`
- `em_preparo`
- `aguardando_envio`
- `saiu_para_entrega`
- `entregue`
- `cancelado`

## 3. Principais rotas REST

### Catálogo

- GET/POST `/api/pizzas`
- GET/PUT/DELETE `/api/pizzas/:id`
- GET `/api/pizzas/:slug`
- GET/POST `/api/combos`
- GET/PUT/DELETE `/api/combos/:id`
- GET `/api/combos/:slug`
- GET/POST `/api/bebidas`
- GET/PUT/DELETE `/api/bebidas/:id`
- GET `/api/bebidas/:id`
- GET `/api/extras`

### Pedidos

- POST `/api/pedidos`
- GET `/api/pedidos`
- GET `/api/pedidos/:id`
- PATCH `/api/pedidos/:id/status`
- GET `/api/cozinha/pedidos`
- GET `/api/entrega/pedidos`

### Funcionários

- POST `/api/funcionarios`
- GET `/api/funcionarios`
- POST `/api/auth/login`

### Configuração

- GET `/api/configuracao`
- PUT `/api/configuracao`

### Saúde

- GET `/api/saude`

As antigas URLs `.json` continuam disponíveis para compatibilidade:

- `/api/todasPizzas.json`
- `/api/todosCombos.json`
- `/api/todasBebidas.json`

Elas também consultam o banco.

## 4. Banco de dados

### Desenvolvimento

Sem configuração adicional, o backend cria automaticamente:

`server/data/pizzaria.db`

### MySQL

Crie o banco:

```sql
CREATE DATABASE pizzaria_callidus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Depois configure:

```text
DATABASE_URL=mysql+pymysql://root:SENHA@localhost:3306/pizzaria_callidus
```

O SQLAlchemy cria as tabelas automaticamente.

## 5. Executar no Windows

### Backend

Execute:

`INICIAR_BACKEND.bat`

ou manualmente:

```bat
cd server
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

API:

`http://localhost:5001`

### Front-end

Execute:

`INICIAR_FRONTEND.bat`

ou:

```bat
npm install
npm run dev
```

O Vite encaminha `/api` para `http://localhost:5001`.

## 6. Integração do front-end

O front-end utiliza os services:

- `pizza.service.ts`
- `combo.service.ts`
- `bebida.service.ts`
- `extras.service.ts`
- `pedido.service.ts`

para acessar a API.

O pedido confirmado é persistido no backend. O Zustand permanece apenas para o estado local da interface, carrinho e acompanhamento temporário.

## 7. Cozinha

A cozinha consulta `/api/cozinha/pedidos` periodicamente.

Fluxo:

`recebido → em_preparo → aguardando_envio`

## 8. Entrega

O painel de entrega consulta `/api/entrega/pedidos`.

Fluxo:

`aguardando_envio → saiu_para_entrega → entregue`

## 9. Balcão/atendimento

O painel de balcão consulta os mesmos pedidos criados pelo site e pode acompanhar/alterar o fluxo permitido pela interface.

## 10. Estrutura principal

```text
Pizzaria-Callidus/
├── public/api/                 # JSON usados somente para seed/compatibilidade
├── server/
│   ├── app.py                  # API REST
│   ├── models.py               # Modelos do banco
│   ├── schema.sql              # criação do banco MySQL
│   ├── requirements.txt
│   └── data/                   # SQLite local
├── src/features/pizzaria/api/  # comunicação Front-end → API
├── src/features/funcionarios/  # balcão/cozinha/entrega
└── README.md
```

## 11. Importante

O banco é a fonte principal após a inicialização. Alterações feitas por API não precisam modificar os arquivos JSON.
