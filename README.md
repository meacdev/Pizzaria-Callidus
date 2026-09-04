# Pizzaria-Callidus

Feito por Matheus Eduardo Amazonas Costa, Matheus Pantoja Viana, Luiz Davi Freitas Franco, Josafá Lucena Menezes, Luis Gustavo Monteiro da Silva, para o módulo de React do professor Emmerson Santa Rita no projeto Callidus Academy 2.0 de 2026.

## Sobre o projeto

Este projeto é um Progressive Web App (PWA), baseada em recursos (*feature-based*), de venda de pizzas online que pode ser licenciado e customizado para diferentes pizzarias clientes.

Utiliza-se Vite como build tool e servidor de desenvolvimento, aproveitando ES Modules nativos e Hot Module Replacement (HMR).

> Para mais informações consulte [/docs](./docs)

### Domínio Público

O projeto está dispoível no Github Pages: https://meacdev.github.io/Pizzaria-Callidus/

## Como rodar localmente

### Pré-requisitos

- **Node.js** ≥ 20.x
- **npm**

### Instalação

```
git clone https://github.com/meacdev/Pizzaria-Callidus.git
cd Pizzaria-Callidus
npm install 
```

### Ambitente de desenvolvimento
```
npm run dev 
```
O service worker está funcionando em modo dev (`devOptions.enabled: true` no `vite.config.ts`), útil para testes.

### Build de produção + preview do build

```
npm run build
npm run preview
```

### Persistência de dados

A aplicação não depende de backend ou banco de dados externo: pedidos, customização e cardápio são persistidos no `localStorage` do navegador (via Zustand com o middleware `persist`). Não há variáveis de ambiente a configurar para rodar o projeto localmente.
