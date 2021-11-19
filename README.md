# pieces-js

A library that __transforms your regular CSS into Atomic CSS in compile time__. Heavily inspired by [stylex](https://www.youtube.com/watch?v=ur-sGzUWId4) and [linaria](https://github.com/callstack/linaria).

[Online Example with Vite](https://codesandbox.io/s/dazzling-sanderson-rzsv0)

# Features

- Transform your __regular CSS into Atomic CSS__ by compiler
- Easy to use with __familiar CSS syntax__
- __Zero runtime__ for a CSS-in-JS library
- __Compiling on demand__ in development
- No `xxx.config.js` 😉

# Documentation

- [Installation](#Installation)
- [Examples](#Examples)
- [Setup](./docs/setup)
  - [with Next.js](./docs/setup/next.md)
  - [with Vite](./docs/setup/vite.md)
  - [with Webpack](./docs/setup/webpack.md)
- [Usage](./docs/usage.md)
- [SSR](./docs/ssr.md)

# Installation

```
npm install @pieces-js/tag
npm install -D @pieces-js/plugin
// or
yarn add @pieces-js/tag
yarn add -D @pieces-js/plugin
```

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

<!-- # Examples

- [Webpack + React]()
- [Vite + React]() -->


