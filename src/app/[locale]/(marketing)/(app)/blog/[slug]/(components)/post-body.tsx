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
    <div className='justify-center shadow-md px-4 py-10 animate-fade-left md:mx-auto md:my-20 prose bg-white border-t-[1px] text-start max-w-screen'>
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
    </div>
  )
}