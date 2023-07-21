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
  const [page, setPage] = pageState


  return (
    <div className="join">
      <button onClick={() => page > 1 && setPage(page - 1)} className={`join-item btn btn-ghost ${page === 1 && 'disabled'}`}>«</button>
      <button className="join-item btn btn-ghost">{page}</button>
      <button onClick={() => setPage(page + 1)} className="join-item btn btn-ghost">»</button>
    </div >
  )
}
