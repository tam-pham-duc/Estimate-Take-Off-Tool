import React, { useState, useEffect } from 'react';
import { MaterialLibraryItem, MaterialLibraryService } from '@/services/materialLibrary';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';

export default function MaterialLibrary() {
  const [items, setItems] = useState<MaterialLibraryItem[]>([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MaterialLibraryItem>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setItems(MaterialLibraryService.getAll());
  }, []);

  const handleSave = () => {
    if (isCreating) {
      if (!editForm.materialName) return;
      const newItem = MaterialLibraryService.add({
        buildingType: editForm.buildingType || '',
        order: editForm.order || 0,
        materialName: editForm.materialName || '',
        uom: editForm.uom || '',
        materialFormula: editForm.materialFormula || '',
      });
      setItems([...items, newItem]);
      setIsCreating(false);
    } else if (isEditing) {
      MaterialLibraryService.update(isEditing, editForm);
      setItems(items.map(item => item.id === isEditing ? { ...item, ...editForm } : item));
      setIsEditing(null);
    }
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      MaterialLibraryService.delete(id);
      setItems(items.filter(item => item.id !== id));
    }
  };

  const startEdit = (item: MaterialLibraryItem) => {
    setIsEditing(item.id);
    setIsCreating(false);
    setEditForm(item);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setEditForm({
      buildingType: '',
      order: 0,
      materialName: '',
      uom: '',
      materialFormula: '',
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
  };

  const filteredItems = items.filter(item => 
    item.materialName.toLowerCase().includes(search.toLowerCase()) ||
    item.buildingType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Material Library</h2>
        <button 
          onClick={startCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Add Material
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search materials..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="p-3 font-medium">Material Name</th>
              <th className="p-3 font-medium">Building Type</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">UOM</th>
              <th className="p-3 font-medium">Formula</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isCreating && (
              <tr className="border-b border-slate-100 bg-indigo-50/50">
                <td className="p-2">
                  <input 
                    type="text" 
                    value={editForm.materialName || ''} 
                    onChange={e => setEditForm({...editForm, materialName: e.target.value})}
                    placeholder="Material Name"
                    className="w-full p-1 border rounded text-sm"
                    autoFocus
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    value={editForm.buildingType || ''} 
                    onChange={e => setEditForm({...editForm, buildingType: e.target.value})}
                    placeholder="Building Type"
                    className="w-full p-1 border rounded text-sm"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="number" 
                    value={editForm.order || 0} 
                    onChange={e => setEditForm({...editForm, order: Number(e.target.value)})}
                    className="w-full p-1 border rounded text-sm"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    value={editForm.uom || ''} 
                    onChange={e => setEditForm({...editForm, uom: e.target.value})}
                    placeholder="UOM"
                    className="w-full p-1 border rounded text-sm"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    value={editForm.materialFormula || ''} 
                    onChange={e => setEditForm({...editForm, materialFormula: e.target.value})}
                    placeholder="Formula"
                    className="w-full p-1 border rounded text-sm"
                  />
                </td>
                <td className="p-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                    <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={16} /></button>
                  </div>
                </td>
              </tr>
            )}
            
            {filteredItems.map(item => (
              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                {isEditing === item.id ? (
                  <>
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={editForm.materialName || ''} 
                        onChange={e => setEditForm({...editForm, materialName: e.target.value})}
                        className="w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={editForm.buildingType || ''} 
                        onChange={e => setEditForm({...editForm, buildingType: e.target.value})}
                        className="w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        value={editForm.order || 0} 
                        onChange={e => setEditForm({...editForm, order: Number(e.target.value)})}
                        className="w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={editForm.uom || ''} 
                        onChange={e => setEditForm({...editForm, uom: e.target.value})}
                        className="w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={editForm.materialFormula || ''} 
                        onChange={e => setEditForm({...editForm, materialFormula: e.target.value})}
                        className="w-full p-1 border rounded text-sm"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={16} /></button>
                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={16} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-sm font-medium text-slate-800">{item.materialName}</td>
                    <td className="p-3 text-sm text-slate-600">{item.buildingType}</td>
                    <td className="p-3 text-sm text-slate-600">{item.order}</td>
                    <td className="p-3 text-sm text-slate-600">{item.uom}</td>
                    <td className="p-3 text-sm text-slate-600 font-mono text-xs">{item.materialFormula}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filteredItems.length === 0 && !isCreating && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No materials found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
