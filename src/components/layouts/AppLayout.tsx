import { ReactNode } from 'react';
import MainNavSidebar from '@/components/MainNavSidebar';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const AppLayout = ({ children, showSidebar = true }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {showSidebar && <MainNavSidebar />}
      <div className="flex-1 min-w-0 lg:ml-0">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
