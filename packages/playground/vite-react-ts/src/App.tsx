import { useState } from 'react'
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

function App() {

  return (
    <div>
    <div className={className}>hello</div>
    <div className={className2}>world</div>
    </div>
  )
}

export default App
