import Link from 'next/link';

export function NavLink({
  href,
  children,
  hash
}: {
  href: string
  hash?: string
  children: React.ReactNode
}) {
  return (
    <Link
      shallow
      href={{ pathname: href, hash: hash }}
      className="inline-block px-2 py-1 text-sm rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  )
}
