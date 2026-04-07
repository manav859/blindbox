import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createBlindBox } from '../lib/api';

export default function CreateBlindBox() {
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createBlindBox,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blindBoxes'] });
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !productId) return;
    mutation.mutate({ name, productId, status: 'DRAFT', items: [] });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Blind Box</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Configuration Name</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Mystery Box"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Product ID</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border rounded-md"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Product ID from SHOPLINE"
          />
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
