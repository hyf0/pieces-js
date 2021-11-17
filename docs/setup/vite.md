# Vite

## React

```ts
// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pieces from '@pieces-js/plugin';

export default defineConfig({
  plugins: [pieces.vite(), react()],
});
```

## Vue3

```ts
// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import pieces from '@pieces-js/plugin'

export default defineConfig({
  // Order matters.
  plugins: [vue(), pieces.vite()],
})

```