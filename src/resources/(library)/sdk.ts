import { type ResourceMetadata } from 'xmcp';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: ResourceMetadata = {
    name: 'sdk-source',
    title: 'TodoEngine SDK Source',
    description: 'Returns the TypeScript source code of the TodoEngine class. Use this to understand the API available in run_script.',
    mimeType: 'text/plain',
};

export default function handler() {
    const sdkPath = path.resolve(process.cwd(), 'src/lib/TodoEngine.ts');
    return fs.readFileSync(sdkPath, 'utf-8');
}
