import { BaseLanguageModel } from 'langchain/base_language';
import { RetrievalQAChain } from 'langchain/chains';
import {
  ChatOpenAI,
  ChatOpenAICallOptions,
} from 'langchain/chat_models/openai';
import { Embeddings } from 'langchain/dist/embeddings/base';
import { TextLoader } from 'langchain/document_loaders/fs/text';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BedrockEmbeddings } from 'langchain/embeddings/bedrock';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { Bedrock } from 'langchain/llms/bedrock';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { ChainTool } from 'langchain/tools';
import { FaissStore } from 'langchain/vectorstores/faiss';
import * as path from 'path';
import { Config } from 'sst/node/config';
import * as url from 'url';

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

export async function loadSalesDocVectorStore(
  FileName: string,
  embeddings: Embeddings,
) {
  // your knowledge path
  const fullpath = path.resolve(
    `packages/functions/app/api/src/nodes/chatbots/sales/knowledge/${FileName}`,
  );
  const loader = new TextLoader(fullpath);
  const docs = await loader.load();
  // console.log(docs);
  const splitter = new CharacterTextSplitter({
    chunkSize: 10,
    chunkOverlap: 0,
  });
  const newDocs = await splitter.splitDocuments(docs);
  try {
    const vectorDb = await FaissStore.fromDocuments(newDocs, embeddings);
    return vectorDb;
  } catch (err) {
    console.log(err);
  }
}

export async function setup_knowledge_base(
  FileName: string,
  llmRetrieval: BaseLanguageModel,
  embeddings: Embeddings,
) {
  const vectorStore = await loadSalesDocVectorStore(FileName, embeddings);
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
  product_catalog: string,
  llmRetrieval: BaseLanguageModel,
  embeddings: Embeddings,
) {
  console.log('getting tools');
  const chain = await setup_knowledge_base(
    product_catalog,
    llmRetrieval,
    embeddings,
  );
  if (chain) {
    const tools = [
      new ChainTool({
        chain,
        name: 'Product Search',
        description: toolset['Product Search'],
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
