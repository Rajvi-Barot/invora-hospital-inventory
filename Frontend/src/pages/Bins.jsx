import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search, Thermometer, Package, FlaskConical, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/contexts/AuthContext";

// const initialData = [
//   { _id: '1', label: 'BIN-001', rack: 'Rack-A1', contents: 'Insulin Vials', temperature: 4.2, quantity: 48 },
//   { _id: '2', label: 'BIN-002', rack: 'Rack-A1', contents: 'Blood Samples', temperature: 3.8, quantity: 12 },
//   { _id: '3', label: 'BIN-003', rack: 'Rack-B2', contents: 'Vaccines', temperature: 5.1, quantity: 30 },
//   { _id: '4', label: 'BIN-004', rack: 'Rack-C1', contents: 'Plasma Units', temperature: 9.5, quantity: 8 },
//   { _id: '5', label: 'BIN-005', rack: 'Rack-D3', contents: 'Antibiotics', temperature: 2.3, quantity: 100 },
//   { _id: '6', label: 'BIN-006', rack: 'Rack-E2', contents: 'Saline Solution', temperature: 6.7, quantity: 55 },
// ];

export default function Bins() {
  const [bins, setBins] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSafety, setFilterSafety] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ label: '', rack: '', contents: '', temperature: '', quantity: '' });
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchBins = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/bins");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/bins");
        setBins(res.data.bins);
      } catch (err) {
        console.error("Failed to fetch bins:", err);
      }
    };

    fetchBins();
  }, []);

  const isSafe = (t) => t >= 2 && t <= 8;

  const filtered = bins.filter(b => {
    const matchSearch = b.label.toLowerCase().includes(search.toLowerCase()) || b.contents.toLowerCase().includes(search.toLowerCase());
    const matchSafety = filterSafety === 'All' || (filterSafety === 'Safe' && isSafe(b.temperature)) || (filterSafety === 'Alert' && !isSafe(b.temperature));
    return matchSearch && matchSafety;
  });

  const openAdd = () => { setEditing(null); setForm({ label: '', rack: '', contents: '', temperature: '', quantity: '' }); setDialogOpen(true); };
  // const openEdit = (b) => { setEditing(b); setForm({ label: b.label, rack: b.rack, contents: b.contents, temperature: String(b.temperature), quantity: String(b.quantity) }); setDialogOpen(true); };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      label: b.label,
      rack: b.rack?.name || "",
      contents: b.contents,
      temperature: String(b.temperature),
      quantity: String(b.quantity)
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.label) return;

    try {
      if (editing) {
        const res = await axios.put(
          // `http://localhost:3000/api/v1/bins/${editing._id}`,
          `https://invora-qkwq.onrender.com/api/v1/bins/${editing._id}`,
          form
        );

        setBins(prev =>
          prev.map(b => b._id === editing._id ? res.data.bin : b)
        );

        toast({ title: "Bin updated" });
      } else {
        const res = await axios.post(
          // "http://localhost:3000/api/v1/bins",
          "https://invora-qkwq.onrender.com/api/v1/bins",
          form
        );

        setBins(prev => [...prev, res.data.bin]);

        toast({ title: "Bin added" });
      }

      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: "Operation failed", variant: "destructive" });
    }
  };

  // const save = () => {
  //   if (!form.label) return;
  //   if (editing) {
  //     setBins(prev => prev.map(b => b._id === editing._id ? { ...b, ...form, temperature: Number(form.temperature), quantity: Number(form.quantity) } : b));
  //     toast({ title: 'Bin updated' });
  //   } else {
  //     setBins(prev => [...prev, { _id: Date.now().toString(), ...form, temperature: Number(form.temperature), quantity: Number(form.quantity) }]);
  //     toast({ title: 'Bin added' });
  //   }
  //   setDialogOpen(false);
  // };

  // const remove = (id) => { setBins(prev => prev.filter(b => b._id !== id)); toast({ title: 'Bin deleted', variant: 'destructive' }); };

  const remove = async (id) => {
    try {
      // await axios.delete(`http://localhost:3000/api/v1/bins/${id}`);
      await axios.delete(`https://invora-qkwq.onrender.com/api/v1/bins/${id}`);
      setBins(prev => prev.filter(b => b._id !== id));
      toast({ title: "Bin deleted", variant: "destructive" });
    } catch (err) {
      console.error(err);
    }
  };

  const safeCount = bins.filter(b => isSafe(b.temperature)).length;
  const alertCount = bins.length - safeCount;

  const getTempGradient = (temp) => {
    if (temp < 2) return { bar: 'hsl(var(--stat-blue))', label: 'Too Cold', bg: 'bg-[hsl(var(--stat-blue-light))] text-[hsl(var(--stat-blue))]' };
    if (temp > 8) return { bar: 'hsl(var(--stat-coral))', label: 'Too Warm', bg: 'bg-[hsl(var(--stat-coral-light))] text-[hsl(var(--stat-coral))]' };
    return { bar: 'hsl(var(--stat-green))', label: 'Safe', bg: 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))]' };
  };

  // Map temp 0-15°C to 0-100% for the bar
  const tempPct = (t) => Math.min(100, Math.max(0, (t / 15) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bins</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Monitor storage bins and temperature safety</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Bin
          </Button>
        )}
        {/* <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Bin
        </Button> */}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Bins', value: bins.length, color: 'bg-[hsl(var(--stat-blue-light))] text-[hsl(var(--stat-blue))]' },
          { label: 'Safe Temp', value: safeCount, color: 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))]' },
          { label: 'Temp Alerts', value: alertCount, color: 'bg-[hsl(var(--stat-coral-light))] text-[hsl(var(--stat-coral))]' },
          { label: 'Total Items', value: bins.reduce((a, b) => a + b.quantity, 0), color: 'bg-[hsl(var(--stat-yellow-light))] text-[hsl(var(--stat-yellow))]' },
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
          <Input placeholder="Search bins or contents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card" />
        </div>
        <div className="flex gap-2">
          {['All', 'Safe', 'Alert'].map(f => (
            <button key={f} onClick={() => setFilterSafety(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterSafety === f ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-card text-muted-foreground hover:text-foreground border border-border'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(b => {
          const safe = isSafe(b.temperature);
          const tc = getTempGradient(b.temperature);
          const pct = tempPct(b.temperature);
          return (
            <div key={b._id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md transition-all">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-bold text-foreground">{b.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">{b.contents}</span>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${safe
                  ? 'bg-[hsl(var(--stat-green-light))] text-[hsl(var(--stat-green))] border-[hsl(var(--stat-green)/0.3)]'
                  : 'bg-[hsl(var(--stat-coral-light))] text-[hsl(var(--stat-coral))] border-[hsl(var(--stat-coral)/0.3)]'}`}>
                  {safe ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {tc.label.toUpperCase()}
                </span>
              </div>

              {/* Temperature Visual */}
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: tc.bar }}>
                      <Thermometer className="h-4 w-4" style={{ color: tc.bar }} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Temperature</div>
                      <div className="text-lg font-bold" style={{ color: tc.bar }}>{b.temperature}°C</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Quantity</div>
                    <div className="text-lg font-bold text-[hsl(var(--stat-blue))]">{b.quantity}</div>
                  </div>
                </div>
                {/* Temp bar with safe zone indicator */}
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: tc.bar }} />
                  {/* Safe zone markers at 2°C (13%) and 8°C (53%) */}
                  <div className="absolute top-0 h-full w-0.5 bg-white/60" style={{ left: '13%' }} />
                  <div className="absolute top-0 h-full w-0.5 bg-white/60" style={{ left: '53%' }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0°C</span><span className="text-[hsl(var(--stat-green))] font-medium">Safe: 2–8°C</span><span>15°C</span>
                </div>
              </div>

              {/* Rack info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4 shrink-0" />
                <span>Stored in <span className="font-semibold text-foreground">{b.rack?.name}</span></span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{b.quantity} units</span>
                </div>
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(b._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </>
                  )}
                  {/* <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(b._id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button> */}
                  <Button variant="ghost" size="sm" className="h-8 text-primary gap-1 text-xs font-semibold">View <ArrowRight className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <FlaskConical className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No bins found</p>
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Bin' : 'Add Bin'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Label</Label><Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></div>
              <div><Label>Rack</Label><Input value={form.rack} onChange={e => setForm(f => ({ ...f, rack: e.target.value }))} /></div>
            </div>
            <div><Label>Contents</Label><Input placeholder="e.g. Insulin Vials..." value={form.contents} onChange={e => setForm(f => ({ ...f, contents: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} /></div>
              <div><Label>Quantity (units)</Label><Input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
