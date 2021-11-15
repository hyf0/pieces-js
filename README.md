# pieces-js

Compile-time atomic CSS library. Heavily inspired by [stylex](https://www.youtube.com/watch?v=ur-sGzUWId4) and [linaria](https://github.com/callstack/linaria).

[Online Example with Vite](https://codesandbox.io/s/dazzling-sanderson-rzsv0)

# Feature

- Easy to use with __familiar CSS syntax__
- __Zero runtime__
- Transform your __regular CSS to be Atomic__ by compiler
- __Compiling on demand__ in development
- No `xxx.config.js` 😉

# TOC

- [Install](#Install)
- [Usage](#Usage)
  - [Dynamic styles](#Dynamic-styles)
  - [Setup with bundler](#Setup-with-bundler)
    - [with Next.js](#with-nextjs)
    - [with Vite](#with-Vite)
    - [with Webpack](#with-Webpack)
- [SSR](#SSR)
<!-- - [Limitations](#Limitations) -->

# Install

```
npm install @pieces-js/tag
npm install -D @pieces-js/plugin
// or
yarn add @pieces-js/tag
yarn add -D @pieces-js/plugin
```

# Usage

## Basic

```tsx
// Foo.tsx
import { css } from "@pieces-js/tag";

const Foo = () => {
  return (
    <div
      className={css`
        color: red;
      `}
    >
      Foo
    </div>
  );
};

// Bar.tsx
import { css } from "@pieces-js/tag";

const Bar = () => {
  return (
    <div
      className={css`
        color: red;
        font-size: 24px;
      `}
    >
      Bar
    </div>
  );
};

// will compile to

// Foo.tsx

const Foo = () => {
  return <div className={"_0ad5 _b04b"}>Foo</div>;
};

// Bar.tsx
import { css } from "@pieces-js/tag";

const Bar = () => {
  return <div className={"_0ad5"}>Bar</div>;
};
```

with gennerated style

```css
._b04b {
  font-size: 24px;
}

._0ad5 {
  color: red;
}
```

## Dynamic styles

```tsx
import React from "react";
import { css } from "@pieces-js/tag";

export function Box({ size }) {
  return (
    <div
      className={css`
        height: var(--box-size);
        width: var(--box-size);
      `}
      style={{ "--box-size": size }}
    />
  );
}
```


### FYI

- [Dynamic styles with css tag](https://github.com/callstack/linaria/blob/master/docs/DYNAMIC_STYLES.md)

## `&` selector

```tsx
import { css } from "@pieces-js/tag";

const Foo = () => {
  return (
    <div className={css`
      &:hover {
        animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
        transform: translate3d(0, 0, 0);
      }
    `}>foo</div>
  );
}
```

## Setup with bundler

### with Next.js

Follow the setup with Webpack. The official pieces-js plugin is in WIP.

### with Vite

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import piecesJs from "@pieces-js/plugin";

export default defineConfig({
  plugins: [piecesJs.vite(), react()],
});
```

### with Webpack

```ts
const piecesJs = require("@pieces-js/plugin");

module.exports = {
  //...
  plugins: [piecesJs.webpack()],
  //...
};
```

# SSR

## Webpack

As pieces-js just compile and extract your code into static css file, you could choose `isomorphic-style-loader` or `mini-css-extract-plugin` to implement SSR.

### FYI

- [Critical CSS extraction](https://github.com/callstack/linaria/blob/master/docs/CRITICAL_CSS.md)

## Next.js

If you are using pieces-js with Next.js, you don't need do anything.

<!-- # Limitations

## nested selector -->
