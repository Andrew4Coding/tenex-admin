import { prisma } from "prisma/prisma";
import type { ActionFunctionArgs } from "react-router";

export async function QueryAction({ request }: ActionFunctionArgs) {
    console.log("HELLO!");

    try {
        const formData = await request.formData();
        const sql = String(formData.get('sql') || '').trim();
        if (!sql) {
            return { success: true, error: 'SQL query cannot be empty.' };
        }
        // Only allow SELECT queries for safety
        if (!/^select\s+/i.test(sql)) {
            return { success: false, error: 'Only SELECT queries are allowed.'}
        }
        // Basic sanitization: disallow semicolons (multi-statement), comments, and dangerous keywords
        if (/;|--|\/\*|drop|delete|update|insert|alter|create|grant|revoke|truncate/i.test(sql)) {
            return { success: false, error: 'Unsafe SQL query detected. Only simple SELECT queries are allowed.' };
        }
        // Run the query
        const rows = await prisma.$queryRawUnsafe(sql);

        return { success: true, data: rows };
    } catch (e: any) {
        console.log("Error executing query:", e);

        return { success: false, error: e.message || 'An error occurred while executing the query.' };
    }
}
