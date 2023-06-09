import type { ReactNode } from 'react'

import type { Spacing } from '../tokens'
import { Box } from './Box'
import type { BoxStyles } from './Box.css'

type InsetProps = {
  bottom?: Spacing
  children?: ReactNode
  height?: BoxStyles['height']
  horizontal?: Spacing
  left?: Spacing
  right?: Spacing
  space?: Spacing
  top?: Spacing
  vertical?: Spacing
}

export function Inset({
  bottom,
  children,
  height,
  horizontal,
  left,
  right,
  space,
  top,
  vertical,
}: InsetProps) {
  return (
    <Box
      height={height}
      paddingTop={top ?? vertical ?? space}
      paddingBottom={bottom ?? vertical ?? space}
      paddingLeft={left ?? horizontal ?? space}
      paddingRight={right ?? horizontal ?? space}
      width='full'
    >
      {children}
    </Box>
  )
}
