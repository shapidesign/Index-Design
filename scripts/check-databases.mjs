
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const IDs = {
    'NOTION_DATABASE_ID (Resources)': process.env.NOTION_DATABASE_ID,
    'NOTION_MUSEUM_DB (Museum)': process.env.NOTION_MUSEUM_DB,
    'NOTION_HALL_OF_FAME_DS1': process.env.NOTION_HALL_OF_FAME_DS1,
    'NOTION_HALL_OF_FAME_DS2': process.env.NOTION_HALL_OF_FAME_DS2,
};

async function check(label, id) {
    if (!id) {
        console.log(`❌ ${label}: ID is missing`);
        return;
    }
    
    // Clean ID (remove dashes for consistency in display, though API handles both usually)
    const cleanId = id.replace(/-/g, '');
    console.log(`\nChecking ${label} (${cleanId})...`);

    try {
        // Try as Database
        const db = await notion.databases.retrieve({ database_id: id });
        const title = db.title?.[0]?.plain_text || 'Untitled';
        console.log(`✅ Found DATABASE: "${title}"`);
        return;
    } catch (e) {
        // console.log(`   Not a database: ${e.message}`);
    }

    try {
        // Try as Data Source (by querying it)
        const ds = await notion.dataSources.query({ data_source_id: id, page_size: 1 });
        // We can't easily get the title from a data source query result directly, 
        // but if it succeeds, it exists.
        console.log(`✅ Found DATA SOURCE (Query successful). (Cannot fetch title directly via API for DS ID)`);
        
        // Try to see if we can find the parent database for this data source?
        // No direct way.
        return;
    } catch (e) {
        console.log(`❌ Failed to retrieve as Database or Data Source: ${e.message}`);
    }
}

async function run() {
    for (const [label, id] of Object.entries(IDs)) {
        await check(label, id);
    }
}

run();
