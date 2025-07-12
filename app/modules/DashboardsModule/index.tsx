import Dragable from "./components/Dragable";

export function DashboardsModule() {
  // Sample dashboard elements - in a real app, these would come from your data source
  const sampleElements = [
    { id: '1', title: 'Sales Chart', type: 'chart' },
    { id: '2', title: 'User Stats', type: 'stats' },
    { id: '3', title: 'Recent Activity', type: 'list' },
  ];

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <h1 className="text-2xl font-bold">Dashboard Builder</h1>
        <p className="text-muted-foreground text-sm">
          Create and customize your dashboard by dragging and dropping elements
        </p>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <Dragable
          domElements={sampleElements}
        />
      </div>
    </div>
  )
}