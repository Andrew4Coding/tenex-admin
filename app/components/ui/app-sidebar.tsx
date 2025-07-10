
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Button } from "./button";

export function AppSidebar({models}: {models?: string[]}) {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Database Models</SidebarGroupLabel>
                    <SidebarGroupContent className="max-h-96 overflow-auto">
                        <SidebarMenu>
                            {models?.map((model) => (
                                <SidebarMenuItem key={model}>
                                    <SidebarMenuButton asChild>
                                        <a href={`/${model}`}>
                                            <span>{model}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

                    <SidebarGroupLabel>Settings</SidebarGroupLabel>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <Button>
                    Log Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}