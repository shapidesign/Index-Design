
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DB_ID = process.env.NOTION_MUSEUM_DB;

async function inspectValues() {
    console.log(`\nInspecting Museum DB Values (${DB_ID})...`);
    try {
        // 1. Get Data Source ID
        const db = await notion.databases.retrieve({ database_id: DB_ID });
        const dsId = db.data_sources?.[0]?.id || DB_ID;
        console.log(`Using ID: ${dsId}`);

        // 2. Query items
        const response = await notion.dataSources.query({
            data_source_id: dsId,
            page_size: 5,
        });
        
        console.log(`Found ${response.results.length} items.`);

        for (const page of response.results) {
            const p = page.properties;
            console.log('\n--- Item ---');
            console.log('ID:', page.id);
            
            // Check Name
            const nameTitle = p['Name']?.title;
            const nameVal = nameTitle?.[0]?.plain_text;
            console.log(`Name (raw):`, JSON.stringify(nameTitle));
            console.log(`Name (value): "${nameVal}"`);

            // Check Description
            const descRich = p['הערות']?.rich_text;
            const descVal = descRich?.[0]?.plain_text;
            console.log(`Description (value): "${descVal}"`);

            // Check Country
            const countryVal = p['מדינה/אזור']?.select?.name;
            console.log(`Country: "${countryVal}"`);
        }

    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

inspectValues();
