import React, { useState, useRef } from 'react';
import { Camera, Loader2, Save, X, Image as ImageIcon } from 'lucide-react';
import { analyzeItemImage } from '../services/geminiService';
import { Category, InventoryItem } from '../types';

interface AddItemViewProps {
  onSave: (item: InventoryItem) => void;
  onCancel: () => void;
}

const AddItemView: React.FC<AddItemViewProps> = ({ onSave, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<Category>(Category.Misc);
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create local preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      
      // Start AI Analysis
      setIsAnalyzing(true);
      setAnalysisError(null);
      try {
        // Strip prefix for API
        const base64Data = base64String.split(',')[1]; 
        const result = await analyzeItemImage(base64Data);
        
        setName(result.name);
        setCategory(result.category);
        if (result.suggestedLocation) setLocation(result.suggestedLocation);
        if (result.expiryDate) setExpiryDate(result.expiryDate);
        if (result.notes) setNotes(result.notes);
        
      } catch (err) {
        setAnalysisError("Could not auto-detect details. Please enter manually.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name) {
        alert("Item name is required");
        return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name,
      location: location || 'Unassigned',
      category,
      expiryDate: expiryDate || undefined,
      addedDate: new Date().toISOString(),
      imageUrl: imagePreview || undefined,
      notes
    };
    onSave(newItem);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
        <button onClick={onCancel} className="text-blue-500 text-lg">Cancel</button>
        <h1 className="text-lg font-semibold">Add Item</h1>
        <button onClick={handleSave} className="text-blue-500 font-semibold text-lg disabled:opacity-50" disabled={isAnalyzing}>
            Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Image Capture Area */}
        <div className="flex flex-col items-center justify-center space-y-4">
            <div 
                className="relative w-48 h-48 bg-gray-200 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-gray-400">
                        <Camera size={48} className="mx-auto mb-2" />
                        <span className="text-sm">Tap to take photo</span>
                    </div>
                )}
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <span className="text-xs font-medium">AI Analyzing...</span>
                    </div>
                )}
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileChange}
            />
            {analysisError && <p className="text-red-500 text-xs">{analysisError}</p>}
        </div>

        {/* Form Fields */}
        <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            
            {/* Name */}
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Item Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Milk, Batteries"
                    className="w-full p-3 bg-gray-50 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {/* Location */}
            <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Where is it?</label>
                <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kitchen Drawer 2"
                    className="w-full p-3 bg-gray-50 rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

            {/* Category & Expiry Row */}
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Category</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full p-3 bg-gray-50 rounded-lg outline-none appearance-none"
                    >
                        {Object.values(Category).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Expires</label>
                    <input 
                        type="date" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-lg outline-none"
                    />
                </div>
            </div>

             {/* Notes */}
             <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Notes</label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any extra details..."
                    rows={3}
                    className="w-full p-3 bg-gray-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                />
            </div>

        </div>
      </div>
    </div>
  );
};

export default AddItemView;
