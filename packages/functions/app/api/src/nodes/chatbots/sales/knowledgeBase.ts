import { BaseLanguageModel } from 'langchain/base_language';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
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

// const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const retrievalLlm = new Bedrock({
  model: 'cohere.command-light-text-v14', // You can also do e.g. "anthropic.claude-v2"
  region: 'us-east-1',
  modelKwargs: {},
});

const embeddings = new BedrockEmbeddings({
  region: 'us-east-1',
  model: 'amazon.titan-embed-text-v1', // Default value
});

export async function loadSalesDocVectorStore(FileName: string) {
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
  llm: BaseLanguageModel,
) {
  const vectorStore = await loadSalesDocVectorStore(FileName);
  if (vectorStore) {
    const knowledge_base = RetrievalQAChain.fromLLM(
      retrievalLlm,
      vectorStore?.asRetriever(),
    );
    return knowledge_base;
  }
}

/*
 * query to get_tools can be used to be embedded and relevant tools found
 * we only use one tool for now, but this is highly extensible!
 */

export async function get_tools(product_catalog: string) {
  console.log('getting tools');
  const chain = await setup_knowledge_base(product_catalog, retrievalLlm);
  if (chain) {
    const tools = [
      new ChainTool({
        name: 'ProductSearch',
        description:
          'useful for when you need to answer questions about product information',
        chain,
      }),
    ];
    return tools;
  }
}

export async function setup_knowledge_base_test(query: string) {
  const knowledge_base = await setup_knowledge_base(
    'sample_product_catalog.txt',
    retrievalLlm,
  );

  const response = await knowledge_base?.call({ query });
  // if (response) {
  //   console.log('res', response);
  // }
}

setup_knowledge_base_test('What products do you have available?');
