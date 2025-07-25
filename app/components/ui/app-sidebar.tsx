import { Box, Code2, Home, Plus, Settings, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
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
} from '~/components/ui/sidebar';
import { getAuthClient } from '~/lib/auth.client';
import { Button } from './button';
import { Input } from './input';

const UTILS_ITEMS = [
  {
    label: 'Home',
    href: '/',
    icon: <Home />,
  },
  {
    label: 'Query Playground',
    href: '/query',
    icon: <Code2 />,
  },
];

const SETTINGS_ITEMS = [
  {
    label: 'Settings',
    href: '/settings',
    icon: <Settings />,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: <User />,
  },
];

export function AppSidebar({ models, dashboards }: { models?: string[], dashboards?: { name: string, id: string }[] }) {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const filteredModels = useMemo(() => {
    if (!models) return [];
    if (!search) return models;
    return models.filter((m) => m.toLowerCase().includes(search.toLowerCase()));
  }, [models, search]);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Reset highlight when search/filter changes
  useEffect(() => {
    setActiveIndex(filteredModels.length > 0 ? 0 : -1);
  }, [search, filteredModels.length]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredModels.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredModels.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + filteredModels.length) % filteredModels.length
      );
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const model = filteredModels[activeIndex];
      if (model) {
        navigate(`/models/${model}`);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && menuRefs.current[activeIndex]) {
      menuRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Blur resets highlight
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Only reset if focus leaves the sidebar group
    setTimeout(() => {
      if (
        document.activeElement &&
        inputRef.current &&
        !inputRef.current.contains(document.activeElement)
      ) {
        setActiveIndex(-1);
      }
    }, 0);
  };

  const handleLogout = async () => {
    const authClient = getAuthClient();

    await authClient.signOut();

    navigate('/login', { replace: true });
  }

  return (
    <Sidebar>
      <SidebarContent className="p-4">
        <SidebarGroup className="gap-8">
          <div>
            <SidebarGroupLabel>Utils</SidebarGroupLabel>
            <SidebarGroupContent className="max-h-96 overflow-auto">
              <SidebarMenu>
                {UTILS_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={
                          pathname === item.href
                            ? 'bg-accent text-accent-foreground rounded'
                            : ''
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
          <div>
            <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
            <SidebarGroupContent className="max-h-96 overflow-auto">
              <SidebarMenu>
                {dashboards?.length! > 0 && dashboards?.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={`/dashboards/${item.id}`}
                        className={
                          pathname === `/dashboards/${item.id}`
                            ? 'bg-accent text-accent-foreground rounded'
                            : ''
                        }
                      >
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                <Button variant="outline" className="w-full">
                  <Plus />
                  Create Dashboard
                </Button>
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
          <div>
            <SidebarGroupLabel>Database Models</SidebarGroupLabel>
            <div className="mb-2">
              <Input
                ref={inputRef}
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="text-sm"
                autoComplete="off"
              />
            </div>
            <SidebarGroupContent className="max-h-96 overflow-auto pr-2">
              <SidebarMenu>
                {filteredModels.length === 0 ? (
                  <div className="px-3 py-2 text-muted-foreground text-sm">
                    No models found
                  </div>
                ) : (
                  filteredModels.map((model, idx) => {
                    const modelHref = `/models/${model}`;
                    const isActive =
                      pathname === modelHref ||
                      pathname.startsWith(modelHref + '/');
                    return (
                      <SidebarMenuItem key={model}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={modelHref}
                            tabIndex={-1}
                            ref={(el) => {
                              menuRefs.current[idx] = el;
                            }}
                            className={
                              activeIndex === idx || isActive
                                ? 'bg-accent text-accent-foreground rounded'
                                : ''
                            }
                          >
                            <Box />
                            <span>{model}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>

          <div>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {SETTINGS_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.href}
                        className={
                          pathname === item.href
                            ? 'bg-accent text-accent-foreground rounded'
                            : ''
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          onClick={handleLogout}
        >Log Out</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
