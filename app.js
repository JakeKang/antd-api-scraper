import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

import { createPage } from './lib/notion.js';
import makeData from './util/initDataTemplate.js';
import { extract } from './util/gridaDatabase.js';

import gridaComponents from './data/gridaComponents.js';
import components from './data/components.js';

const port = 3000;
const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome!');
});

// Make File for Notion Data
app.post('/api/notion/extract', async (req, res) => {
  const { component, type } = req.body;

  if (!component || !type)
    return res.status(500).send({ error: 'Data errors' });

  try {
    const data = await extract(component, type);

    const dirPath = path.join(__dirname, 'files');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    await data?.forEach((code) => {
      const parentPath = path.join(__dirname, 'files', component);
      const dirPath = path.join(__dirname, 'files', component, type);
      const filePath = path.join(dirPath, `${component}.${type}`);

      if (!fs.existsSync(parentPath)) {
        fs.mkdirSync(parentPath, (err) => {
          if (err) throw err;
          console.log(`'${dirPath}' directory created successfully!`);
        });
      } else {
        console.log(`'${dirPath}' directory already exists!`);
      }

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, (err) => {
          if (err) throw err;
          console.log(`'${dirPath}' directory created successfully!`);
        });
      } else {
        console.log(`'${dirPath}' directory already exists!`);
      }

      if (code.language === 'yaml') {
        const yamlStr = yaml.dump(code.content);
        fs.writeFileSync(filePath, yamlStr);
      } else {
        fs.writeFileSync(filePath, code.content);
      }
    });

    return res
      .status(200)
      .send({ success: `${data.length} file creation complete.` });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: true });
  }
});

// Create initial data
app.get('/api/notion/init', (req, res) => {
  try {
    gridaComponents.map(async (component) => {
      const data = makeData(component);
      await createPage(data);
    });

    return res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: true });
  }
});

// Antd API Documentation Scraper
app.get('/api/scrap', (req, res) => {
  components.map(async (component, index) => {
    await axios
      .get(`https://ant.design/components/${component}`)
      .then((res) => {
        const $ = cheerio.load(res.data);
        const rows = [];
        // antd api table dom structure
        $('.component-api-table tbody').each((_, element) => {
          $(element)
            .find('tr')
            .each((_, ele) => {
              const children = $(ele).children();
              rows.push({
                property: $(children[0]).text() || '',
                description: $(children[1]).text() || '',
                type: $(children[2]).text() || '',
                default: $(children[3]).text() || '',
              });
            });
        });

        const dirPath = path.join(__dirname, 'yamls');
        const filePath = path.join(dirPath, `${component}.yaml`);
        const yamlStr = yaml.dump({ [components[index]]: rows });

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }

        fs.writeFileSync(filePath, yamlStr);
      })
      .catch((err) => {
        return console.error(err);
      });
  });
});

app.listen(port, () => {
  console.log(`Server Established and  running on Port ⚡${port}`);
});
