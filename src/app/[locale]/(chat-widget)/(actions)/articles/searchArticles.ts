import { ArticleSearchRes } from '@/entities/article';

export const searchArticles = async (
  orgId: string,
  lang: string,
  searchPhrase: string
): Promise<ArticleSearchRes[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/${lang}/articles/search?phrase=${searchPhrase}`
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json();
};
