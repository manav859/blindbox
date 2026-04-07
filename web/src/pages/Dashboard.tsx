import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchBlindBoxes } from '../lib/api';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { data: boxes, isLoading, error } = useQuery({
    queryKey: ['blindBoxes'],
    queryFn: fetchBlindBoxes,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blind Boxes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your active blind box configurations.</p>
        </div>
        <Link to="/create" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Create New
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading configurations...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Failed to load configuration. Make sure backend is running.</div>
        ) : boxes?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Blind Boxes Configured</h3>
            <p className="text-gray-500">Get started by creating your first blind box promotion.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Items</th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {boxes?.map((box: any) => (
                <tr key={box.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{box.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {box.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{box.items?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/edit/${box.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
