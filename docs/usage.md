# Usage

- [Overview](#Overview)
- [Syntax](#Syntax)
  - [Declaration](#Declaration)
  - [Pseudo-classes](#Pseudo-classes-and-Pseudo-elements)
  - [@Rule](#@At-rules)
  - [Nested rule](#Nested-rule)
- [Advanced](#Advanced)
  - [Dynamic styles](#Dynamic-styles)
- [Example](#Example)
  - [React](#React)

## Overview

```tsx
import { css } from '@pieces-js/tag'

const className = css`
  color: red;
  font-size: 24px;
  &:hover {
    color: blue;
  }
`

const className2 = css`
  color: red;
  font-size: 48px;
`

// --- will compile to ---

const className = 'c1 c2 c3'

const className2 = 'c1 c4'
```

with gennerated style

```css
.c1 {
  color: red;
}
.c2 {
  font-size: 24px;
}
.c3:hover {
  color: blue;
}
.c4 {
  font-size: 48px;
}
```

## Syntax

Supported syntax is listed below.

### Declaration

```tsx
const className = css`
  color: red;
  font-size: 24px;
`

// --- will compile to ---

const className = 'c1 c2'
```

with gennerated style

```css
.c1 {
  color: red;
}

.c2 {
  font-size: 24px;
}
```

### Pseudo-classes and Pseudo-elements with selector `&`

```tsx
import { css } from '@pieces-js/tag'

const className = css`
  color: red;
  &:hover {
    color: blue;
  }
  &::after {
    content: 'hello';
  }
`
// --- will compile to ---

const className = 'c1 c2 c3'
```

with gennerated style

```css
.c1 {
  color: red;
}
.c2:hover {
  color: blue;
}
.c3::after {
  content: 'hello';
}
```

### At-rules

__pieces-js will only include At-rules and won't do any transfrom on it.__

```tsx
const className = css`
  color: red;
  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
  &:hover {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
`

// --- will compile to ---

const className = 'c1 c2'
```

with generated style

```css
.c1 {
  color: red;
}
.c2:hover {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
```

### Nested rule

This is not supported.

# Advanced

## Dynamic styles

```tsx
import React from 'react'
import { css } from '@pieces-js/tag'

export function Box({ size }) {
  return (
    <div
      className={css`
        height: var(--box-size);
        width: var(--box-size);
      `}
      style={{ '--box-size': size }}
    />
  )
}
```

### FYI

- [Dynamic styles with css tag](https://github.com/callstack/linaria/blob/master/docs/DYNAMIC_STYLES.md)


# Example

## React

```tsx
import { css } from '@pieces-js/tag'

const Foo = () => {
  return (
    <div
      className={css`
        color: red;
      `}
    >
      Foo
    </div>
  )
}
```



