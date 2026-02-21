import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const tokenLine = envFile.split('\n').find(line => line.startsWith('APIFY_API_TOKEN='));
const token = tokenLine ? tokenLine.split('=')[1].trim() : null;

async function test() {
    // 既存のDatasetがあればID直接指定で良いのですが、まずは新規実行して中身を見ます。
    const url = `https://api.apify.com/v2/acts/apidojo~tweet-scraper/runs?token=${token}&waitForFinish=60`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            searchTerms: ["エンジニア"],
            searchMode: "live",
            maxItems: 2
        })
    });
    const result = await res.json();
    const datasetId = result.data.defaultDatasetId;
    if (datasetId) {
        const dRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=1`);
        const items = await dRes.json();
        console.log(JSON.stringify(items[0], null, 2));
    }
}
test();
