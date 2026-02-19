
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_MUSEUM_DB;

async function inspect() {
    console.log(`\nInspecting Museum DB Property Types...`);
    try {
        const db = await notion.databases.retrieve({ database_id: DB_ID });
        const dsId = db.data_sources?.[0]?.id || DB_ID;
        
        const response = await notion.dataSources.query({
            data_source_id: dsId,
            page_size: 1,
        });
        
        if (response.results.length > 0) {
            const p = response.results[0].properties;
            console.log(`- 'מקורות':`, p['מקורות'] ? p['מקורות'].type : 'MISSING');
            console.log(`- 'תחום':`, p['תחום'] ? p['תחום'].type : 'MISSING');
            console.log(`- 'תגיות':`, p['תגיות'] ? p['תגיות'].type : 'MISSING');
            console.log(`- 'הערות':`, p['הערות'] ? p['הערות'].type : 'MISSING');
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

inspect();
