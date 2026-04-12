# Regra de Governança do Banco de Dados

Este projeto faz parte de um portfólio corporativo com banco de dados unificado.

## Regra Obrigatória

- **LEITURA**: Esta aplicação pode fazer `SELECT` em qualquer tabela do banco.
- **ESCRITA**: Esta aplicação só pode fazer `INSERT`, `UPDATE` ou `DELETE` em tabelas com o prefixo do seu domínio.

## Prefixos de Domínio

| Prefixo | Aplicação            |
|---------|---------------------|
| `fcst_` | forecast-comercial  |
| `flop_` | fluxo-operacional   |
| `prtc_` | portal-corporativo  |
| `pepl_` | gestao-pessoal      |

## Referência Completa

Consulte `/database-unico/GOVERNANCA.md` na raiz do portfólio para detalhes completos.
