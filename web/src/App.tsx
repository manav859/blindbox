import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, LayoutDashboard, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateBlindBox from './pages/CreateBlindBox';
import EditBlindBox from './pages/EditBlindBox';

const queryClient = new QueryClient();

function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Box className="w-6 h-6 text-indigo-600" />
          Blind Box App
        </h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-900 bg-gray-50">
          <LayoutDashboard className="w-5 h-5 text-gray-400" />
          Dashboard
        </Link>
        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 text-gray-600">
          <Settings className="w-5 h-5 text-gray-400" />
          Settings
        </Link>
      </nav>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateBlindBox />} />
              <Route path="/edit/:id" element={<EditBlindBox />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
