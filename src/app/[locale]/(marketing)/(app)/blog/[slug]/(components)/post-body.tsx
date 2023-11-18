'use server'
// app/(subpages)/blog/[slug]/components/post-body.tsx

import { MDXComponents } from 'mdx/types';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
// import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';

import { mdxComponents } from './markdown-components';

export async function PostBody({ children }: { children: string }) {
  return (
    <>
      {/* @ts-expect-error Server Component */}
      < MDXRemote
        source={children}
        options={{
          mdxOptions: {
            remarkPlugins: [
              // Adds support for GitHub Flavored Markdown
              remarkGfm,
              // generates a table of contents based on headings
              remarkToc,
            ],
            // These work together to add IDs and linkify headings
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeSanitize],
          },
        }
        }
        components={mdxComponents as MDXComponents}
      />
    </>
  )
}