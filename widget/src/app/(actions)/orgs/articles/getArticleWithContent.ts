import { ArticleWithContent } from '@/entities/article';

export const getArticleWithContent = async (
  orgId: string,
  lang: string,
  articleId: string,
): Promise<ArticleWithContent> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}/lang/${lang}/articles/${articleId}/with-content`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return await res.json();
};
