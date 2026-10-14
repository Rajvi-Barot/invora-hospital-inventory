import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// const initialData = [
//   { _id: '1', name: 'Emily Williams', email: 'emily@hospital.com', department: 'ICU', shift: 'Day', status: 'Active' },
//   { _id: '2', name: 'James Carter', email: 'james@hospital.com', department: 'ER', shift: 'Night', status: 'Active' },
//   { _id: '3', name: 'Maria Garcia', email: 'maria@hospital.com', department: 'Surgery', shift: 'Day', status: 'On Leave' },
//   { _id: '4', name: 'Robert Chen', email: 'robert@hospital.com', department: 'General', shift: 'Rotating', status: 'Active' },
// ];

export default function Nurses() {
  // const [nurses, setNurses] = useState(initialData);
  const [nurses, setNurses] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', department: '', shift: '', status: 'Active' });
  const { toast } = useToast();

  const filtered = nurses.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
  const openAdd = () => { setEditing(null); setForm({ name: '', email: '', department: '', shift: '', status: 'Active' }); setDialogOpen(true); };
  const openEdit = (n) => { setEditing(n); setForm({ name: n.name, email: n.email, department: n.department, shift: n.shift, status: n.status }); setDialogOpen(true); };
  const save = async () => {
    try {
      const token = localStorage.getItem("token");

      if (editing) {
        const res = await axios.put(
          // `http://localhost:3000/api/v1/nurses/${editing._id}`,
          `https://invora-qkwq.onrender.com/api/v1/nurses/${editing._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNurses(prev =>
          prev.map(n => n._id === editing._id ? res.data.nurse : n)
        );

        toast({ title: "Nurse updated" });
      } else {
        const res = await axios.post(
          // "http://localhost:3000/api/v1/nurses",
          "https://invora-qkwq.onrender.com/api/v1/nurses",
          { ...form, password: "123456" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNurses(prev => [...prev, res.data.nurse]);

        toast({ title: "Nurse added" });
      }

      setDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  // const remove = (id) => { setNurses(prev => prev.filter(n => n._id !== id)); toast({ title: 'Nurse removed', variant: 'destructive' }); };

  const remove = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        // `http://localhost:3000/api/v1/nurses/${id}`,
        `https://invora-qkwq.onrender.com/api/v1/nurses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNurses(prev => prev.filter(n => n._id !== id));
      toast({ title: "Nurse removed", variant: "destructive" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchNurses = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          // "http://localhost:3000/api/v1/nurses",
          "https://invora-qkwq.onrender.com/api/v1/nurses",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setNurses(res.data.nurses);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNurses();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Nurse Management</h1><p className="text-muted-foreground text-sm">Admin-only nurse management</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" /> Add Nurse</Button>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search nurses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div>
      <Card className="border-none shadow-sm"><CardContent className="p-0">
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Department</TableHead><TableHead>Shift</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{filtered.map(n => (
          <TableRow key={n._id}><TableCell className="font-medium">{n.name}</TableCell><TableCell>{n.email}</TableCell><TableCell>{n.department}</TableCell><TableCell>{n.shift}</TableCell>
          <TableCell><Badge variant={n.status === 'Active' ? 'default' : 'secondary'}>{n.status}</Badge></TableCell>
          <TableCell className="text-right space-x-2"><Button variant="ghost" size="icon" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => remove(n._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell></TableRow>
        ))}{filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No nurses found</TableCell></TableRow>}</TableBody></Table>
      </CardContent></Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit Nurse' : 'Add Nurse'}</DialogTitle></DialogHeader>
        <div className="space-y-4"><div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div><div><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div><div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div><div><Label>Shift</Label><Input value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} /></div><div><Label>Status</Label><Input value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} /></div></div>
        <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
