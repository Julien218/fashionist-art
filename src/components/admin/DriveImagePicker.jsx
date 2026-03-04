import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, HardDrive, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Google Drive Picker using the picker API with access token from connector
export default function DriveImagePicker({ onFilePicked, children }) {
  const [loading, setLoading] = useState(false);
  const pickerRef = useRef(null);

  const openPicker = async () => {
    setLoading(true);
    try {
      // We'll use a manual file ID input since the Drive Picker API
      // requires loading Google's external scripts. Instead, we show a simple
      // URL / file ID input modal.
      pickerRef.current?.showModal();
    } catch (e) {
      toast.error('Erreur Google Drive');
    }
    setLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        disabled={loading}
        className="cursor-pointer flex items-center gap-1 text-[10px] text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <HardDrive className="w-3 h-3" />}
        Drive
      </button>
      <DriveIdModal ref={pickerRef} onFilePicked={onFilePicked} />
    </>
  );
}

const DriveIdModal = React.forwardRef(function DriveIdModal({ onFilePicked }, ref) {
  const [open, setOpen] = useState(false);
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);

  React.useImperativeHandle(ref, () => ({
    showModal: () => { setOpen(true); setFileId(''); }
  }));

  const handleImport = async () => {
    if (!fileId.trim()) return;
    setLoading(true);
    try {
      // Extract ID from URL if needed
      let id = fileId.trim();
      const match = id.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) id = match[1];

      const res = await base44.functions.invoke('drivePickFile', { fileId: id });
      onFilePicked(res.data.file_url);
      toast.success('Image importée depuis Drive !');
      setOpen(false);
    } catch (e) {
      toast.error('Impossible d\'importer ce fichier Drive');
      console.error(e);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-[#12121A] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-display font-semibold text-white text-sm">Importer depuis Google Drive</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-white/40 mb-3">Collez le lien de partage ou l'ID du fichier Google Drive :</p>
        <input
          type="text"
          value={fileId}
          onChange={e => setFileId(e.target.value)}
          placeholder="https://drive.google.com/file/d/... ou ID"
          className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2 mb-4 placeholder:text-white/20 outline-none focus:border-[#D4AF37]/40"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleImport()}
        />
        <div className="flex gap-2">
          <Button onClick={() => setOpen(false)} variant="ghost" className="flex-1 text-xs text-white/40 h-8">Annuler</Button>
          <Button onClick={handleImport} disabled={loading || !fileId.trim()} className="flex-1 text-xs bg-[#D4AF37] hover:bg-[#B8962E] text-black h-8 font-semibold gap-1">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <HardDrive className="w-3 h-3" />}
            Importer
          </Button>
        </div>
      </div>
    </div>
  );
});