import { prisma } from "prisma/prisma";
import type { ActionFunctionArgs } from "react-router";

export async function action(args: ActionFunctionArgs) {
    const formData = await args.request.formData();

    const modelField = formData.get("modelField") as string;
    const modelName = formData.get("modelName") as string;
    const search = formData.get("search") as string;

    const options = await (prisma as any)[modelName].findMany({
        select: {
            [modelField]: true,
        },
        where: {
            [modelField]: {
                contains: search,
                mode: "insensitive",
            },
        },
        distinct: [modelField],
    }).then((data: any[]) => {
        return data.map((item) => item[modelField]).slice(0, 10);
    });


    return new Response(
        JSON.stringify({
            options,
            modelField,
            modelName,
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
            status: 200,
        }
    );
}