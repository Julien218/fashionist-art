import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Trash2, GripVertical, Plus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Draggable, Droppable, DragDropContext } from '@hello-pangea/dnd';

export default function WorksGallery({ artistId }) {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    loadWorks();
  }, [artistId]);

  const loadWorks = async () => {
    setLoading(true);
    const list = await base44.entities.ArtistWork.filter({ artist_id: artistId });
    setWorks(list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedImage(file_url);
    setUploading(false);
  };

  const handleAddWork = async () => {
    if (!formData.title || !uploadedImage) {
      toast.error('Remplissez le titre et téléchargez une image');
      return;
    }

    await base44.entities.ArtistWork.create({
      artist_id: artistId,
      title: formData.title,
      description: formData.description,
      image_url: uploadedImage,
      display_order: works.length,
    });

    await loadWorks();
    setFormData({ title: '', description: '' });
    setUploadedImage(null);
    setShowForm(false);
    toast.success('Œuvre ajoutée !');
  };

  const handleDeleteWork = async (workId) => {
    await base44.entities.ArtistWork.delete(workId);
    await loadWorks();
    toast.success('Œuvre supprimée');
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const reordered = Array.from(works);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    const updates = reordered.map((w, idx) => ({
      id: w.id,
      display_order: idx,
    }));

    for (const update of updates) {
      await base44.entities.ArtistWork.update(update.id, { display_order: update.display_order });
    }

    setWorks(reordered);
    toast.success('Ordre mis à jour');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-[#FF2D8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-white">Ma galerie d'œuvres</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="btn-primary border-0 h-9 text-sm">
            <Plus className="w-4 h-4" /> Ajouter une œuvre
          </Button>
        )}
      </div>

      {showForm && (
        <div className="glass-dark neon-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display font-semibold text-white">Nouvelle œuvre</h4>
            <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Titre *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Tableau abstrait"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 mb-1 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez votre œuvre..."
              className="bg-white/5 border-white/10 text-white h-16 placeholder:text-white/20"
            />
          </div>

          <div className="relative">
            <label className="text-xs text-white/40 mb-2 block">Image *</label>
            {uploadedImage ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 p-1 rounded-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <label className="relative block border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#FF2D8A]/50 hover:bg-[#FF2D8A]/5 transition-all">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF2D8A] mx-auto" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-white/40 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">Cliquez pour télécharger une image</p>
                  </>
                )}
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleAddWork} className="btn-primary flex-1 border-0 h-9 text-sm">
              Ajouter
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 h-9 text-sm border-white/10">
              Annuler
            </Button>
          </div>
        </div>
      )}

      {works.length === 0 ? (
        <div className="text-center py-12 glass-dark rounded-2xl border border-white/10">
          <ImageIcon className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Aucune œuvre pour le moment. Commencez par en ajouter une !</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="works">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {works.map((work, idx) => (
                  <Draggable key={work.id} draggableId={work.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex gap-3 p-4 rounded-xl border transition-all ${
                          snapshot.isDragging ? 'glass-dark neon-border' : 'glass-dark border-white/10'
                        }`}
                      >
                        <div {...provided.dragHandleProps} className="flex items-start pt-1">
                          <GripVertical className="w-4 h-4 text-white/30" />
                        </div>

                        <img src={work.image_url} alt={work.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate">{work.title}</h4>
                          {work.description && <p className="text-white/40 text-xs line-clamp-2 mt-0.5">{work.description}</p>}
                        </div>

                        <button
                          onClick={() => handleDeleteWork(work.id)}
                          className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}