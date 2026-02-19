import fs from 'fs';
import path from 'path';

try {
    const envPath = path.resolve(process.cwd(), 'local.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match && !line.startsWith('#')) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
        console.log('✅ Manually loaded local.env');
    }
} catch (e) {
    console.error('❌ Failed to load local.env manually', e);
}
