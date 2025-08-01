import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8 border p-1 rounded-md" />
            <h1 className="text-lg font-semibold text-foreground">PlanWise AI</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
