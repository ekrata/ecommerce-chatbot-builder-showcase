import fs from 'fs';
import fsProm from 'fs/promises';
import { BaseLanguageModel } from 'langchain/base_language';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI, ChatOpenAICallOptions } from 'langchain/chat_models/openai';
import { Embeddings } from 'langchain/dist/embeddings/base';
import { TextLoader } from 'langchain/document_loaders/fs/text';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BedrockEmbeddings } from 'langchain/embeddings/bedrock';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Bedrock } from 'langchain/llms/bedrock';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { ChainTool } from 'langchain/tools';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { Bucket } from 'sst/node/bucket';
import { Config } from 'sst/node/config';
import { Table } from 'sst/node/table';

import { GetObjectCommand, S3, S3Client } from '@aws-sdk/client-s3';

import { getAppDb } from '../../../db';
import { toolset } from '../toolsets';

// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// const retrievalLlm = new O({
//   model: 'meta.llama2-13b-chat-v1', // You can also do e.g. "anthropic.claude-v2"
//   maxTokens: 480,
//   temperature: 0,

//   region: 'us-east-1',
//   modelKwargs: {},
// });

// const embeddings = new BedrockEmbeddings({
//   region: 'us-east-1',
//   model: 'amazon.titan-embed-text-v1', // Default value
// });

type ScopeParams = {
  orgId: string;
  lang: string;
};
const s3 = new S3Client({ region: Config.REGION });

const appDb = getAppDb(Config.REGION, Table.app.tableName);

export async function setup_knowledge_base(
  params: ScopeParams,
  llmRetrieval: BaseLanguageModel,
  embeddings: Embeddings,
) {
  const { orgId, lang } = params;
  const pklKey = `${orgId}/${lang}/faiss/docstore.json`;
  const faissKey = `${orgId}/${lang}/faiss/faiss.index`;
  if (!fs.existsSync(`/tmp/${pklKey}`)) {
    const getPkl = new GetObjectCommand({
      Bucket: Bucket?.['echat-app-assets'].bucketName,
      Key: pklKey,
    });
    const pklObject = await s3.send(getPkl);
    const pkl = await pklObject.Body?.transformToString();
    if (pkl) {
      await fsProm.writeFile(`/tmp/${pklKey}`, pkl);
    }
  } else if (!fs.existsSync(`/tmp/${faissKey}`)) {
    const getFaiss = new GetObjectCommand({
      Bucket: Bucket?.['echat-app-assets'].bucketName,
      Key: faissKey,
    });
    const faissObject = await s3.send(getFaiss);
    const faiss = await faissObject.Body?.transformToString();
    if (faiss) {
      await fsProm.writeFile(`/tmp/${faissKey}`, faiss);
    }
  }

  // const faissFile = await fsProm.readFile(`/tmp/${faissKey}`);
  // const pklFile = await fsProm.readFile(`/tmp/${pklKey}`);

  const vectorStore = await FaissStore.load(
    `/tmp/${orgId}/${lang}/faiss`,
    embeddings,
  );

  console.log('got vectorStore');
  if (vectorStore) {
    const knowledge_base = RetrievalQAChain.fromLLM(
      llmRetrieval,
      vectorStore?.asRetriever(),
    );
    return knowledge_base;
  }
}

/*
 * query to get_tools can be used to be embedded and relevant tools found
 * we only use one tool for now, but this is highly extensible!
 */

export async function get_tools(
  params: ScopeParams,
  llmRetrieval: BaseLanguageModel,
  embeddings: Embeddings,
) {
  console.log('getting tools');
  const chain = await setup_knowledge_base(params, llmRetrieval, embeddings);
  console.log('got tools');
  if (chain) {
    const tools = [
      new ChainTool({
        chain,
        name: 'Article Search',
        description: toolset['Article Search'],
      }),
    ];
    return tools;
  }
}

export async function setup_knowledge_base_test(query: string) {
  // const knowledge_base = await setup_knowledge_base(
  //   'sample_product_catalog.txt',
  //   retrievalLlm,
  // );
  // const response = await knowledge_base?.call({ query });
  // console.log(response);
  // if (response) {
  //   console.log('res', response);
  // }
}

setup_knowledge_base_test('What products do you have available?');
