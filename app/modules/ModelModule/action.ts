import type { ActionFunctionArgs } from "react-router";

export async function ModelAction({ request }: ActionFunctionArgs) {
    const method = request.method;
    const formData = await request.formData();

    if (method === "POST") {
        const modelName = formData.get("modelName") as string;
        const data = Object.fromEntries(formData.entries());
    }
}
