import Image from 'next/image';
// app/(subpages)/blog/[slug]/components/markdown-components.tsx
import Link from 'next/link';
import { forwardRef, PropsWithChildren, ReactNode } from 'react';

export const mdxComponents: PropsWithChildren<{ a: any, img: any }> = {
  a: ({ children, ...props }: PropsWithChildren<JSX.IntrinsicElements["a"]>) => {
    return (
      <Link {...props} href={{ pathname: props.href || '' }}>
        {children}
      </Link>
    )
  },
  img: ({ children, ...props }: PropsWithChildren<React.ComponentProps<typeof Image>>) => {
    // You need to do some work here to get the width and height of the image.
    // See the details below for my solution.
    return <Image  {...props} />
  },
  // any other components you want to use in your markdown
}

import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}