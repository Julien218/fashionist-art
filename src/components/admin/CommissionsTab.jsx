import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Download, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';

const SALE_TYPE_LABELS = {
  bar: 'Bar',
  stand: 'Stand',
  sponsor: 'Sponsor',
  artist_contact: 'Contact artiste',
  artist_sale: 'Vente artiste',
  other: 'Autre',
};

export default function CommissionsTab() {
  const [editRule, setEditRule] = useState(null);
  const [form, setForm] = useState({ sale_type: 'bar', mode: 'percent', value: 10, active: true });
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ['sales-commissions'],
    queryFn: () => base44.entities.Sale.list('-created_at', 500),
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['platform-fee-rules'],
    queryFn: () => base44.entities.PlatformFeeRule.list('-created_date'),
  });

  const paidSales = sales.filter((s) => s.status === 'PAID');
  const totalCommission = paidSales.reduce((acc, s) => acc + (s.platform_fee_cents || 0), 0);

  const commissionByType = Object.entries(SALE_TYPE_LABELS).map(([type, label]) => {
    const typeSales = paidSales.filter((s) => s.sale_type === type);
    const total = typeSales.reduce((acc, s) => acc + (s.platform_fee_cents || 0), 0);
    return { type, label, total, count: typeSales.length };
  }).filter((t) => t.total > 0);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editRule) {
        return base44.entities.PlatformFeeRule.update(editRule.id, data);
      }
      return base44.entities.PlatformFeeRule.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-fee-rules'] });
      setShowForm(false);
      setEditRule(null);
      toast.success(editRule ? 'Règle mise à jour !' : 'Règle créée !');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PlatformFeeRule.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['platform-fee-rules'] });
      toast.success('Supprimé !');
    },
  });

  const openEdit = (rule) => {
    setEditRule(rule);
    setForm({ sale_type: rule.sale_type, mode: rule.mode, value: rule.value, active: rule.active });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditRule(null);
    setForm({ sale_type: 'bar', mode: 'percent', value: 10, active: true });
    setShowForm(true);
  };

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Montant', 'Frais Stripe', 'Commission'];
    const rows = paidSales.map((s) => [
      new Date(s.created_at).toLocaleDateString('fr-FR'),
      SALE_TYPE_LABELS[s.sale_type] || s.sale_type,
      `${((s.amount_total_cents || 0) / 100).toFixed(2)} €`,
      `${((s.stripe_fee_cents || 0) / 100).toFixed(2)} €`,
      `${((s.platform_fee_cents || 0) / 100).toFixed(2)} €`,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Commissions Plateforme</h2>
          <p className="text-sm text-white/50 mt-1">Visible super_admin uniquement</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-white/20 text-white/70 hover:text-white gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Total */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FF2D8A]/10 border border-[#FF2D8A]/30 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Total commissions</p>
          <p className="text-3xl font-bold text-[#FF2D8A]">{(totalCommission / 100).toFixed(2)} €</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Transactions payées</p>
          <p className="text-3xl font-bold text-white">{paidSales.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Commission moyenne</p>
          <p className="text-3xl font-bold text-[#D4AF37]">
            {paidSales.length > 0 ? (totalCommission / paidSales.length / 100).toFixed(2) : '0.00'} €
          </p>
        </div>
      </div>

      {/* Par type */}
      {commissionByType.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF2D8A]" /> Par type
          </h3>
          <div className="space-y-2">
            {commissionByType.map(({ type, label, total, count }) => (
              <div key={type} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-sm text-white">{label}</span>
                  <span className="text-xs text-white/40 ml-2">({count} vente{count > 1 ? 's' : ''})</span>
                </div>
                <span className="font-semibold text-[#FF2D8A]">{(total / 100).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Règles PlatformFeeRule */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-white">Règles de commission</h3>
          <Button onClick={openCreate} size="sm" className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white gap-1">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </Button>
        </div>

        {rulesLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-white/40 mx-auto" />
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Badge className={rule.active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}>
                    {rule.active ? 'Actif' : 'Inactif'}
                  </Badge>
                  <span className="text-sm text-white">{SALE_TYPE_LABELS[rule.sale_type] || rule.sale_type}</span>
                  <span className="text-sm text-[#FF2D8A] font-semibold">
                    {rule.mode === 'percent' ? `${rule.value}%` : `${rule.value} cts`}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rule)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm('Supprimer ?')) deleteMutation.mutate(rule.id); }}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
            {rules.length === 0 && <p className="text-sm text-white/40 text-center py-4">Aucune règle configurée</p>}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/3">
            <h4 className="font-display font-semibold text-sm text-white">{editRule ? 'Modifier' : 'Nouvelle règle'}</h4>
            <Select value={form.sale_type} onValueChange={(v) => setForm({ ...form, sale_type: v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SALE_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 text-sm w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Fixe (cts)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) })}
                placeholder="Valeur"
                className="bg-white/5 border-white/10 text-white h-9 text-sm flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} size="sm" className="bg-[#FF2D8A] hover:bg-[#C2185B] text-white">
                {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Enregistrer'}
              </Button>
              <Button onClick={() => setShowForm(false)} size="sm" variant="ghost" className="text-white/60">Annuler</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}