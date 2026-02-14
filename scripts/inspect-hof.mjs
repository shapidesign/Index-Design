
import 'dotenv/config';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DS1 = process.env.NOTION_HALL_OF_FAME_DS1;
const DS2 = process.env.NOTION_HALL_OF_FAME_DS2;

async function inspect(id, name) {
    console.log(`\nInspecting ${name}...`);
    try {
        const response = await notion.dataSources.query({
            data_source_id: id,
            page_size: 1,
        });
        
        if (response.results.length === 0) {
            console.log('❌ No results found.');
            return;
        }

        const page = response.results[0];
        console.log('✅ Item found:', page.id);
        console.log('Properties:', Object.keys(page.properties));
        
        // Print full properties object to see types
        // console.log(JSON.stringify(page.properties, null, 2));
        
        // Check specific fields we rely on
        const p = page.properties;
        console.log(`- 'שם':`, p['שם'] ? p['שם'].type : 'MISSING');
        console.log(`- 'תמונה':`, p['תמונה'] ? p['תמונה'].type : 'MISSING');
        
        if (name.includes('DS1')) {
            console.log(`- 'תקופה':`, p['תקופה'] ? p['תקופה'].type : 'MISSING');
            console.log(`- 'תחום':`, p['תחום'] ? p['תחום'].type : 'MISSING');
            console.log(`- 'אתר אינטרנט':`, p['אתר אינטרנט'] ? p['אתר אינטרנט'].type : 'MISSING');
        } else {
            console.log(`- 'שנות פעילות':`, p['שנות פעילות'] ? p['שנות פעילות'].type : 'MISSING');
            console.log(`- 'תגיות':`, p['תגיות'] ? p['תגיות'].type : 'MISSING');
            console.log(`- 'קישור':`, p['קישור'] ? p['קישור'].type : 'MISSING');
        }

    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

async function run() {
    await inspect(DS1, 'DS1 (Designers)');
    await inspect(DS2, 'DS2 (Influential People)');
}

run();
