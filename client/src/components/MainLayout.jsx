import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      {/* This className is updated for responsive padding */}
      <main className="flex-1 py-8 px-0 sm:px-4 md:px-8 pb-24 md:ml-28">
        <div className="max-w-2xl mx-auto">
          <Outlet /> {/* Child routes will render here */}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;