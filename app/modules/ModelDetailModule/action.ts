import { prisma } from "prisma/prisma";
import type { ActionFunctionArgs } from "react-router";

export async function ModelDetailAction({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    if (request.method === 'DELETE') {
        const model = formData.get('model') as string;

        if (!(model in prisma) || typeof (prisma as any)[model]?.delete !== 'function') {
            return { success: false, error: 'Invalid model' };
        }

        const id = formData.get('id') as string;
        const idField = formData.get('idField') as string;

        await (prisma as any)[model].delete({
            where: { 
                [idField]: id,
            },
        });

        return { success: true };
    }

    return { success: false, error: 'Unsupported action' };
}
