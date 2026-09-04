# Banco de dados

```text
pizzas ─────────────── catálogo de pizzas
combos ─────────────── catálogo de combos
bebidas ────────────── catálogo de bebidas
extras ─────────────── adicionais para personalização
configuracoes ──────── identidade, horários, pagamentos e entrega
pedidos ────────────── pedidos e seu estado operacional
funcionarios ───────── usuários do painel (cozinheiro, garçom, entregador)
```

Os campos de listas (`ingredientes`, `tamanhos_disponiveis`, `itens`) e objetos de pedido (`cliente`, `endereco`, `pagamento`) são armazenados como JSON na coluna correspondente. Isso mantém o modelo simples e preserva exatamente o formato usado pelo front-end.

## Ordem operacional do pedido

1. Site/balcão envia `POST /api/pedidos`.
2. Pedido entra como `recebido`.
3. Cozinha consulta `GET /api/cozinha/pedidos`.
4. Cozinha muda para `em_preparo`.
5. Cozinha muda para `aguardando_envio`.
6. Entrega consulta `GET /api/entrega/pedidos`.
7. Entregador muda para `saiu_para_entrega`.
8. Entregador muda para `entregue`.

O status é único no banco, então todas as interfaces enxergam a mesma informação.
