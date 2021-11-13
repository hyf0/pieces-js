# pieces-js (WIP)

Compile-time atomic css.

Heavily inspired by [stylex](https://twitter.com/ReactWeb/status/1459575294432473091) and [linaria](https://github.com/callstack/linaria).

## Example: https://github.com/iheyunfei/pieces-js-example

# install
```
npm install @pieces-js/tag
npm install -D @pieces-js/plugin
// or
yarn add @pieces-js/tag
yarn add -D @pieces-js/plugin
```

# Usage

```tsx
import { css } from '@pieces-js/tag'
import { FC } from "react";

const Foo: FC = () => {
  return (
    <div className={css`
      color: red;
      font-size: 24px;
      border: 1px black solid;
    `}>foo</div>
  );
}

export default Bar;
```

## setup with bundler

### with Vite

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vitePlugin as piecesJs } from '@pieces-js/plugin'

export default defineConfig({
  plugins: [piecesJs(), react()],
})
```