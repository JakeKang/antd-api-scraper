import { getPageBlocks, getDatabase } from '../lib/notion.js';

const DATABASE_ID = '3da653b635984ea08eb3df209572df86';

const extract = async (name, type) => {
  const database = await getDatabase(DATABASE_ID);

  const parentPage = database?.filter((datum) => {
    return (
      datum.properties?.page?.title[0]?.plain_text?.toLowerCase() ===
      name.toLowerCase()
    );
  });

  if (!parentPage) return console.error('undefined component');

  const { id: page_id } = parentPage[0];

  const pageBlocks = await getPageBlocks(page_id);
  const databaseId = pageBlocks?.results[0]?.id;

  if (!databaseId) return console.error('undefined page database');

  const componentId = await getDatabase(databaseId, {
    and: [
      {
        property: 'type',
        rich_text: {
          contains: type,
        },
      },
    ],
  });

  const { id } = componentId[0];

  if (!id) return console.error('undefined component_id');

  const componentPage = await getPageBlocks(id);

  const codeBlocks = [];

  await componentPage?.results?.forEach((datum) => {
    if (datum.code) {
      return codeBlocks.push({
        language: datum.code?.language || '',
        content: datum.code?.rich_text[0]?.text?.content || '',
      });
    }
  });

  if (codeBlocks.length > 0) {
    return codeBlocks;
  } else {
    return `No files to create.`;
  }
};

export { extract };
