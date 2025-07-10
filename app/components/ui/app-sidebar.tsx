
import { Box, Code2, Settings, User } from "lucide-react";
import { Link } from "react-router";
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
            <SidebarContent className="p-4">
                <SidebarGroup className="gap-8">
                    <div>
                        <SidebarGroupLabel>Utils</SidebarGroupLabel>
                        <SidebarGroupContent className="max-h-96 overflow-auto">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to="/query">
                                            <Code2 />
                                            <span>Query Playground</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </div>

                    <div>
                        <SidebarGroupLabel>Database Models</SidebarGroupLabel>
                        <SidebarGroupContent className="max-h-96 overflow-auto">
                            <SidebarMenu>
                                {models?.map((model) => (
                                    <SidebarMenuItem key={model}>
                                        <SidebarMenuButton asChild>
                                            <Link to={`/${model}`}>
                                                <Box />
                                                <span>{model}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </div>

                    <div>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to="/settings">
                                            <Settings />
                                            <span>Settings</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link to="/profile">
                                            <User />
                                            <span>Profile</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </div>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <Button>
                    Log Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}