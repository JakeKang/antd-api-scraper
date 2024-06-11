import { Client } from '@notionhq/client';

const notionClient = new Client({
  auth: 'notion-secret-key',
});

export async function getDatabase(database_id, filter) {
  if (filter) {
    const { results } = await notionClient.databases.query({
      database_id: database_id,
      filter: filter,
    });

    return results;
  } else {
    const { results } = await notionClient.databases.query({
      database_id: database_id,
    });

    return results;
  }
}

export async function getPage(page_id) {
  const res = await notionClient.pages.retrieve(
    page_id,
    (query = { block_children: { recursive: True } }),
  );
  return res;
}

export async function getPageBlocks(page_id) {
  const res = await notionClient.blocks.children.list({ block_id: page_id });

  return res;
}

export async function getBlock(block_id) {
  const res = await notionClient.blocks.retrieve({ block_id });

  return res;
}

export async function createPage(data) {
  const response = await notionClient.pages.create(data);

  return response;
}

const notion = {
  getPage,
  getPageBlocks,
  getBlock,
  createPage,
};

export default notion;
