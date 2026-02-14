
import 'dotenv/config';
import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DS1 = process.env.NOTION_HALL_OF_FAME_DS1;
const DS2 = process.env.NOTION_HALL_OF_FAME_DS2;

const notion = new Client({
  auth: NOTION_API_KEY,
});

async function checkDataSource(id, name) {
    console.log(`\nChecking Data Source ${name} (${id})...`);
    try {
        const response = await notion.dataSources.query({
            data_source_id: id,
            page_size: 1,
        });
        console.log(`✅ Success! Found ${response.results.length} items.`);
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function test() {
    console.log('Testing Hall of Fame IDs as Data Sources...');
    await checkDataSource(DS1, 'DS1 (Designers)');
    await checkDataSource(DS2, 'DS2 (Influential People)');
}

test();
