import { ArticleSearchRes } from '@/entities/article';

export const searchArticles = async (
  orgId: string,
  lang: string,
  phrase: string,
): Promise<ArticleSearchRes[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/lang/${lang}/articles/search?phrase=${phrase}`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  // TODO: this should simply be an array
  const data = await res.json();
  console.log(data['articleSearchResponse']);
  return data['articleSearchResponse'];
};
