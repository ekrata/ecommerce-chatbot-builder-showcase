
import { Link } from 'next-intl';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import getPosts from './[slug]/(components)/getPosts';
import styles from './styles.module.css';

// page.tsx
export default async function Page() {
  const posts = await getPosts()
  return <section aria-label={'posts'} className={` h-screen saturate-100 bg-white`}>
    <h4 className='justify-center pt-32 text-5xl tracking-wide text-center' >Ekrata Blog</h4>
    <div className='grid grid-cols-1 pt-10 mx-40 md:grid-cols-3 gap-x-4 gap-y-4'>
      {posts?.map((post) => {
        // await unified()
        //   .use(remarkParse)
        //   .use(remarkHtml)
        //   .process(await read('example.md'))
        return (
          <Link href={`/blog/${post?.slug}`} className='w-full mockup-code ease-in-out hover:transition hover:transform hover:-translate-y-4 duration-1000 h-40 p-4 -ml-4 text-white rounded-md shadow-2xl  backdrop-blur-md overflow-clip  bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/75 via-rose-500/75 to-blue-600/75 skew-y-6 '>
            <h4 className='text-xl underline underline-[1px] ' ><code>{post?.title}</code></h4>
            <h5 className='text-xs '><code >{post?.subtitle}</code></h5>
            <p className="text-sm line-clamp-3 code-mockup"> <code>{post?.content}</code></p>
          </Link>
        )
      })
      }
    </div>
  </section >
}