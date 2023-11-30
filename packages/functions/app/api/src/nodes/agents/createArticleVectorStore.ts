import { EntityItem } from 'electrodb';
import fs from 'fs/promises';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { FaissStore } from 'langchain/vectorstores/faiss';
import pLimit from 'p-limit';
import { Api, ApiHandler, usePathParams } from 'sst/node/api';
import { Bucket } from 'sst/node/bucket';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { Org } from '@/entities/org';
import { languageCodeMap, languageCodes, languages } from '@/types/lang';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as Sentry from '@sentry/serverless';

import { getAppDb } from '../../db';
import { getHttp } from '../../http';

const appDb = getAppDb(Config.REGION, Table.app.tableName);
const s3 = new S3Client({ region: Config.REGION });
const limit = pLimit(5);

export const handler = Sentry.AWSLambda.wrapHandler(
  ApiHandler(async () => {
    // const { orgId, lang } = usePathParams();
    // const body: CreateConversation = useJsonBody();

    try {
      console.log('getting articles');
      // refactor to get by last articleContent updated at
      let orgs: EntityItem<typeof Org>[] = [];
      let cursor = null;
      do {
        const orgRes = await appDb.entities.orgs.scan.go();
        cursor = orgRes?.cursor;
        orgs = [...orgs, ...orgRes?.data];
      } while (cursor != null);

      console.log(orgs);
      const articleContents = await Promise.all(
        orgs.map(async (org) => {
          console.log(org);
          return await Promise.all(
            (
              await Promise.all(
                languageCodes.map(async (lang) => {
                  console.log(org?.orgId, lang);
                  const articleContents =
                    await appDb.entities.articleContents.query
                      .byOrg({
                        orgId: org?.orgId,
                        lang,
                      })
                      .go({ limit: 200 });
                  console.log(articleContents);
                  return articleContents;
                }),
              )
            ).filter((articleContents) => articleContents.data?.length),
          );
        }),
      );

      const splitter = new CharacterTextSplitter({
        chunkSize: 20,
        chunkOverlap: 0,
      });
      // const newDocs = await splitter.splitDocuments(docs);
      console.log('splitting');
      // iterate over orgs
      const docs = await Promise.all(
        articleContents.map((articleContentLangs) => {
          console.log(articleContentLangs);
          return Promise.all(
            articleContentLangs.map(async (articleContentsByLang) => {
              if (articleContentsByLang?.data?.length) {
                console.log(articleContentsByLang);
                return {
                  [`${articleContentsByLang?.data?.[0]?.lang}`]: {
                    orgId: articleContentsByLang?.data?.[0].orgId,
                    lang: articleContentsByLang?.data?.[0].lang,
                    docs: await splitter.createDocuments(
                      articleContentsByLang?.data?.map((articleContent) => {
                        return articleContent.content;
                      }),
                    ),
                  },
                };
              }
            }),
          );
        }),
      );

      console.log('docs');
      await Promise.all(
        docs.map(async (orgDocs) => {
          console.log(orgDocs);
          return await Promise.all(
            orgDocs.filter(Boolean).map(async (langDocs) => {
              if (langDocs) {
                return await Promise.all(
                  Object.entries(langDocs).map(async ([_, docsByLang]) => {
                    console.log('in docsbylang');
                    const { orgId, lang, docs } = docsByLang;
                    const dir = `/tmp/${orgId}/${lang}/faiss`;
                    const vectorStore = await FaissStore.fromDocuments(
                      docs,
                      new OpenAIEmbeddings({
                        openAIApiKey: Config?.OPENAI_API_KEY,
                      }),
                    );

                    console.log('got vectorstore');
                    await vectorStore.save(dir);
                    // console.log(await fs.readdir(dir));
                    const faissIndex = new PutObjectCommand({
                      ACL: 'public-read',
                      Bucket: Bucket?.['echat-app-assets'].bucketName,
                      Key: `${orgId}/${lang}/faiss/faiss.index`,
                      Body: await fs.readFile(`${dir}/faiss.index`),
                    });
                    const pklIndex = new PutObjectCommand({
                      ACL: 'public-read',
                      Bucket: Bucket?.['echat-app-assets'].bucketName,
                      Key: `${orgId}/${lang}/faiss/docstore.json`,
                      Body: await fs.readFile(`${dir}/docstore.json`),
                    });
                    console.log('uploading');
                    await s3.send(faissIndex);
                    await s3.send(pklIndex);
                    return {
                      statusCode: 200,
                      body: `Succesfully updated the article store for ${orgId} ${lang}`,
                    };
                  }),
                );
              }
            }),
          );
        }),
      );
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      return {
        statusCode: 500,
        body: JSON.stringify(err),
      };
    }
  }),
);
