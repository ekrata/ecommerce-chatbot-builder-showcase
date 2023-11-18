import { useTranslations } from 'next-intl';
import { Dispatch } from 'react';

/**
 * Each key should hold a cursor value that returns the entries for that exact page.
 * This means the first page will always be undefined. 
 * @date 09/07/2023 - 11:54:17
 *
 * @export
 * @typedef {PageCursor}
 */
export type PageCursor = Record<number, string | undefined>

interface Props {
  pageState: [number, Dispatch<number>]

}

export const Pagination: React.FC<Props> = ({ pageState }) => {
  const t = useTranslations('dash')
  const [page, setPage] = pageState


  return (
    <div className="flex justify-between w-full p-2 ">
      <button onClick={() => page > 0 && setPage(page - 1)} className={`normal-case rounded-md btn btn-sm  ${page === 1 && 'disabled'}`}>{t('Previous')}</button>
      <button className="">{page + 1}</button>
      <button onClick={() => setPage(page + 1)} className="normal-case rounded-md btn btn-sm ">{t('Next')}</button>
    </div >
  )
}
