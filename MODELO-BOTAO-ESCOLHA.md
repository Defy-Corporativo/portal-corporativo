# Modelo de Botão de Escolha (Choice Tabs)

> **Nota:** Este arquivo é temporário para documentação do padrão. Pode ser removido após copiar para o Design System.

---

## Descrição

O **Choice Tabs** é um componente de seleção exclusiva (single-select) que apresenta opções lado a lado em formato de abas/botões. É ideal para quando o usuário precisa escolher entre 2-4 opções mutuamente exclusivas.

### Características

- Visual limpo e moderno com container unificado
- Suporte a ícones para melhor identificação visual
- Estados claros de seleção (ativo/inativo)
- Transições suaves para feedback de interação
- Acessível e responsivo

---

## Estrutura HTML

```html
<div class="choice-tabs">
  <button type="button" class="choice-tab active">
    <svg><!-- Ícone opcional --></svg>
    Label da Opção A
  </button>
  <button type="button" class="choice-tab">
    <svg><!-- Ícone opcional --></svg>
    Label da Opção B
  </button>
</div>
```

---

## Tokens do Design System

### Variáveis Utilizadas

| Token | Valor Padrão | Uso |
|-------|--------------|-----|
| `--bg-main` | `#F8FAFC` | Background do container |
| `--bg-hover` | `#F1F5F9` | Background hover do botão inativo |
| `--border-color` | `#E2E8F0` | Borda do container |
| `--border-radius-sm` | `8px` | Arredondamento do container e botões |
| `--color-primary` | `#2563EB` | Background do botão ativo |
| `--text-primary` | `#0F172A` | Texto hover do botão inativo |
| `--text-secondary` | `#64748B` | Texto do botão inativo |
| `--font-size-sm` | `13px` | Tamanho da fonte |
| `--spacing-xs` | `4px` | Gap entre botões e padding do container |
| `--spacing-sm` | `8px` | Padding interno dos botões |
| `--transition-base` | `200ms cubic-bezier(0.4, 0, 0.2, 1)` | Transição de estados |

---

## CSS Completo

```css
/* Container do Choice Tabs */
.choice-tabs {
  display: flex;
  gap: var(--spacing-xs);
  background-color: var(--bg-main);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

/* Botão Individual (Tab) */
.choice-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-sm);
  background-color: transparent;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
}

/* Estado Hover (Inativo) */
.choice-tab:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* Estado Ativo (Selecionado) */
.choice-tab.active {
  background-color: var(--color-primary);
  color: white;
}

/* Estado Ativo não precisa de hover diferente */
.choice-tab.active:hover {
  background-color: var(--color-primary);
  color: white;
}
```

---

## Variantes

### Com Ícones (Recomendado)

```jsx
<div className="choice-tabs">
  <button className="choice-tab active">
    <Building2Icon size={16} />
    Soluções Internas
  </button>
  <button className="choice-tab">
    <GlobeIcon size={16} />
    Soluções Externas
  </button>
</div>
```

### Sem Ícones (Texto Apenas)

```jsx
<div className="choice-tabs">
  <button className="choice-tab active">
    Opção A
  </button>
  <button className="choice-tab">
    Opção B
  </button>
</div>
```

### Múltiplas Opções (3-4)

```jsx
<div className="choice-tabs">
  <button className="choice-tab active">Q1</button>
  <button className="choice-tab">Q2</button>
  <button className="choice-tab">Q3</button>
  <button className="choice-tab">Q4</button>
</div>
```

---

## Implementação React

### Componente Reutilizável

```jsx
import React from 'react';
import styles from './ChoiceTabs.module.css';

/**
 * ChoiceTabs - Componente de seleção exclusiva em formato de abas
 * 
 * @param {Object[]} options - Array de opções [{value, label, icon?}]
 * @param {string} value - Valor selecionado atualmente
 * @param {function} onChange - Callback quando o valor muda
 */
const ChoiceTabs = ({ options, value, onChange }) => {
  return (
    <div className={styles.choiceTabs}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.choiceTab} ${value === option.value ? styles.active : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.icon && option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ChoiceTabs;
```

### Exemplo de Uso

```jsx
import ChoiceTabs from './ChoiceTabs';
import { Building2, Globe } from 'lucide-react';

// Definir opções
const categoryOptions = [
  { value: 'internal', label: 'Soluções Internas', icon: <Building2 size={16} /> },
  { value: 'external', label: 'Soluções Externas', icon: <Globe size={16} /> },
];

// Uso no componente
<ChoiceTabs
  options={categoryOptions}
  value={formData.category}
  onChange={(value) => handleInputChange('category', value)}
/>
```

---

## Acessibilidade

- Usar `role="tablist"` no container e `role="tab"` nos botões para screen readers
- Adicionar `aria-selected="true"` no botão ativo
- Suportar navegação por teclado (setas esquerda/direita)

```jsx
<div className="choice-tabs" role="tablist">
  <button 
    role="tab" 
    aria-selected={isActive}
    className={`choice-tab ${isActive ? 'active' : ''}`}
  >
    ...
  </button>
</div>
```

---

## Responsividade

Em telas muito pequenas, o componente se adapta naturalmente pois usa `flex: 1` nos botões. Se necessário, pode-se aplicar:

```css
@media (max-width: 375px) {
  .choice-tabs {
    flex-direction: column;
  }
  
  .choice-tab {
    width: 100%;
  }
}
```

---

## Quando Usar

✅ **Use quando:**
- Há 2-4 opções mutuamente exclusivas
- As opções são de igual importância
- O usuário precisa visualizar todas as opções simultaneamente
- Há espaço horizontal suficiente

❌ **Não use quando:**
- Há mais de 4 opções (use dropdown ou radio)
- As opções têm tamanhos muito diferentes de texto
- É uma seleção múltipla (use checkboxes)
- O espaço é muito limitado (use dropdown)
