import { useEffect } from "react";
import axios from "axios";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Package, LayoutGrid, CheckCircle2, Wrench, ArrowRight, Thermometer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/contexts/AuthContext";

// const initialData = [
//   { _id: '1', name: 'Rack-A1', room: 'ICU-101', capacity: 20, used: 14, status: 'Active', type: 'Medication' },
//   { _id: '2', name: 'Rack-B2', room: 'OR-201', capacity: 15, used: 8, status: 'Active', type: 'Surgical' },
//   { _id: '3', name: 'Rack-C1', room: 'ER-001', capacity: 25, used: 0, status: 'Maintenance', type: 'Emergency' },
//   { _id: '4', name: 'Rack-D3', room: 'GW-301', capacity: 30, used: 22, status: 'Active', type: 'General' },
//   { _id: '5', name: 'Rack-E2', room: 'PR-102', capacity: 10, used: 6, status: 'Active', type: 'Cold Storage' },
//   { _id: '6', name: 'Rack-F1', room: 'SR-203', capacity: 20, used: 18, status: 'Active', type: 'Surgical' },
// ];

export default function Racks() {
  const [racks, setRacks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', room: '', capacity: '', used: '', status: 'Active', type: '' });
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchRacks = async () => {
      // const res = await axios.get("http://localhost:3000/api/v1/racks");
      const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/racks");
      setRacks(res.data.racks);
    };

    fetchRacks();
  }, []);

  const filtered = racks.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.room.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', room: '', capacity: '', used: '0', status: 'Active', type: '' }); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, room: r.room, capacity: String(r.capacity), used: String(r.used), status: r.status, type: r.type }); setDialogOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        const res = await axios.put(
          // `http://localhost:3000/api/v1/racks/${editing._id}`,
          `https://invora-qkwq.onrender.com/api/v1/racks/${editing._id}`,
          { ...form, capacity: Number(form.capacity), used: Number(form.used) }
        );

        setRacks(prev =>
          prev.map(r => r._id === editing._id ? res.data.rack : r)
        );

        toast({ title: "Rack updated" });

      } else {
        const res = await axios.post(
          // "http://localhost:3000/api/v1/racks",
          "https://invora-qkwq.onrender.com/api/v1/racks",
          { ...form, capacity: Number(form.capacity), used: Number(form.used) }
        );

        setRacks(prev => [...prev, res.data.rack]);

        toast({ title: "Rack added" });
      }

      setDialogOpen(false);

    } catch (err) {
      console.error(err);
    }
  };

  // const save = () => {
  //   if (!form.name) return;
  //   if (editing) {
  //     setRacks(prev => prev.map(r => r._id === editing._id ? { ...r, ...form, capacity: Number(form.capacity), used: Number(form.used) } : r));
  //     toast({ title: 'Rack updated' });
  //   } else {
  //     setRacks(prev => [...prev, { _id: Date.now().toString(), ...form, capacity: Number(form.capacity), used: Number(form.used) }]);
  //     toast({ title: 'Rack added' });
  //   }
  //   setDialogOpen(false);
  // };

  // const remove = (id) => { setRacks(prev => prev.filter(r => r._id !== id)); toast({ title: 'Rack deleted', variant: 'destructive' }); };

  const remove = async (id) => {
    // await axios.delete(`http://localhost:3000/api/v1/racks/${id}`);
    await axios.delete(`https://invora-qkwq.onrender.com/api/v1/racks/${id}`);
    setRacks(prev => prev.filter(r => r._id !== id));
    toast({ title: "Rack deleted", variant: "destructive" });
  };

  const usagePercent = (r) => r.capacity > 0 ? Math.round((r.used / r.capacity) * 100) : 0;
  const usageColor = (pct) => pct >= 85 ? 'hsl(var(--stat-coral))' : pct >= 60 ? 'hsl(var(--stat-yellow))' : 'hsl(var(--stat-green))';

  const stats = {
    total: racks.length,
    active: racks.filter(r => r.status === 'Active').length,
    totalCapacity: racks.reduce((a, r) => a + r.capacity, 0),
    totalUsed: racks.reduce((a, r) => a + r.used, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Racks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage storage rack capacity and status</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Rack
          </Button>
        )}
        {/* <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Rack
        </Button> */}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Racks', value: stats.total, color: 'bg-[hsl(var(--stat-blue-light))] text-[hsl(var(--stat-blue))]' },
          { label: 'Active', value: stats.active, color: 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))]' },
          { label: 'Total Capacity', value: stats.totalCapacity, color: 'bg-[hsl(var(--stat-yellow-light))] text-[hsl(var(--stat-yellow))]' },
          { label: 'Items Stored', value: stats.totalUsed, color: 'bg-[hsl(var(--stat-coral-light))] text-[hsl(var(--stat-coral))]' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current/10`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search racks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Maintenance'].map(f => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === f ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card text-muted-foreground hover:text-foreground border border-border'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(r => {
          const pct = usagePercent(r);
          const barColor = usageColor(pct);
          const isActive = r.status === 'Active';
          return (
            <div key={r._id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-all">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-bold text-foreground">{r.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{r.type || 'General'}</span>
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide">{r.room}</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${isActive
                  ? 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))] border-[hsl(var(--stat-green)/0.3)]'
                  : 'bg-[hsl(var(--stat-yellow-light))] text-[hsl(var(--stat-yellow))] border-[hsl(var(--stat-yellow)/0.3)]'}`}>
                  {isActive ? <CheckCircle2 className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                  {r.status.toUpperCase()}
                </span>
              </div>

              {/* Capacity Visual */}
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Capacity Usage</span>
                  <span style={{ color: barColor }} className="text-sm font-bold">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{r.used} used</span>
                  <span>{r.capacity - r.used} free / {r.capacity} total</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{r.capacity} slots</span>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </>
                  )}
                  {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(r._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button> */}
                  <Button variant="ghost" size="sm" className="h-8 text-primary gap-1 text-xs font-semibold">View <ArrowRight className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <LayoutGrid className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No racks found</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Rack' : 'Add Rack'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Room</Label><Input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} /></div>
            </div>
            <div><Label>Type</Label><Input placeholder="e.g. Medication, Surgical..." value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Capacity (slots)</Label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></div>
              <div><Label>Used Slots</Label><Input type="number" value={form.used} onChange={e => setForm(f => ({ ...f, used: e.target.value }))} /></div>
            </div>
            <div><Label>Status</Label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Active</option><option>Maintenance</option>
              </select>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
