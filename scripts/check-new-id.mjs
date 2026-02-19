
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NEW_ID = '3051fb04f583808b9101e0ebfc9aa61e';

async function check() {
    console.log(`Checking new ID: ${NEW_ID}...`);
    try {
        const db = await notion.databases.retrieve({ database_id: NEW_ID });
        console.log(`✅ Found DATABASE: "${db.title?.[0]?.plain_text || 'Untitled'}"`);
    } catch (e) {
        console.log(`❌ Failed as Database: ${e.message}`);
        try {
            await notion.dataSources.query({ data_source_id: NEW_ID, page_size: 1 });
            console.log(`✅ Found as DATA SOURCE.`);
        } catch (e2) {
            console.log(`❌ Failed as Data Source: ${e2.message}`);
        }
    }
}

check();
