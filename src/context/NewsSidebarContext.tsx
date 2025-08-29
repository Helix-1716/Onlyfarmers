import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface NewsSidebarContextType {
  isNewsSidebarOpen: boolean;
  toggleNewsSidebar: () => void;
  closeNewsSidebar: () => void;
  openNewsSidebar: () => void;
}

const NewsSidebarContext = createContext<NewsSidebarContextType | undefined>(undefined);

export const NewsSidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isNewsSidebarOpen, setIsNewsSidebarOpen] = useState(false);

  const toggleNewsSidebar = () => {
    setIsNewsSidebarOpen(prev => !prev);
  };

  const closeNewsSidebar = () => {
    setIsNewsSidebarOpen(false);
  };

  const openNewsSidebar = () => {
    setIsNewsSidebarOpen(true);
  };

  return (
    <NewsSidebarContext.Provider value={{ isNewsSidebarOpen, toggleNewsSidebar, closeNewsSidebar, openNewsSidebar }}>
      {children}
    </NewsSidebarContext.Provider>
  );
};

export const useNewsSidebar = (): NewsSidebarContextType => {
  const context = useContext(NewsSidebarContext);
  if (context === undefined) {
    throw new Error('useNewsSidebar must be used within a NewsSidebarProvider');
  }
  return context;
};