# Governança do Banco de Dados Unificado

## Visão Geral

Este portfólio corporativo utiliza um **único banco de dados** (Supabase) compartilhado entre todas as aplicações. Cada aplicação é responsável por um domínio funcional específico e possui um **prefixo de tabela** que identifica seu domínio.

---

## Prefixos de Domínio

| Prefixo | Aplicação             | Descrição                                      |
|---------|----------------------|------------------------------------------------|
| `fcst_` | `forecast-comercial` | Oportunidades, clientes, pipeline comercial    |
| `flop_` | `fluxo-operacional`  | Projetos, objetivos, tarefas operacionais      |
| `prtc_` | `portal-corporativo` | Portais internos/externos, perfis corporativos |
| `pepl_` | `gestao-pessoal`     | Responsáveis, dados de pessoas                 |

---

## Regras de Acesso

### 1. Leitura (SELECT)
✅ **Todas as aplicações podem fazer `SELECT` em qualquer tabela do banco de dados.**

Isso é necessário porque os dados são interrelacionados. Por exemplo, a aplicação `forecast-comercial` precisa listar os nomes dos responsáveis da tabela `pepl_responsibles` para exibi-los em dropdowns.

### 2. Escrita (INSERT, UPDATE, DELETE)
🔒 **Apenas a aplicação dona do prefixo pode manipular (INSERT, UPDATE, DELETE) as tabelas do seu domínio.**

Exemplos:
- Somente `gestao-pessoal` pode cadastrar, alterar ou excluir registros em `pepl_responsibles`.
- Somente `forecast-comercial` pode manipular `fcst_opportunities`, `fcst_clients`, etc.
- Somente `fluxo-operacional` pode manipular `flop_projetos`, `flop_tarefas`, etc.
- Somente `portal-corporativo` pode manipular `prtc_portals`, `prtc_profiles`, etc.

### 3. Criação de Tabelas
Toda nova tabela criada deve seguir o padrão de prefixo da aplicação responsável.

---

## Instruções para Agentes de IA

Se você é uma IA trabalhando em alguma aplicação deste portfólio, siga estas orientações obrigatórias:

1. **Identifique seu domínio**: Verifique qual aplicação você está modificando e qual é o seu prefixo.
2. **Somente leitura em tabelas alheias**: Se sua aplicação precisa de dados de outra tabela (outro prefixo), use apenas `SELECT`. Nunca faça `INSERT`, `UPDATE` ou `DELETE` em tabelas que não pertencem ao seu prefixo.
3. **Consulte este arquivo**: Antes de criar ou alterar qualquer tabela, consulte o `schema-unico.sql` para entender a estrutura atual do banco.
4. **Mantenha o schema atualizado**: Ao criar ou alterar tabelas do seu domínio, atualize também o `schema-unico.sql` nesta pasta.
5. **Prefixo obrigatório**: Toda nova tabela criada deve usar o prefixo da aplicação responsável pelo domínio funcional.

---

## Estrutura do Portfólio

```
defy-corporativo/
├── database-unico/          ← Você está aqui
│   ├── GOVERNANCA.md        ← Este arquivo
│   └── schema-unico.sql    ← Schema completo do banco (apenas contexto)
├── forecast-comercial-2/    ← Aplicação de forecast comercial (fcst_)
├── fluxo-operacional/       ← Aplicação de fluxo operacional (flop_)
├── portal-corporativo/      ← Portal corporativo (prtc_)
└── gestao-pessoal/          ← Gestão de pessoal (pepl_)
```

---

## Resumo da Regra

> **Todas as aplicações podem ler todas as tabelas. Apenas a aplicação dona do assunto pode escrever nas tabelas do seu prefixo.**
