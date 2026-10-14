import { useEffect } from "react";
import axios from "axios";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, BedDouble, Building2, Layers, CheckCircle2, AlertCircle, Wrench, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/contexts/AuthContext";

// const initialData = [
//   { _id: '1', name: 'ICU-101', hospital: 'City General Hospital', floor: '1st', type: 'ICU', status: 'Operational', inventory: 12 },
//   { _id: '2', name: 'OR-201', hospital: 'City General Hospital', floor: '2nd', type: 'Operating', status: 'Operational', inventory: 8 },
//   { _id: '3', name: 'ER-001', hospital: "St. Mary's Medical Center", floor: 'Ground', type: 'Emergency', status: 'Maintenance', inventory: 0 },
//   { _id: '4', name: 'GW-301', hospital: 'Regional Health Campus', floor: '3rd', type: 'General Ward', status: 'Operational', inventory: 24 },
//   { _id: '5', name: 'PR-102', hospital: 'City General Hospital', floor: '1st', type: 'Private Room', status: 'Operational', inventory: 5 },
//   { _id: '6', name: 'SR-203', hospital: "St. Mary's Medical Center", floor: '2nd', type: 'Surgery Room', status: 'Operational', inventory: 18 },
// ];

const typeIcons = { ICU: '🏥', Operating: '⚕️', Emergency: '🚨', 'General Ward': '🛏️', 'Private Room': '🏠', 'Surgery Room': '🔬' };

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', hospital: '', floor: '', type: '', status: 'Operational', inventory: '' });
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/rooms");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/rooms");
        setRooms(res.data.rooms);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRooms();
  }, []);

  const filtered = rooms.filter(r => {
    const matchSearch = (r.name || "").toLowerCase().includes(search.toLowerCase()) || (r.type || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm({ name: '', hospital: '', floor: '', type: '', status: 'Operational', inventory: '' }); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, hospital: r.hospital, floor: r.floor, type: r.type, status: r.status, inventory: String(r.inventory) }); setDialogOpen(true); };

  const save = async () => {
    try {
      if (editing) {
        const res = await axios.put(
          // `http://localhost:3000/api/v1/rooms/${editing._id}`,
          `https://invora-qkwq.onrender.com/api/v1/rooms/${editing._id}`,
          { ...form, inventory: Number(form.inventory) }
        );

        setRooms(prev =>
          prev.map(r => r._id === editing._id ? res.data.room : r)
        );

        toast({ title: "Room updated" });

      } else {
        const res = await axios.post(
          // "http://localhost:3000/api/v1/rooms",
          "https://invora-qkwq.onrender.com/api/v1/rooms",
          { ...form, inventory: Number(form.inventory) }
        );

        setRooms(prev => [...prev, res.data.room]);

        toast({ title: "Room added" });
      }

      setDialogOpen(false);

    } catch (err) {
      console.error(err);
    }
  };

  // const save = () => {
  //   if (!form.name) return;
  //   if (editing) {
  //     setRooms(prev => prev.map(r => r._id === editing._id ? { ...r, ...form, inventory: Number(form.inventory) } : r));
  //     toast({ title: 'Room updated' });
  //   } else {
  //     setRooms(prev => [...prev, { _id: Date.now().toString(), ...form, inventory: Number(form.inventory) }]);
  //     toast({ title: 'Room added' });
  //   }
  //   setDialogOpen(false);
  // };

  // const remove = (id) => { setRooms(prev => prev.filter(r => r._id !== id)); toast({ title: 'Room deleted', variant: 'destructive' }); };

  const remove = async (id) => {
    try {
      // await axios.delete(`http://localhost:3000/api/v1/rooms/${id}`);
      await axios.delete(`https://invora-qkwq.onrender.com/api/v1/rooms/${id}`);
      setRooms(prev => prev.filter(r => r._id !== id));
      toast({ title: "Room deleted", variant: "destructive" });
    } catch (err) {
      console.error(err);
    }
  };

  const statusConfig = {
    Operational: { color: 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))] border-[hsl(var(--stat-green)/0.3)]', icon: CheckCircle2 },
    Maintenance: { color: 'bg-[hsl(var(--stat-yellow-light))] text-[hsl(var(--stat-yellow))] border-[hsl(var(--stat-yellow)/0.3)]', icon: Wrench },
    Inactive: { color: 'bg-[hsl(var(--stat-coral-light))] text-[hsl(var(--stat-coral))] border-[hsl(var(--stat-coral)/0.3)]', icon: AlertCircle },
  };

  const stats = {
    total: rooms.length,
    operational: rooms.filter(r => r.status === 'Operational').length,
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage hospital room assignments</p>
        </div>
        {isAdmin && (
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Room
            </Button>
        )}
        {/* <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Room
        </Button> */}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Rooms', value: stats.total, color: 'bg-[hsl(var(--stat-blue-light))] text-[hsl(var(--stat-blue))]' },
          { label: 'Operational', value: stats.operational, color: 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))]' },
          { label: 'Maintenance', value: stats.maintenance, color: 'bg-[hsl(var(--stat-yellow-light))] text-[hsl(var(--stat-yellow))]' },
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
          <Input placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <div className="flex gap-2">
          {['All', 'Operational', 'Maintenance'].map(f => (
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
          const sc = statusConfig[r.status] || statusConfig.Operational;
          const StatusIcon = sc.icon;
          return (
            <div key={r._id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-all">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-bold text-foreground">{r.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{r.type}</span>
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wide">{r.floor} Floor</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${sc.color}`}>
                  <StatusIcon className="h-3 w-3" />{r.status.toUpperCase()}
                </span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full border-2 border-[hsl(var(--stat-green)/0.3)] flex items-center justify-center">
                    <BedDouble className="h-4 w-4 text-[hsl(var(--stat-green))]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Type</div>
                    <div className="text-sm font-semibold text-foreground">{typeIcons[r.type] || '🏥'} {r.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Inventory</div>
                  <div className="text-sm font-bold text-[hsl(var(--stat-blue))]">{r.inventory} Items</div>
                </div>
              </div>

              {/* Hospital */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{r.hospital}</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className={`h-2 w-2 rounded-full ${r.status === 'Operational' ? 'bg-[hsl(var(--stat-green))]' : 'bg-[hsl(var(--stat-yellow))]'}`} />
                  <span className="text-muted-foreground">{r.status}</span>
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
            <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No rooms found</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Hospital</Label><Input value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Floor</Label><Input value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} /></div>
              <div><Label>Type</Label><Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Status</Label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option>Operational</option><option>Maintenance</option><option>Inactive</option>
                </select>
              </div>
              <div><Label>Inventory Items</Label><Input type="number" value={form.inventory} onChange={e => setForm(f => ({ ...f, inventory: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
