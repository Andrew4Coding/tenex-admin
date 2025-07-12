import { Cog, Puzzle, Users } from 'lucide-react';
import { Link, Outlet, useLocation, useOutletContext } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { SidebarGroupLabel, SidebarMenuButton, SidebarMenuItem } from '~/components/ui/sidebar';

const MENU = [
  {
    key: 'general',
    label: 'General',
    icon: <Cog />,
    route: '/settings',
  },
  {
    key: 'allowed-users',
    label: 'Allowed Users',
    icon: <Users />,
    route: '/settings/users',
  },
  {
    key: 'integrations',
    label: 'Integrations',
    icon: <Puzzle />,
    route: '/settings/integrations',
  },
];

export const SettingsModule = () => {
  const location = useLocation();
  const outletContext = useOutletContext();

  return (
    <div className="flex min-h-screen gap-8">
      <Card className='h-full w-72 flex-shrink-0'>
        <CardContent className=''>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <Input
            placeholder="Search settings... (or Ctrl+F)"
            className="mb-4"
          />
          <div className='space-y-2'>
            {MENU.map((item) => (
              <SidebarMenuItem className='list-none' key={item.key}>
                <SidebarMenuButton asChild isActive={location.pathname === item.route}>
                  <Link to={item.route}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Card >
          <CardHeader>
            <CardTitle>{MENU.find(m => location.pathname === m.route)?.label || 'Settings'}</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <Outlet context={outletContext}/>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
