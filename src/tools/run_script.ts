import vm from 'node:vm';
import { z } from 'zod';
import { type InferSchema } from 'xmcp';
import { TodoEngine } from '../lib/TodoEngine';

export const schema = {
    script: z.string().describe('The JavaScript code to execute. You have access to a global `db` object (TodoEngine).'),
};

export const metadata = {
    name: 'run_script',
    description: 'Executes JavaScript code to manage tasks. You have access to a global `db` object. Use this for batch updates, complex filtering, or cleanups.',
};

export default async function runScript({ script }: InferSchema<typeof schema>) {
    const db = new TodoEngine();
    const logs: string[] = [];

    const context = {
        db,
        console: {
            log: (...args: any[]) => logs.push(args.map(a => String(a)).join(' ')),
            error: (...args: any[]) => logs.push('ERROR: ' + args.map(a => String(a)).join(' ')),
        },
    };

    vm.createContext(context);

    try {
        const result = vm.runInContext(script, context, {
            timeout: 5000, // 5s timeout
            displayErrors: true,
        });

        return {
            content: [
                {
                    type: 'text',
                    text: `Logs:\n${logs.join('\n')}\n\nReturn Value:\n${String(result)}`,
                },
            ],
        };
    } catch (error: any) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Logs:\n${logs.join('\n')}\n\nError:\n${error.message}`,
                },
            ],
            isError: true,
        };
    }
}
