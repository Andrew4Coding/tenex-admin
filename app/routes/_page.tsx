import { Outlet } from "react-router";
import { ThemeProvider } from "~/components/context/theme-provider";

export default function PageLayout() {
    return (
        <ThemeProvider>
            <main className="h-screen overflow-hidden font-tiktok">
                <Outlet />
            </main>
        </ThemeProvider>
    )
}