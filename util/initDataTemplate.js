export default function makeData(component) {
  const data = {
    parent: { database_id: '3da653b635984ea08eb3df209572df86' },
    properties: {
      name: {
        title: [
          {
            text: {
              content: component.name || '',
            },
          },
        ],
      },
      type: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: component.type || '',
            },
          },
        ],
      },
      version: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: component.version || '',
            },
          },
        ],
      },
      state: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: component.state || '',
            },
          },
        ],
      },
    },
  };

  return data;
}
