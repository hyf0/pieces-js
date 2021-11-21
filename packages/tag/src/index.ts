/**
 * # example
 * ```tsx
 * import { css } from "@pieces/tag";
 * // ...
 * const Foo = () => {
 *   return (
 *     <div className={css`
 *       color: blue;
 *       font-size: 12px;
 *     `}>foo</div>
 *   );
 * }
```
 */
export const css = (
  _literals: TemplateStringsArray,
  ...expresstions: never[]
): string => {
  throw new SyntaxError("Do not call css(...) in runtime!");
};
