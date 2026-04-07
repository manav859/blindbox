import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBlindBox, updateBlindBox } from '../lib/api';

export default function EditBlindBox() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [items, setItems] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: box, isLoading } = useQuery({
    queryKey: ['blindBoxes', id],
    queryFn: () => fetchBlindBox(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (box) {
      setName(box.name || '');
      setStatus(box.status || 'DRAFT');
      setItems(box.items || []);
    }
  }, [box]);

  const mutation = useMutation({
    mutationFn: updateBlindBox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blindBoxes'] });
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    mutation.mutate({ id: id!, payload: { name, status, items } });
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Blind Box</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Configuration Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
        
        {/* Pool Items Editor Section could go here */}
        <div className="pt-6 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pool Items</h3>
          <p className="text-sm text-gray-500 mb-4">You have {items.length} items mapped to this box.</p>
          {/* Implement full pool item crud table if needed */}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button type="button" onClick={() => navigate('/')} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
