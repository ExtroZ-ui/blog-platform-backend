import { Outlet } from 'react-router-dom';

import { Navbar } from '../components/Navbar/Navbar';

export function MainLayout() {
  return (
    <>
      <Navbar />

      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}