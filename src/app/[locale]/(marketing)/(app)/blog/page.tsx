
import { Link } from 'next-intl';

import { faker } from '@faker-js/faker';

import { gradients } from '../../../../../../stacks/entities/customer';
import getPosts from './[slug]/(components)/getPosts';
import styles from './styles.module.css';

// page.tsx
export default async function Page() {
  const posts = await getPosts()
  return <section aria-label={'posts'} className={` h-screen saturate-100 bg-white`}>
    <h4 className='justify-center pt-32 pb-10 text-5xl tracking-wide text-center' >Ekrata Blog</h4>
    <div className='grid grid-cols-1 pt-10 mx-40 md:grid-cols-3 gap-x-4 gap-y-4'>
      {posts?.map((post) => {
        // await unified()
        //   .use(remarkParse)
        //   .use(remarkHtml)
        //   .process(await read('example.md'))
        return (
          <Link href={`/blog/${post?.slug}`} className={`w-full ${faker.helpers.arrayElement(gradients)} h-40 p-4 -ml-4 space-y-2 text-white duration-1000 ease-in-out skew-y-6 rounded-md shadow-2xl mockup-code hover:transition hover:transform hover:-translate-y-4 backdrop-blur-md overflow-clip`}>
            <h4 className='text-xl ' >{post?.title}</h4>
            <h5 className='text-xs '>{post?.subtitle}</h5>
            <p className="text-sm line-clamp-3 code-mockup"> <code>{post?.content}</code></p>
          </Link>
        )
      })
      }
    </div>
  </section >
}