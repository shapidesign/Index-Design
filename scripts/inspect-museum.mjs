
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_MUSEUM_DB;

async function inspect() {
    console.log(`\nInspecting Museum DB (${DB_ID})...`);
    try {
        const db = await notion.databases.retrieve({ database_id: DB_ID });
        console.log(`✅ Retrieved Database: "${db.title?.[0]?.plain_text}"`);
        
        let dsId = null;
        if (db.data_sources && db.data_sources.length > 0) {
            dsId = db.data_sources[0].id;
            console.log(`✅ Found Data Source ID: ${dsId}`);
        } else {
            console.log(`⚠️ No Data Source ID found. Using DB ID.`);
            dsId = DB_ID;
        }

        console.log(`Querying Data Source ${dsId}...`);
        const response = await notion.dataSources.query({
            data_source_id: dsId,
            page_size: 1,
        });
        
        if (response.results.length === 0) {
            console.log('❌ No results found.');
            return;
        }

        const page = response.results[0];
        console.log('✅ Item found:', page.id);
        console.log('Properties:', Object.keys(page.properties));
        
        const p = page.properties;
        console.log(`- 'שם':`, p['שם'] ? p['שם'].type : 'MISSING');
        console.log(`- 'תיאור':`, p['תיאור'] ? p['תיאור'].type : 'MISSING');
        console.log(`- 'מדינה/אזור':`, p['מדינה/אזור'] ? p['מדינה/אזור'].type : 'MISSING');
        console.log(`- 'סוג':`, p['סוג'] ? p['סוג'].type : 'MISSING');
        console.log(`- 'קישור':`, p['קישור'] ? p['קישור'].type : 'MISSING');
        console.log(`- 'תמונה':`, p['תמונה'] ? p['תמונה'].type : 'MISSING');

    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

inspect();
