
import { fetch } from 'bun';

const BASE_URL = 'http://localhost:3002/mcp';

async function testResources() {
    console.log('Testing Resources...');

    // Test smart list (should be empty initially)
    // Note: xmcp HTTP transport resource endpoint might be different, usually it's via JSON-RPC or specific endpoints if configured.
    // But xmcp usually exposes a /mcp endpoint that handles JSON-RPC.
    // Let's try to use JSON-RPC to call resources/read.

    const smartRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'resources/read',
            params: { uri: 'todos://smart' }
        })
    });
    const smartData = await smartRes.json();
    console.log('Smart List Response:', JSON.stringify(smartData, null, 2));

    // Test SDK
    const sdkRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'resources/read',
            params: { uri: 'library://sdk' }
        })
    });
    const sdkData = await sdkRes.json();
    console.log('SDK Response Length:', sdkData.result?.contents?.[0]?.text?.length);
}

async function testRunScript() {
    console.log('Testing run_script...');

    // Add tasks
    const addScript = `
    db.sql("INSERT INTO todos (title, priority) VALUES ('Urgent Task', 'urgent')");
    db.sql("INSERT INTO todos (title, priority) VALUES ('Low Task', 'low')");
    db.sql("INSERT INTO todos (title, priority) VALUES ('High Task', 'high')");
    console.log('Tasks added');
  `;

    const addRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: {
                name: 'run_script',
                arguments: { script: addScript }
            }
        })
    });
    console.log('Add Tasks Response:', JSON.stringify(await addRes.json(), null, 2));

    // Verify sorting via smart resource
    const smartRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'resources/read',
            params: { uri: 'todos://smart' }
        })
    });
    const smartData = await smartRes.json();
    const tasks = JSON.parse(smartData.result.contents[0].text);
    console.log('Sorted Tasks:', tasks.map((t: any) => `${t.title} (${t.priority})`));

    // Test Timeout
    console.log('Testing Timeout...');
    const timeoutScript = `while (true) { } `;
    const timeoutRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 5,
            method: 'tools/call',
            params: {
                name: 'run_script',
                arguments: { script: timeoutScript }
            }
        })
    });
    console.log('Timeout Response:', JSON.stringify(await timeoutRes.json(), null, 2));
}

async function main() {
    try {
        await testResources();
        await testRunScript();
    } catch (e) {
        console.error(e);
    }
}

main();
