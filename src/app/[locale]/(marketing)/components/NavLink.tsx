import Link from 'next/link';

export function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={{ pathname: href }}
      className="inline-block px-2 py-1 text-sm rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  )
}
