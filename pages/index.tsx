import { useState } from 'react';
import type { NextPage } from 'next';
import Auth from './components/auth'; // Adjust path as needed
import Home from './Home'; // Adjust path as needed

const Index: NextPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Handle successful authentication
  const handleAuthenticationSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {!isAuthenticated ? (
        <Auth onSuccess={handleAuthenticationSuccess} />
      ) : (
        <Home />
        )} 
    </div>
  );
};

export default Index;
