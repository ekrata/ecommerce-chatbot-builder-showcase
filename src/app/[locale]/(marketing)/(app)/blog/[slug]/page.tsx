import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { lazy, Suspense } from 'react';

import getPosts, { getPost } from './(components)/getPosts';
import { PostBody } from './(components)/post-body';
import { Post } from './types';

// const { PostBody } = dynamic(async () => await import('./(components)/post-body'))

export default async function PostPage({
  params,
}: {
  params: {
    slug: string
  }
}) {
  const post = await getPost(params.slug)
  // notFound is a Next.js utility
  if (!post) return notFound()
  // Pass the post contents to MDX
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* @ts-expect-error Server Component */}
      <PostBody>{post?.body}</PostBody>
    </Suspense>
  )
}


export async function generateStaticParams() {
  const posts = await getPosts()
  // The params to pre-render the page with.
  // Without this, the page will be rendered at runtime
  return posts.map((post: Post | null) => ({ slug: post?.slug }))
}