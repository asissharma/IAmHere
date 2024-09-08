import React from 'react';

const LogoutPage: React.FC = () => {
  const handleLogout = () => {
    // Clear session or authentication token here
    window.location.href = '/login';
  };

  return (
    <div>
      <h1>Logout</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LogoutPage;
