"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Search, Trash2, X, Library, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

type Material = {
  id: string;
  buildingType: string;
  order: string;
  name: string;
  uom: string;
  formula: string;
};

type TakeoffRow = {
  id: string;
  category: string;
  subCategory: string;
  subItemGroup: string;
  materialId: string;
  materialName: string;
  order: string;
  uom: string;
  formula: string;
  quantity: number;
  total: number;
};

export default function EstimatorApp() {
  const [activeTab, setActiveTab] = useState<"takeoff" | "library">("takeoff");
  
  const [materials, setMaterials] = useState<Material[]>([
    { id: "1", buildingType: "Residential", order: "01", name: "Concrete Mix", uom: "bags", formula: "qty * 1.5" },
    { id: "2", buildingType: "Commercial", order: "02", name: "Steel Rebar", uom: "tons", formula: "qty * 2.1" },
  ]);

  const [takeoffRows, setTakeoffRows] = useState<TakeoffRow[]>([]);

  // New Material Modal State
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState(false);
  const [newMaterialDraft, setNewMaterialDraft] = useState<Partial<Material>>({});
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);

  const handleAddRow = () => {
    const newRow: TakeoffRow = {
      id: Math.random().toString(36).substr(2, 9),
      category: "",
      subCategory: "",
      subItemGroup: "",
      materialId: "",
      materialName: "",
      order: "",
      uom: "",
      formula: "",
      quantity: 0,
      total: 0,
    };
    setTakeoffRows([...takeoffRows, newRow]);
  };

  const updateRow = (id: string, field: keyof TakeoffRow, value: any) => {
    setTakeoffRows(rows => rows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        // Simple eval for formula if quantity changes
        if (field === 'quantity' || field === 'formula') {
          try {
            const formulaStr = updated.formula.replace(/qty/gi, updated.quantity.toString());
            // eslint-disable-next-line no-eval
            updated.total = eval(formulaStr) || 0;
          } catch (e) {
            updated.total = 0;
          }
        }
        return updated;
      }
      return row;
    }));
  };

  const handleMaterialSelect = (rowId: string, material: Material) => {
    setTakeoffRows(rows => rows.map(row => {
      if (row.id === rowId) {
        const updated = {
          ...row,
          materialId: material.id,
          materialName: material.name,
          order: material.order,
          uom: material.uom,
          formula: material.formula,
        };
        try {
          const formulaStr = updated.formula.replace(/qty/gi, updated.quantity.toString());
          // eslint-disable-next-line no-eval
          updated.total = eval(formulaStr) || 0;
        } catch (e) {
          updated.total = 0;
        }
        return updated;
      }
      return row;
    }));
  };

  const handleCreateNewMaterial = (rowId: string, name: string) => {
    setNewMaterialDraft({ name, buildingType: "", order: "", uom: "", formula: "qty * 1" });
    setPendingRowId(rowId);
    setIsNewMaterialModalOpen(true);
  };

  const saveNewMaterial = () => {
    const newMat: Material = {
      id: Math.random().toString(36).substr(2, 9),
      buildingType: newMaterialDraft.buildingType || "",
      order: newMaterialDraft.order || "",
      name: newMaterialDraft.name || "",
      uom: newMaterialDraft.uom || "",
      formula: newMaterialDraft.formula || "qty * 1",
    };

    if (saveToLibrary) {
      setMaterials([...materials, newMat]);
    }

    if (pendingRowId) {
      handleMaterialSelect(pendingRowId, newMat);
    }

    setIsNewMaterialModalOpen(false);
    setPendingRowId(null);
    setNewMaterialDraft({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          className={cn("flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors", activeTab === "takeoff" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900")}
          onClick={() => setActiveTab("takeoff")}
        >
          <Calculator className="w-4 h-4" /> Take-off Page
        </button>
        <button
          className={cn("flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors", activeTab === "library" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900")}
          onClick={() => setActiveTab("library")}
        >
          <Library className="w-4 h-4" /> Material Library
        </button>
      </div>

      <div className="p-6">
        {activeTab === "takeoff" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Calculation Data</h2>
              <button onClick={handleAddRow} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Row
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y">
                  <tr>
                    <th className="px-4 py-3">Category (L1)</th>
                    <th className="px-4 py-3">Sub-Category (L2)</th>
                    <th className="px-4 py-3">Sub-Item Group (L3)</th>
                    <th className="px-4 py-3 w-64">Material</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">UOM</th>
                    <th className="px-4 py-3">Formula</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {takeoffRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No calculation data yet. Click "Add Row" to start.
                      </td>
                    </tr>
                  ) : takeoffRows.map(row => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded p-1.5 text-sm" value={row.category} onChange={e => updateRow(row.id, 'category', e.target.value)} placeholder="L1" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded p-1.5 text-sm" value={row.subCategory} onChange={e => updateRow(row.id, 'subCategory', e.target.value)} placeholder="L2" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" className="w-full border border-gray-300 rounded p-1.5 text-sm" value={row.subItemGroup} onChange={e => updateRow(row.id, 'subItemGroup', e.target.value)} placeholder="L3" />
                      </td>
                      <td className="px-4 py-2">
                        <MaterialCombobox 
                          materials={materials} 
                          value={row.materialId} 
                          onChange={(m) => handleMaterialSelect(row.id, m)}
                          onCreateNew={(name) => handleCreateNewMaterial(row.id, name)}
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-600">{row.order || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{row.uom || '-'}</td>
                      <td className="px-4 py-2 text-gray-600">{row.formula || '-'}</td>
                      <td className="px-4 py-2">
                        <input type="number" className="w-20 border border-gray-300 rounded p-1.5 text-sm" value={row.quantity} onChange={e => updateRow(row.id, 'quantity', parseFloat(e.target.value) || 0)} />
                      </td>
                      <td className="px-4 py-2 font-medium">{row.total.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => setTakeoffRows(rows => rows.filter(r => r.id !== row.id))} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Material Library</h2>
              <button 
                onClick={() => {
                  setNewMaterialDraft({ buildingType: "", order: "", name: "", uom: "", formula: "qty * 1" });
                  setSaveToLibrary(true);
                  setPendingRowId(null);
                  setIsNewMaterialModalOpen(true);
                }} 
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Material
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-y">
                  <tr>
                    <th className="px-4 py-3">Building Type</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Material Name</th>
                    <th className="px-4 py-3">UOM</th>
                    <th className="px-4 py-3">Material Formula</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(mat => (
                    <tr key={mat.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{mat.buildingType}</td>
                      <td className="px-4 py-3">{mat.order}</td>
                      <td className="px-4 py-3 font-medium">{mat.name}</td>
                      <td className="px-4 py-3">{mat.uom}</td>
                      <td className="px-4 py-3 font-mono text-xs bg-gray-100 rounded px-2 py-1 inline-block mt-2">{mat.formula}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setMaterials(mats => mats.filter(m => m.id !== mat.id))} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No materials in the library. Click "Add Material" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Material Modal */}
      {isNewMaterialModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">Create New Material</h3>
              <button onClick={() => setIsNewMaterialModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Name</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                  value={newMaterialDraft.name || ""} 
                  onChange={e => setNewMaterialDraft({...newMaterialDraft, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                    value={newMaterialDraft.buildingType || ""} 
                    onChange={e => setNewMaterialDraft({...newMaterialDraft, buildingType: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                    value={newMaterialDraft.order || ""} 
                    onChange={e => setNewMaterialDraft({...newMaterialDraft, order: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" 
                    value={newMaterialDraft.uom || ""} 
                    onChange={e => setNewMaterialDraft({...newMaterialDraft, uom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm font-mono" 
                    value={newMaterialDraft.formula || ""} 
                    onChange={e => setNewMaterialDraft({...newMaterialDraft, formula: e.target.value})}
                    placeholder="e.g. qty * 1.5"
                  />
                </div>
              </div>
              
              {pendingRowId && (
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="saveToLibrary" 
                    checked={saveToLibrary} 
                    onChange={e => setSaveToLibrary(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="saveToLibrary" className="text-sm text-gray-700">
                    Save this material to the Material Library
                  </label>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button 
                onClick={() => setIsNewMaterialModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={saveNewMaterial}
                disabled={!newMaterialDraft.name}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialCombobox({ 
  materials, 
  value, 
  onChange, 
  onCreateNew 
}: { 
  materials: Material[], 
  value: string, 
  onChange: (material: Material) => void,
  onCreateNew: (name: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const mat = materials.find(m => m.id === value);
    if (mat) {
      setSearch(mat.name);
    } else if (!value) {
      setSearch("");
    }
  }, [value, materials]);

  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = materials.find(m => m.name.toLowerCase() === search.toLowerCase());

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full border border-gray-300 rounded p-1.5 text-sm pr-8"
          placeholder="Search material..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <Search className="w-4 h-4 absolute right-2 top-2 text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map(m => (
              <div 
                key={m.id} 
                className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                onClick={() => {
                  onChange(m);
                  setSearch(m.name);
                  setIsOpen(false);
                }}
              >
                <div className="font-medium text-gray-900">{m.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Order: {m.order || '-'} | UOM: {m.uom || '-'} | Formula: {m.formula}
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500 text-center">No materials found</div>
          )}
          
          {search.trim() !== "" && !exactMatch && (
            <div 
              className="p-2 hover:bg-blue-50 cursor-pointer text-sm text-blue-600 font-medium flex items-center gap-2 border-t bg-gray-50"
              onClick={() => {
                onCreateNew(search);
                setIsOpen(false);
              }}
            >
              <Plus className="w-4 h-4" /> Create new "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
