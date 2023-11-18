
import { Link } from 'next-intl';
import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import getPosts from './[slug]/(components)/getPosts';
import styles from './styles.module.css';

// page.tsx
export default async function Page() {
  const posts = await getPosts()
  return <section aria-label={'posts'} className={` h-screen saturate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-700 via-rose-500 to-blue-800`}>
    <h4 className='justify-center pt-32 text-5xl tracking-wide text-center' >Ekrata Blog</h4>
    <div className='grid grid-cols-1 pt-10 mx-40 md:grid-cols-3 gap-x-4'>
      {posts?.map((post) => {
        // await unified()
        //   .use(remarkParse)
        //   .use(remarkHtml)
        //   .process(await read('example.md'))
        return (
          <Link href={`/blog/${post?.slug}`} className='w-full h-40 p-2 rounded-md shadow-2xl bg-white/25 backdrop-blur-md overflow-clip hover:bg-white/50 '>
            <h4 className='text-3xl' >{post?.title}</h4>
            <h5 className='text-lg'>{post?.subtitle}</h5>
            <p className="text-sm line-clamp-3" >{post?.content}</p>
          </Link>
        )
      })
      }
    </div>
  </section>
}