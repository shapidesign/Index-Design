
import 'dotenv/config';
import { Client } from '@notionhq/client';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DS1 = process.env.NOTION_HALL_OF_FAME_DS1;
const DS2 = process.env.NOTION_HALL_OF_FAME_DS2;

const notion = new Client({
  auth: NOTION_API_KEY,
});

async function checkDatabase(id, name) {
    console.log(`\nChecking ${name} (${id})...`);
    try {
        const db = await notion.databases.retrieve({ database_id: id });
        console.log(`✅ Success! Found DB: "${db.title?.[0]?.plain_text || 'Untitled'}"`);
        console.log(`   ID: ${db.id}`);
        if (db.data_sources) {
            console.log(`   Data Sources: ${JSON.stringify(db.data_sources)}`);
        } else {
            console.log(`   No data_sources field.`);
        }
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function test() {
    console.log('Testing Hall of Fame Databases...');
    await checkDatabase(DS1, 'DS1 (Designers)');
    await checkDatabase(DS2, 'DS2 (Influential People)');
}

test();
