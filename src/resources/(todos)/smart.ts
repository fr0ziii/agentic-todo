import { type ResourceMetadata } from 'xmcp';
import { TodoEngine } from '../../lib/TodoEngine';

export const metadata: ResourceMetadata = {
    name: 'smart-list',
    title: 'Smart Task List',
    description: 'Returns active tasks sorted by Priority (Urgent -> Low) then by Age (Oldest -> Newest).',
    mimeType: 'application/json',
};

export default function handler() {
    const db = new TodoEngine();
    const tasks = db.getSmartList();
    return JSON.stringify(tasks, null, 2);
}
