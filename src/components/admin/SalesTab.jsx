import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SALE_TYPE_LABELS = {
  bar: 'Bar',
  artist_sale: 'Vente artiste',
  artist_contact: 'Contact artiste',
  stand: 'Stand',
  sponsor: 'Sponsor',
  ticket: 'Ticket',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500/10 text-yellow-400',
  PAID: 'bg-green-500/10 text-green-400',
  FAILED: 'bg-red-500/10 text-red-400',
  REFUNDED: 'bg-gray-500/10 text-gray-400',
};

export default function SalesTab({ user }) {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [exportPeriod, setExportPeriod] = useState('today'); // today | date | year
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date', 200),
    initialData: [],
  });

  const filteredSales = sales.filter((s) => {
    if (filterType !== 'all' && s.sale_type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const totalAmount = filteredSales.reduce((acc, s) => acc + (s.amount_total_cents || 0), 0);
  const totalStripeFee = filteredSales.reduce((acc, s) => acc + (s.stripe_fee_cents || 0), 0);
  const totalPlatformFee = filteredSales.reduce(
    (acc, s) => acc + (user?.role === 'super_admin' ? s.platform_fee_cents || 0 : 0),
    0
  );

  const today = new Date().toISOString().split('T')[0];

  const getSalesForExport = () => {
    if (exportPeriod === 'today') {
      return sales.filter((s) => (s.created_at || s.created_date || '').split('T')[0] === today);
    } else if (exportPeriod === 'date') {
      return sales.filter((s) => (s.created_at || s.created_date || '').split('T')[0] === exportDate);
    } else if (exportPeriod === 'year') {
      return sales.filter((s) => (s.created_at || s.created_date || '').startsWith(exportYear));
    }
    return filteredSales;
  };

  const getExportFilename = () => {
    if (exportPeriod === 'today') return `caisse-du-jour-${today}.csv`;
    if (exportPeriod === 'date') return `ventes-${exportDate}.csv`;
    if (exportPeriod === 'year') return `ventes-annee-${exportYear}.csv`;
    return `ventes-export.csv`;
  };

  const buildCSV = (rows, isSuperAdmin) => {
    const headers = ['Date', 'Heure', 'Type', 'Note', 'Montant (€)', 'Frais Stripe (€)', 'Net (€)', 'Statut', ...(isSuperAdmin ? ['Commission (€)'] : [])];
    const dataRows = rows.map((s) => {
      const dt = new Date(s.created_at || s.created_date);
      const amount = (s.amount_total_cents || 0) / 100;
      const fee = (s.stripe_fee_cents || 0) / 100;
      return [
        dt.toLocaleDateString('fr-FR'),
        dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        SALE_TYPE_LABELS[s.sale_type] || s.sale_type,
        s.note || '',
        amount.toFixed(2),
        fee.toFixed(2),
        (amount - fee).toFixed(2),
        s.status,
        ...(isSuperAdmin ? [((s.platform_fee_cents || 0) / 100).toFixed(2)] : []),
      ];
    });
    return [headers, ...dataRows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob(['\uFEFF' + csv, ''], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const exportCSV = () => {
    const rows = getSalesForExport();
    const csv = buildCSV(rows, user?.role === 'super_admin');
    downloadCSV(csv, getExportFilename());
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 flex-wrap">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(SALE_TYPE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="PAID">Payé</SelectItem>
            <SelectItem value="FAILED">Échoué</SelectItem>
            <SelectItem value="REFUNDED">Remboursé</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <Select value={exportPeriod} onValueChange={setExportPeriod}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="date">Date précise</SelectItem>
              <SelectItem value="year">Annuel</SelectItem>
            </SelectContent>
          </Select>
          {exportPeriod === 'date' && (
            <Input
              type="date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              className="w-40 bg-white/5 border-white/10 text-white h-9 text-sm"
            />
          )}
          {exportPeriod === 'year' && (
            <Input
              type="number"
              value={exportYear}
              onChange={(e) => setExportYear(e.target.value)}
              min="2020"
              max="2099"
              className="w-24 bg-white/5 border-white/10 text-white h-9 text-sm"
            />
          )}
          <Button onClick={exportCSV} variant="outline" className="border-white/20 text-white/70 hover:text-white gap-2">
            <Download className="w-4 h-4" /> Exporter CSV
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{(totalAmount / 100).toFixed(2)} €</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 mb-1">Frais Stripe</p>
          <p className="text-2xl font-bold text-red-400">{(totalStripeFee / 100).toFixed(2)} €</p>
        </div>
        {user?.role === 'super_admin' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">Commission</p>
            <p className="text-2xl font-bold text-[#FF2D8A]">{(totalPlatformFee / 100).toFixed(2)} €</p>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-8 text-white/40">Aucune vente</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="text-left py-3 px-3 font-display font-semibold text-xs uppercase text-white/40">
                  Date
                </th>
                <th className="text-left py-3 px-3 font-display font-semibold text-xs uppercase text-white/40">
                  Type
                </th>
                <th className="text-left py-3 px-3 font-display font-semibold text-xs uppercase text-white/40">
                  Montant
                </th>
                <th className="text-left py-3 px-3 font-display font-semibold text-xs uppercase text-white/40">
                  Frais Stripe
                </th>
                {user?.role === 'super_admin' && (
                  <th className="text-left py-3 px-3 font-display font-semibold text-xs uppercase text-white/40">
                    Commission
                  </th>
                )}
                <th className="text-left py-3 px-3 font-display font-semibold text-xs uppercase text-white/40">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-2 px-3 text-white/70">
                    {new Date(sale.created_at || sale.created_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-2 px-3 text-white/70">{SALE_TYPE_LABELS[sale.sale_type]}</td>
                  <td className="py-2 px-3 font-semibold text-white">
                    {(sale.amount_total_cents / 100).toFixed(2)} €
                  </td>
                  <td className="py-2 px-3 text-red-400">{(sale.stripe_fee_cents / 100).toFixed(2)} €</td>
                  {user?.role === 'super_admin' && (
                    <td className="py-2 px-3 text-[#FF2D8A]">{(sale.platform_fee_cents / 100).toFixed(2)} €</td>
                  )}
                  <td className="py-2 px-3">
                    <Badge className={STATUS_COLORS[sale.status]}>{sale.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}