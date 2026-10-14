import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Search, Building2, MapPin, Bed, Phone, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from "@/contexts/AuthContext";

const filters = ['All', 'Active', 'Unsafe Rooms', 'Low Stock'];

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', beds: '', contact: '' });
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // ✅ FETCH DATA (correct location)
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/hospitals");
        // const res = await axios.get(`${API}/api/v1/hospital`);
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/hospitals");

        const hospitalsWithIds = res.data.hospitals.map(hospital => ({
          ...hospital,
          rooms: (hospital.rooms || []).map(room =>
            typeof room === "string" ? room : room.name
          )
        }));

        setHospitals(hospitalsWithIds);
      } catch (err) {
        console.error("Failed to fetch hospitals:", err);
      }
    };

    fetchHospitals();
  }, []);

  // ✅ FILTER LOGIC (clean now)
  const filtered = hospitals.filter(h => {
    const matchSearch =
      (h?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (h?.location ?? "").toLowerCase().includes(search.toLowerCase());

    if (activeFilter === 'Unsafe Rooms') return matchSearch && (h?.status ?? "") === 'unsafe';
    if (activeFilter === 'Low Stock') return matchSearch && (h?.status ?? "") === 'low-stock';
    return matchSearch;
  });

  const totalHospitals = hospitals.length;
  const unsafeRooms = hospitals
    .filter(h => (h?.status ?? "") === 'unsafe')
    .reduce((acc, h) => acc + (h.unsafeRooms || 0), 0);

  const lowStockItems = hospitals
    .filter(h => (h?.status ?? "") === 'low-stock')
    .reduce((acc, h) => acc + (h.lowStockCount || 0), 0);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', location: '', beds: '', contact: '' });
    setDialogOpen(true);
  };

  const openEdit = (h) => {
    setEditing(h);
    setForm({
      name: h.name,
      location: h.location,
      beds: String(h.beds),
      contact: h.contact
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.location) return;

    try {
      if (editing) {
        const res = await axios.put(
          // `http://localhost:3000/api/v1/hospitals/${editing._id}`,
          "https://invora-qkwq.onrender.com/api/v1/hospitals/" + editing._id,
          { ...form, beds: Number(form.beds) }
        );

        setHospitals(prev =>
          prev.map(h => (h._id === editing._id ? res.data.hospital : h))
        );

        toast({ title: 'Hospital updated' });
      } else {
        const res = await axios.post(
          // `http://localhost:3000/api/v1/hospitals`,
          "https://invora-qkwq.onrender.com/api/v1/hospitals",
          { ...form, beds: Number(form.beds) }
        );

        setHospitals(prev => [...prev, res.data.hospital]);

        toast({ title: 'Hospital added' });
      }

      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Operation failed', variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    try {
      // await axios.delete(`http://localhost:3000/api/v1/hospitals/${id}`);
      await axios.delete(`https://invora-qkwq.onrender.com/api/v1/hospitals/${id}`);

      setHospitals(prev => prev.filter(h => h._id !== id));

      toast({ title: 'Hospital deleted', variant: 'destructive' });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (hospital) => {
    if (!hospital) return null;

    if (hospital?.status === 'unsafe') {
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <AlertTriangle className="h-3 w-3" />
          Unsafe: {hospital?.unsafeRooms ?? 0} room
        </Badge>
      );
    }

    if (hospital?.status === 'low-stock') {
      return (
        <Badge className="gap-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
          <CheckCircle2 className="h-3 w-3" />
          Low Stock: {hospital?.lowStockCount ?? 0} item
          {hospital?.lowStockCount > 1 ? 's' : ''}
        </Badge>
      );
    }

    return (
      <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
        <CheckCircle2 className="h-3 w-3" />
        {hospital?.monitoredRooms ?? 0} monitored rooms
      </Badge>
    );
  };

    return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hospitals</h1>
          <p className="text-muted-foreground text-sm">Manage and monitor hospital facilities</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
          </Button>
        )}
        {/* <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
        </Button> */}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Button
              key={f}
              variant={activeFilter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(f)}
              className={activeFilter === f ? '' : 'bg-background'}
            >
              {f === 'Unsafe Rooms' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />}
              {f}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(h => (
          <Card key={h._id} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-5 space-y-3">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-base">{h?.name?? ""}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" /> {h?.location??""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Status Badge */}
              <div>{getStatusBadge(h)}</div>

              {/* Rooms */}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{h?.rooms?.join(', ') || "No rooms"}</span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {h?.beds??0} beds</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {h?.contact??""}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button size="sm" className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> View
                </Button>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(h)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(h._id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                )}
                {/* <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(h?._id ?? "")}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hospitals found</p>
        </div>
      )}

      {/* Summary Footer */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-8 text-sm">
            <div><span className="text-muted-foreground">Total Hospitals:</span> <span className="font-bold ml-1">{totalHospitals}</span></div>
            <div><span className="text-muted-foreground">Unsafe Rooms:</span> <span className="font-bold ml-1 text-destructive">{unsafeRooms}</span></div>
            <div><span className="text-muted-foreground">Low Stock Items:</span> <span className="font-bold ml-1 text-amber-600">{lowStockItems}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><Label>Beds</Label><Input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} /></div>
            <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// import { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Plus, Search, Building2, MapPin, Bed, Phone, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// const initialData = [
//   { _id: '1', name: 'City General Hospital', location: 'Toronto, ON', beds: 320, contact: '+1-555-0101', rooms: ['Blood Bank', 'ICU'], status: 'safe', monitoredRooms: 2 },
//   { _id: '2', name: 'Metro Medical Center', location: 'New York, NY', beds: 180, contact: '+1-555-0102', rooms: ['ICU', 'Emergency'], status: 'safe', monitoredRooms: 2 },
//   { _id: '3', name: 'Unified Healthcare', location: 'Chicago, IL', beds: 450, contact: '+1-555-0103', rooms: ['Blood Bank', 'ICU'], status: 'low-stock', monitoredRooms: 3, lowStockCount: 1 },
//   { _id: '4', name: 'St. John\'s Hospital', location: 'Dallas, TX', beds: 200, contact: '+1-555-0104', rooms: ['Blood Bank', 'ICU'], status: 'safe', monitoredRooms: 2 },
//   { _id: '5', name: 'River Valley Hospital', location: 'Portland, OR', beds: 275, contact: '+1-555-0105', rooms: ['ICU', 'General Ward'], status: 'unsafe', monitoredRooms: 2, unsafeRooms: 1 },
//   { _id: '6', name: 'Regional Health Campus', location: 'Seattle, WA', beds: 380, contact: '+1-555-0106', rooms: ['Blood Bank', 'OR'], status: 'low-stock', monitoredRooms: 4, lowStockCount: 3 },
// ];

// const filters = ['All', 'Active', 'Unsafe Rooms', 'Low Stock'];

// export default function Hospitals() {
//   const [hospitals, setHospitals] = useState(initialData);
//   const [search, setSearch] = useState('');
//   const [activeFilter, setActiveFilter] = useState('All');
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({ name: '', location: '', beds: '', contact: '' });
//   const { toast } = useToast();

//   const filtered = hospitals.filter(h => {
//     const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
//     if (activeFilter === 'Unsafe Rooms') return matchSearch && h.status === 'unsafe';
//     if (activeFilter === 'Low Stock') return matchSearch && h.status === 'low-stock';
//     return matchSearch;
//   });

//   const totalHospitals = hospitals.length;
//   const unsafeRooms = hospitals.filter(h => h.status === 'unsafe').reduce((acc, h) => acc + (h.unsafeRooms || 0), 0);
//   const lowStockItems = hospitals.filter(h => h.status === 'low-stock').reduce((acc, h) => acc + (h.lowStockCount || 0), 0);

//   const openAdd = () => { setEditing(null); setForm({ name: '', location: '', beds: '', contact: '' }); setDialogOpen(true); };
//   const openEdit = (h) => { setEditing(h); setForm({ name: h.name, location: h.location, beds: String(h.beds), contact: h.contact }); setDialogOpen(true); };

//   const save = () => {
//     if (!form.name || !form.location) return;
//     if (editing) {
//       setHospitals(prev => prev.map(h => h._id === editing._id ? { ...h, ...form, beds: Number(form.beds) } : h));
//       toast({ title: 'Hospital updated' });
//     } else {
//       setHospitals(prev => [...prev, { _id: Date.now().toString(), ...form, beds: Number(form.beds), rooms: [], status: 'safe', monitoredRooms: 0 }]);
//       toast({ title: 'Hospital added' });
//     }
//     setDialogOpen(false);
//   };

//   const remove = (id) => {
//     setHospitals(prev => prev.filter(h => h._id !== id));
//     toast({ title: 'Hospital deleted', variant: 'destructive' });
//   };

//   const getStatusBadge = (hospital) => {
//     if (hospital.status === 'unsafe') {
//       return <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="h-3 w-3" /> Unsafe: {hospital.unsafeRooms} room</Badge>;
//     }
//     if (hospital.status === 'low-stock') {
//       return <Badge className="gap-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="h-3 w-3" /> Low Stock: {hospital.lowStockCount} item{hospital.lowStockCount > 1 ? 's' : ''}</Badge>;
//     }
//     return <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {hospital.monitoredRooms} monitored rooms</Badge>;
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Hospitals</h1>
//           <p className="text-muted-foreground text-sm">Manage and monitor hospital facilities</p>
//         </div>
//         <Button onClick={openAdd} className="gap-2">
//           <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
//         </Button>
//       </div>

//       {/* Filters & Search */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <div className="flex gap-2 flex-wrap">
//           {filters.map(f => (
//             <Button
//               key={f}
//               variant={activeFilter === f ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setActiveFilter(f)}
//               className={activeFilter === f ? '' : 'bg-background'}
//             >
//               {f === 'Unsafe Rooms' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />}
//               {f}
//             </Button>
//           ))}
//         </div>
//         <div className="relative w-full sm:w-72">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
//         </div>
//       </div>

//       {/* Hospital Cards Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//         {filtered.map(h => (
//           <Card key={h._id} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
//             <CardContent className="p-5 space-y-3">
//               {/* Card Header */}
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h3 className="font-semibold text-base">{h.name}</h3>
//                   <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
//                     <MapPin className="h-3.5 w-3.5" /> {h.location}
//                   </p>
//                 </div>
//                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Status Badge */}
//               <div>{getStatusBadge(h)}</div>

//               {/* Rooms */}
//               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                 <Building2 className="h-3.5 w-3.5" />
//                 <span>{h.rooms.join(', ')}</span>
//               </div>

//               {/* Stats Row */}
//               <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
//                 <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {h.beds} beds</span>
//                 <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {h.contact}</span>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center justify-between pt-2 border-t">
//                 <Button size="sm" className="gap-1.5">
//                   <Eye className="h-3.5 w-3.5" /> View
//                 </Button>
//                 <div className="flex gap-1">
//                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}>
//                     <Pencil className="h-3.5 w-3.5" />
//                   </Button>
//                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(h._id)}>
//                     <Trash2 className="h-3.5 w-3.5 text-destructive" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filtered.length === 0 && (
//         <div className="text-center py-12 text-muted-foreground">
//           <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
//           <p>No hospitals found</p>
//         </div>
//       )}

//       {/* Summary Footer */}
//       <Card className="border shadow-sm">
//         <CardContent className="p-4">
//           <div className="flex flex-wrap gap-8 text-sm">
//             <div><span className="text-muted-foreground">Total Hospitals:</span> <span className="font-bold ml-1">{totalHospitals}</span></div>
//             <div><span className="text-muted-foreground">Unsafe Rooms:</span> <span className="font-bold ml-1 text-destructive">{unsafeRooms}</span></div>
//             <div><span className="text-muted-foreground">Low Stock Items:</span> <span className="font-bold ml-1 text-amber-600">{lowStockItems}</span></div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Add/Edit Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader><DialogTitle>{editing ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle></DialogHeader>
//           <div className="space-y-4">
//             <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
//             <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
//             <div><Label>Beds</Label><Input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} /></div>
//             <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
//           </div>
//           <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Plus, Search, Building2, MapPin, Bed, Phone, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// const filters = ['All', 'Active', 'Unsafe Rooms', 'Low Stock'];

// export default function Hospitals() {
//   const [hospitals, setHospitals] = useState([]);
//   const [search, setSearch] = useState('');
//   const [activeFilter, setActiveFilter] = useState('All');
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({ name: '', location: '', beds: '', contact: '' });
//   const { toast } = useToast();

//   // ✅ FETCH DATA (correct location)
//   useEffect(() => {
//     const fetchHospitals = async () => {
//       try {
//         const res = await axios.get("http://localhost:3000/api/v1/hospitals");

//         const hospitalsWithIds = res.data.hospitals.map(hospital => ({
//           ...hospital,
//           rooms: (hospital.rooms || []).map(room =>
//             typeof room === "string" ? room : room.name
//           )
//         }));

//         setHospitals(hospitalsWithIds);
//       } catch (err) {
//         console.error("Failed to fetch hospitals:", err);
//       }
//     };

//     fetchHospitals();
//   }, []);

//   // ✅ FILTER LOGIC (clean now)
//   const filtered = hospitals.filter(h => {
//     const matchSearch =
//       (h?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
//       (h?.location ?? "").toLowerCase().includes(search.toLowerCase());

//     if (activeFilter === 'Unsafe Rooms') return matchSearch && (h?.status ?? "") === 'unsafe';
//     if (activeFilter === 'Low Stock') return matchSearch && (h?.status ?? "") === 'low-stock';
//     return matchSearch;
//   });

//   const totalHospitals = hospitals.length;
//   const unsafeRooms = hospitals
//     .filter(h => (h?.status ?? "") === 'unsafe')
//     .reduce((acc, h) => acc + (h.unsafeRooms || 0), 0);

//   const lowStockItems = hospitals
//     .filter(h => (h?.status ?? "") === 'low-stock')
//     .reduce((acc, h) => acc + (h.lowStockCount || 0), 0);

//   const openAdd = () => {
//     setEditing(null);
//     setForm({ name: '', location: '', beds: '', contact: '' });
//     setDialogOpen(true);
//   };

//   const openEdit = (h) => {
//     setEditing(h);
//     setForm({
//       name: h.name,
//       location: h.location,
//       beds: String(h.beds),
//       contact: h.contact
//     });
//     setDialogOpen(true);
//   };

//   const save = async () => {
//     if (!form.name || !form.location) return;

//     try {
//       if (editing) {
//         const res = await axios.put(
//           `http://localhost:3000/api/v1/hospitals/${editing._id}`,
//           { ...form, beds: Number(form.beds) }
//         );

//         setHospitals(prev =>
//           prev.map(h => (h._id === editing._id ? res.data.hospital : h))
//         );

//         toast({ title: 'Hospital updated' });
//       } else {
//         const res = await axios.post(
//           `http://localhost:3000/api/v1/hospitals`,
//           { ...form, beds: Number(form.beds) }
//         );

//         setHospitals(prev => [...prev, res.data.hospital]);

//         toast({ title: 'Hospital added' });
//       }

//       setDialogOpen(false);
//     } catch (err) {
//       console.error(err);
//       toast({ title: 'Operation failed', variant: 'destructive' });
//     }
//   };

//   const remove = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3000/api/v1/hospitals/${id}`);

//       setHospitals(prev => prev.filter(h => h._id !== id));

//       toast({ title: 'Hospital deleted', variant: 'destructive' });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const getStatusBadge = (hospital) => {
//     if (!hospital) return null;

//     if (hospital?.status === 'unsafe') {
//       return (
//         <Badge variant="destructive" className="gap-1 text-xs">
//           <AlertTriangle className="h-3 w-3" />
//           Unsafe: {hospital?.unsafeRooms ?? 0} room
//         </Badge>
//       );
//     }

//     if (hospital?.status === 'low-stock') {
//       return (
//         <Badge className="gap-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
//           <CheckCircle2 className="h-3 w-3" />
//           Low Stock: {hospital?.lowStockCount ?? 0} item
//           {hospital?.lowStockCount > 1 ? 's' : ''}
//         </Badge>
//       );
//     }

//     return (
//       <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
//         <CheckCircle2 className="h-3 w-3" />
//         {hospital?.monitoredRooms ?? 0} monitored rooms
//       </Badge>
//     );
//   };

//     return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Hospitals</h1>
//           <p className="text-muted-foreground text-sm">Manage and monitor hospital facilities</p>
//         </div>
//         <Button onClick={openAdd} className="gap-2">
//           <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
//         </Button>
//       </div>

//       {/* Filters & Search */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <div className="flex gap-2 flex-wrap">
//           {filters.map(f => (
//             <Button
//               key={f}
//               variant={activeFilter === f ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setActiveFilter(f)}
//               className={activeFilter === f ? '' : 'bg-background'}
//             >
//               {f === 'Unsafe Rooms' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />}
//               {f}
//             </Button>
//           ))}
//         </div>
//         <div className="relative w-full sm:w-72">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
//         </div>
//       </div>

//       {/* Hospital Cards Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//         {filtered.map(h => (
//           <Card key={h._id} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
//             <CardContent className="p-5 space-y-3">
//               {/* Card Header */}
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h3 className="font-semibold text-base">{h?.name?? ""}</h3>
//                   <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
//                     <MapPin className="h-3.5 w-3.5" /> {h?.location??""}
//                   </p>
//                 </div>
//                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </div>

//               {/* Status Badge */}
//               <div>{getStatusBadge(h)}</div>

//               {/* Rooms */}
//               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                 <Building2 className="h-3.5 w-3.5" />
//                 <span>{h?.rooms?.join(', ') || "No rooms"}</span>
//               </div>

//               {/* Stats Row */}
//               <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
//                 <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {h?.beds??0} beds</span>
//                 <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {h?.contact??""}</span>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center justify-between pt-2 border-t">
//                 <Button size="sm" className="gap-1.5">
//                   <Eye className="h-3.5 w-3.5" /> View
//                 </Button>
//                 <div className="flex gap-1">
//                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}>
//                     <Pencil className="h-3.5 w-3.5" />
//                   </Button>
//                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(h?._id ?? "")}>
//                     <Trash2 className="h-3.5 w-3.5 text-destructive" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filtered.length === 0 && (
//         <div className="text-center py-12 text-muted-foreground">
//           <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
//           <p>No hospitals found</p>
//         </div>
//       )}

//       {/* Summary Footer */}
//       <Card className="border shadow-sm">
//         <CardContent className="p-4">
//           <div className="flex flex-wrap gap-8 text-sm">
//             <div><span className="text-muted-foreground">Total Hospitals:</span> <span className="font-bold ml-1">{totalHospitals}</span></div>
//             <div><span className="text-muted-foreground">Unsafe Rooms:</span> <span className="font-bold ml-1 text-destructive">{unsafeRooms}</span></div>
//             <div><span className="text-muted-foreground">Low Stock Items:</span> <span className="font-bold ml-1 text-amber-600">{lowStockItems}</span></div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Add/Edit Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader><DialogTitle>{editing ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle></DialogHeader>
//           <div className="space-y-4">
//             <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
//             <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
//             <div><Label>Beds</Label><Input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} /></div>
//             <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
//           </div>
//           <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// // import { useState } from 'react';
// // import { Card, CardContent } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Badge } from '@/components/ui/badge';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// // import { Plus, Search, Building2, MapPin, Bed, Phone, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
// // import { useToast } from '@/hooks/use-toast';

// // const initialData = [
// //   { _id: '1', name: 'City General Hospital', location: 'Toronto, ON', beds: 320, contact: '+1-555-0101', rooms: ['Blood Bank', 'ICU'], status: 'safe', monitoredRooms: 2 },
// //   { _id: '2', name: 'Metro Medical Center', location: 'New York, NY', beds: 180, contact: '+1-555-0102', rooms: ['ICU', 'Emergency'], status: 'safe', monitoredRooms: 2 },
// //   { _id: '3', name: 'Unified Healthcare', location: 'Chicago, IL', beds: 450, contact: '+1-555-0103', rooms: ['Blood Bank', 'ICU'], status: 'low-stock', monitoredRooms: 3, lowStockCount: 1 },
// //   { _id: '4', name: 'St. John\'s Hospital', location: 'Dallas, TX', beds: 200, contact: '+1-555-0104', rooms: ['Blood Bank', 'ICU'], status: 'safe', monitoredRooms: 2 },
// //   { _id: '5', name: 'River Valley Hospital', location: 'Portland, OR', beds: 275, contact: '+1-555-0105', rooms: ['ICU', 'General Ward'], status: 'unsafe', monitoredRooms: 2, unsafeRooms: 1 },
// //   { _id: '6', name: 'Regional Health Campus', location: 'Seattle, WA', beds: 380, contact: '+1-555-0106', rooms: ['Blood Bank', 'OR'], status: 'low-stock', monitoredRooms: 4, lowStockCount: 3 },
// // ];

// // const filters = ['All', 'Active', 'Unsafe Rooms', 'Low Stock'];

// // export default function Hospitals() {
// //   const [hospitals, setHospitals] = useState(initialData);
// //   const [search, setSearch] = useState('');
// //   const [activeFilter, setActiveFilter] = useState('All');
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [editing, setEditing] = useState(null);
// //   const [form, setForm] = useState({ name: '', location: '', beds: '', contact: '' });
// //   const { toast } = useToast();

// //   const filtered = hospitals.filter(h => {
// //     const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
// //     if (activeFilter === 'Unsafe Rooms') return matchSearch && h.status === 'unsafe';
// //     if (activeFilter === 'Low Stock') return matchSearch && h.status === 'low-stock';
// //     return matchSearch;
// //   });

// //   const totalHospitals = hospitals.length;
// //   const unsafeRooms = hospitals.filter(h => h.status === 'unsafe').reduce((acc, h) => acc + (h.unsafeRooms || 0), 0);
// //   const lowStockItems = hospitals.filter(h => h.status === 'low-stock').reduce((acc, h) => acc + (h.lowStockCount || 0), 0);

// //   const openAdd = () => { setEditing(null); setForm({ name: '', location: '', beds: '', contact: '' }); setDialogOpen(true); };
// //   const openEdit = (h) => { setEditing(h); setForm({ name: h.name, location: h.location, beds: String(h.beds), contact: h.contact }); setDialogOpen(true); };

// //   const save = () => {
// //     if (!form.name || !form.location) return;
// //     if (editing) {
// //       setHospitals(prev => prev.map(h => h._id === editing._id ? { ...h, ...form, beds: Number(form.beds) } : h));
// //       toast({ title: 'Hospital updated' });
// //     } else {
// //       setHospitals(prev => [...prev, { _id: Date.now().toString(), ...form, beds: Number(form.beds), rooms: [], status: 'safe', monitoredRooms: 0 }]);
// //       toast({ title: 'Hospital added' });
// //     }
// //     setDialogOpen(false);
// //   };

// //   const remove = (id) => {
// //     setHospitals(prev => prev.filter(h => h._id !== id));
// //     toast({ title: 'Hospital deleted', variant: 'destructive' });
// //   };

// //   const getStatusBadge = (hospital) => {
// //     if (hospital.status === 'unsafe') {
// //       return <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="h-3 w-3" /> Unsafe: {hospital.unsafeRooms} room</Badge>;
// //     }
// //     if (hospital.status === 'low-stock') {
// //       return <Badge className="gap-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="h-3 w-3" /> Low Stock: {hospital.lowStockCount} item{hospital.lowStockCount > 1 ? 's' : ''}</Badge>;
// //     }
// //     return <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {hospital.monitoredRooms} monitored rooms</Badge>;
// //   };

// //   return (
// //     <div className="space-y-6 animate-fade-in">
// //       {/* Header */}
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <h1 className="text-2xl font-bold">Hospitals</h1>
// //           <p className="text-muted-foreground text-sm">Manage and monitor hospital facilities</p>
// //         </div>
// //         <Button onClick={openAdd} className="gap-2">
// //           <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
// //         </Button>
// //       </div>

// //       {/* Filters & Search */}
// //       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
// //         <div className="flex gap-2 flex-wrap">
// //           {filters.map(f => (
// //             <Button
// //               key={f}
// //               variant={activeFilter === f ? 'default' : 'outline'}
// //               size="sm"
// //               onClick={() => setActiveFilter(f)}
// //               className={activeFilter === f ? '' : 'bg-background'}
// //             >
// //               {f === 'Unsafe Rooms' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />}
// //               {f}
// //             </Button>
// //           ))}
// //         </div>
// //         <div className="relative w-full sm:w-72">
// //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //           <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
// //         </div>
// //       </div>

// //       {/* Hospital Cards Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //         {filtered.map(h => (
// //           <Card key={h._id} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
// //             <CardContent className="p-5 space-y-3">
// //               {/* Card Header */}
// //               <div className="flex items-start justify-between">
// //                 <div>
// //                   <h3 className="font-semibold text-base">{h.name}</h3>
// //                   <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
// //                     <MapPin className="h-3.5 w-3.5" /> {h.location}
// //                   </p>
// //                 </div>
// //                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
// //                   <MoreHorizontal className="h-4 w-4" />
// //                 </Button>
// //               </div>

// //               {/* Status Badge */}
// //               <div>{getStatusBadge(h)}</div>

// //               {/* Rooms */}
// //               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
// //                 <Building2 className="h-3.5 w-3.5" />
// //                 <span>{h.rooms.join(', ')}</span>
// //               </div>

// //               {/* Stats Row */}
// //               <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
// //                 <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {h.beds} beds</span>
// //                 <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {h.contact}</span>
// //               </div>

// //               {/* Actions */}
// //               <div className="flex items-center justify-between pt-2 border-t">
// //                 <Button size="sm" className="gap-1.5">
// //                   <Eye className="h-3.5 w-3.5" /> View
// //                 </Button>
// //                 <div className="flex gap-1">
// //                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}>
// //                     <Pencil className="h-3.5 w-3.5" />
// //                   </Button>
// //                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(h._id)}>
// //                     <Trash2 className="h-3.5 w-3.5 text-destructive" />
// //                   </Button>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       {filtered.length === 0 && (
// //         <div className="text-center py-12 text-muted-foreground">
// //           <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
// //           <p>No hospitals found</p>
// //         </div>
// //       )}

// //       {/* Summary Footer */}
// //       <Card className="border shadow-sm">
// //         <CardContent className="p-4">
// //           <div className="flex flex-wrap gap-8 text-sm">
// //             <div><span className="text-muted-foreground">Total Hospitals:</span> <span className="font-bold ml-1">{totalHospitals}</span></div>
// //             <div><span className="text-muted-foreground">Unsafe Rooms:</span> <span className="font-bold ml-1 text-destructive">{unsafeRooms}</span></div>
// //             <div><span className="text-muted-foreground">Low Stock Items:</span> <span className="font-bold ml-1 text-amber-600">{lowStockItems}</span></div>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       {/* Add/Edit Dialog */}
// //       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
// //         <DialogContent>
// //           <DialogHeader><DialogTitle>{editing ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle></DialogHeader>
// //           <div className="space-y-4">
// //             <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
// //             <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
// //             <div><Label>Beds</Label><Input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} /></div>
// //             <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
// //           </div>
// //           <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   );
// // }

// // import { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { Card, CardContent } from '@/components/ui/card';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Label } from '@/components/ui/label';
// // import { Badge } from '@/components/ui/badge';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// // import { Plus, Search, Building2, MapPin, Bed, Phone, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
// // import { useToast } from '@/hooks/use-toast';

// // const filters = ['All', 'Active', 'Unsafe Rooms', 'Low Stock'];

// // export default function Hospitals() {
// //   const [hospitals, setHospitals] = useState([]);
// //   const [search, setSearch] = useState('');
// //   const [activeFilter, setActiveFilter] = useState('All');
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [editing, setEditing] = useState(null);
// //   const [form, setForm] = useState({ name: '', location: '', beds: '', contact: '' });
// //   const { toast } = useToast();

// //   // ✅ FETCH DATA (correct location)
// //   useEffect(() => {
// //     const fetchHospitals = async () => {
// //       try {
// //         const res = await axios.get("http://localhost:3000/api/v1/hospitals");

// //         const hospitalsWithIds = res.data.hospitals.map(hospital => ({
// //           ...hospital,
// //           rooms: (hospital.rooms || []).map(room =>
// //             typeof room === "string" ? room : room.name
// //           )
// //         }));

// //         setHospitals(hospitalsWithIds);
// //       } catch (err) {
// //         console.error("Failed to fetch hospitals:", err);
// //       }
// //     };

// //     fetchHospitals();
// //   }, []);

// //   // ✅ FILTER LOGIC (clean now)
// //   const filtered = hospitals.filter(h => {
// //     const matchSearch =
// //       (h?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
// //       (h?.location ?? "").toLowerCase().includes(search.toLowerCase());

// //     if (activeFilter === 'Unsafe Rooms') return matchSearch && (h?.status ?? "") === 'unsafe';
// //     if (activeFilter === 'Low Stock') return matchSearch && (h?.status ?? "") === 'low-stock';
// //     return matchSearch;
// //   });

// //   const totalHospitals = hospitals.length;
// //   const unsafeRooms = hospitals
// //     .filter(h => (h?.status ?? "") === 'unsafe')
// //     .reduce((acc, h) => acc + (h.unsafeRooms || 0), 0);

// //   const lowStockItems = hospitals
// //     .filter(h => (h?.status ?? "") === 'low-stock')
// //     .reduce((acc, h) => acc + (h.lowStockCount || 0), 0);

// //   const openAdd = () => {
// //     setEditing(null);
// //     setForm({ name: '', location: '', beds: '', contact: '' });
// //     setDialogOpen(true);
// //   };

// //   const openEdit = (h) => {
// //     setEditing(h);
// //     setForm({
// //       name: h.name,
// //       location: h.location,
// //       beds: String(h.beds),
// //       contact: h.contact
// //     });
// //     setDialogOpen(true);
// //   };

// //   const save = async () => {
// //     if (!form.name || !form.location) return;

// //     try {
// //       if (editing) {
// //         const res = await axios.put(
// //           `http://localhost:3000/api/v1/hospitals/${editing._id}`,
// //           { ...form, beds: Number(form.beds) }
// //         );

// //         setHospitals(prev =>
// //           prev.map(h => (h._id === editing._id ? res.data.hospital : h))
// //         );

// //         toast({ title: 'Hospital updated' });
// //       } else {
// //         const res = await axios.post(
// //           `http://localhost:3000/api/v1/hospitals`,
// //           { ...form, beds: Number(form.beds) }
// //         );

// //         setHospitals(prev => [...prev, res.data.hospital]);

// //         toast({ title: 'Hospital added' });
// //       }

// //       setDialogOpen(false);
// //     } catch (err) {
// //       console.error(err);
// //       toast({ title: 'Operation failed', variant: 'destructive' });
// //     }
// //   };

// //   const remove = async (id) => {
// //     try {
// //       await axios.delete(`http://localhost:3000/api/v1/hospitals/${id}`);

// //       setHospitals(prev => prev.filter(h => h._id !== id));

// //       toast({ title: 'Hospital deleted', variant: 'destructive' });
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const getStatusBadge = (hospital) => {
// //     if (!hospital) return null;

// //     if (hospital?.status === 'unsafe') {
// //       return (
// //         <Badge variant="destructive" className="gap-1 text-xs">
// //           <AlertTriangle className="h-3 w-3" />
// //           Unsafe: {hospital?.unsafeRooms ?? 0} room
// //         </Badge>
// //       );
// //     }

// //     if (hospital?.status === 'low-stock') {
// //       return (
// //         <Badge className="gap-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
// //           <CheckCircle2 className="h-3 w-3" />
// //           Low Stock: {hospital?.lowStockCount ?? 0} item
// //           {hospital?.lowStockCount > 1 ? 's' : ''}
// //         </Badge>
// //       );
// //     }

// //     return (
// //       <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
// //         <CheckCircle2 className="h-3 w-3" />
// //         {hospital?.monitoredRooms ?? 0} monitored rooms
// //       </Badge>
// //     );
// //   };

// //     return (
// //     <div className="space-y-6 animate-fade-in">
// //       {/* Header */}
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <h1 className="text-2xl font-bold">Hospitals</h1>
// //           <p className="text-muted-foreground text-sm">Manage and monitor hospital facilities</p>
// //         </div>
// //         <Button onClick={openAdd} className="gap-2">
// //           <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
// //         </Button>
// //       </div>

// //       {/* Filters & Search */}
// //       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
// //         <div className="flex gap-2 flex-wrap">
// //           {filters.map(f => (
// //             <Button
// //               key={f}
// //               variant={activeFilter === f ? 'default' : 'outline'}
// //               size="sm"
// //               onClick={() => setActiveFilter(f)}
// //               className={activeFilter === f ? '' : 'bg-background'}
// //             >
// //               {f === 'Unsafe Rooms' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />}
// //               {f}
// //             </Button>
// //           ))}
// //         </div>
// //         <div className="relative w-full sm:w-72">
// //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //           <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
// //         </div>
// //       </div>

// //       {/* Hospital Cards Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// //         {filtered.map(h => (
// //           <Card key={h._id} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
// //             <CardContent className="p-5 space-y-3">
// //               {/* Card Header */}
// //               <div className="flex items-start justify-between">
// //                 <div>
// //                   <h3 className="font-semibold text-base">{h?.name?? ""}</h3>
// //                   <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
// //                     <MapPin className="h-3.5 w-3.5" /> {h?.location??""}
// //                   </p>
// //                 </div>
// //                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
// //                   <MoreHorizontal className="h-4 w-4" />
// //                 </Button>
// //               </div>

// //               {/* Status Badge */}
// //               <div>{getStatusBadge(h)}</div>

// //               {/* Rooms */}
// //               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
// //                 <Building2 className="h-3.5 w-3.5" />
// //                 <span>{h?.rooms?.join(', ') || "No rooms"}</span>
// //               </div>

// //               {/* Stats Row */}
// //               <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
// //                 <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {h?.beds??0} beds</span>
// //                 <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {h?.contact??""}</span>
// //               </div>

// //               {/* Actions */}
// //               <div className="flex items-center justify-between pt-2 border-t">
// //                 <Button size="sm" className="gap-1.5">
// //                   <Eye className="h-3.5 w-3.5" /> View
// //                 </Button>
// //                 <div className="flex gap-1">
// //                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}>
// //                     <Pencil className="h-3.5 w-3.5" />
// //                   </Button>
// //                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(h?._id ?? "")}>
// //                     <Trash2 className="h-3.5 w-3.5 text-destructive" />
// //                   </Button>
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       {filtered.length === 0 && (
// //         <div className="text-center py-12 text-muted-foreground">
// //           <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
// //           <p>No hospitals found</p>
// //         </div>
// //       )}

// //       {/* Summary Footer */}
// //       <Card className="border shadow-sm">
// //         <CardContent className="p-4">
// //           <div className="flex flex-wrap gap-8 text-sm">
// //             <div><span className="text-muted-foreground">Total Hospitals:</span> <span className="font-bold ml-1">{totalHospitals}</span></div>
// //             <div><span className="text-muted-foreground">Unsafe Rooms:</span> <span className="font-bold ml-1 text-destructive">{unsafeRooms}</span></div>
// //             <div><span className="text-muted-foreground">Low Stock Items:</span> <span className="font-bold ml-1 text-amber-600">{lowStockItems}</span></div>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       {/* Add/Edit Dialog */}
// //       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
// //         <DialogContent>
// //           <DialogHeader><DialogTitle>{editing ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle></DialogHeader>
// //           <div className="space-y-4">
// //             <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
// //             <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
// //             <div><Label>Beds</Label><Input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} /></div>
// //             <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
// //           </div>
// //           <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   );
// // }


// // // import { useState } from 'react';
// // // import { Card, CardContent } from '@/components/ui/card';
// // // import { Button } from '@/components/ui/button';
// // // import { Input } from '@/components/ui/input';
// // // import { Label } from '@/components/ui/label';
// // // import { Badge } from '@/components/ui/badge';
// // // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// // // import { Plus, Search, Building2, MapPin, Bed, Phone, MoreHorizontal, Pencil, Trash2, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
// // // import { useToast } from '@/hooks/use-toast';

// // // const initialData = [
// // //   { _id: '1', name: 'City General Hospital', location: 'Toronto, ON', beds: 320, contact: '+1-555-0101', rooms: ['Blood Bank', 'ICU'], status: 'safe', monitoredRooms: 2 },
// // //   { _id: '2', name: 'Metro Medical Center', location: 'New York, NY', beds: 180, contact: '+1-555-0102', rooms: ['ICU', 'Emergency'], status: 'safe', monitoredRooms: 2 },
// // //   { _id: '3', name: 'Unified Healthcare', location: 'Chicago, IL', beds: 450, contact: '+1-555-0103', rooms: ['Blood Bank', 'ICU'], status: 'low-stock', monitoredRooms: 3, lowStockCount: 1 },
// // //   { _id: '4', name: 'St. John\'s Hospital', location: 'Dallas, TX', beds: 200, contact: '+1-555-0104', rooms: ['Blood Bank', 'ICU'], status: 'safe', monitoredRooms: 2 },
// // //   { _id: '5', name: 'River Valley Hospital', location: 'Portland, OR', beds: 275, contact: '+1-555-0105', rooms: ['ICU', 'General Ward'], status: 'unsafe', monitoredRooms: 2, unsafeRooms: 1 },
// // //   { _id: '6', name: 'Regional Health Campus', location: 'Seattle, WA', beds: 380, contact: '+1-555-0106', rooms: ['Blood Bank', 'OR'], status: 'low-stock', monitoredRooms: 4, lowStockCount: 3 },
// // // ];

// // // const filters = ['All', 'Active', 'Unsafe Rooms', 'Low Stock'];

// // // export default function Hospitals() {
// // //   const [hospitals, setHospitals] = useState(initialData);
// // //   const [search, setSearch] = useState('');
// // //   const [activeFilter, setActiveFilter] = useState('All');
// // //   const [dialogOpen, setDialogOpen] = useState(false);
// // //   const [editing, setEditing] = useState(null);
// // //   const [form, setForm] = useState({ name: '', location: '', beds: '', contact: '' });
// // //   const { toast } = useToast();

// // //   const filtered = hospitals.filter(h => {
// // //     const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase());
// // //     if (activeFilter === 'Unsafe Rooms') return matchSearch && h.status === 'unsafe';
// // //     if (activeFilter === 'Low Stock') return matchSearch && h.status === 'low-stock';
// // //     return matchSearch;
// // //   });

// // //   const totalHospitals = hospitals.length;
// // //   const unsafeRooms = hospitals.filter(h => h.status === 'unsafe').reduce((acc, h) => acc + (h.unsafeRooms || 0), 0);
// // //   const lowStockItems = hospitals.filter(h => h.status === 'low-stock').reduce((acc, h) => acc + (h.lowStockCount || 0), 0);

// // //   const openAdd = () => { setEditing(null); setForm({ name: '', location: '', beds: '', contact: '' }); setDialogOpen(true); };
// // //   const openEdit = (h) => { setEditing(h); setForm({ name: h.name, location: h.location, beds: String(h.beds), contact: h.contact }); setDialogOpen(true); };

// // //   const save = () => {
// // //     if (!form.name || !form.location) return;
// // //     if (editing) {
// // //       setHospitals(prev => prev.map(h => h._id === editing._id ? { ...h, ...form, beds: Number(form.beds) } : h));
// // //       toast({ title: 'Hospital updated' });
// // //     } else {
// // //       setHospitals(prev => [...prev, { _id: Date.now().toString(), ...form, beds: Number(form.beds), rooms: [], status: 'safe', monitoredRooms: 0 }]);
// // //       toast({ title: 'Hospital added' });
// // //     }
// // //     setDialogOpen(false);
// // //   };

// // //   const remove = (id) => {
// // //     setHospitals(prev => prev.filter(h => h._id !== id));
// // //     toast({ title: 'Hospital deleted', variant: 'destructive' });
// // //   };

// // //   const getStatusBadge = (hospital) => {
// // //     if (hospital.status === 'unsafe') {
// // //       return <Badge variant="destructive" className="gap-1 text-xs"><AlertTriangle className="h-3 w-3" /> Unsafe: {hospital.unsafeRooms} room</Badge>;
// // //     }
// // //     if (hospital.status === 'low-stock') {
// // //       return <Badge className="gap-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"><CheckCircle2 className="h-3 w-3" /> Low Stock: {hospital.lowStockCount} item{hospital.lowStockCount > 1 ? 's' : ''}</Badge>;
// // //     }
// // //     return <Badge className="gap-1 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {hospital.monitoredRooms} monitored rooms</Badge>;
// // //   };

// // //   return (
// // //     <div className="space-y-6 animate-fade-in">
// // //       {/* Header */}
// // //       <div className="flex items-center justify-between">
// // //         <div>
// // //           <h1 className="text-2xl font-bold">Hospitals</h1>
// // //           <p className="text-muted-foreground text-sm">Manage and monitor hospital facilities</p>
// // //         </div>
// // //         <Button onClick={openAdd} className="gap-2">
// // //           <Plus className="h-4 w-4" /> Add Hospital <span className="ml-1">›</span>
// // //         </Button>
// // //       </div>

// // //       {/* Filters & Search */}
// // //       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
// // //         <div className="flex gap-2 flex-wrap">
// // //           {filters.map(f => (
// // //             <Button
// // //               key={f}
// // //               variant={activeFilter === f ? 'default' : 'outline'}
// // //               size="sm"
// // //               onClick={() => setActiveFilter(f)}
// // //               className={activeFilter === f ? '' : 'bg-background'}
// // //             >
// // //               {f === 'Unsafe Rooms' && <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />}
// // //               {f}
// // //             </Button>
// // //           ))}
// // //         </div>
// // //         <div className="relative w-full sm:w-72">
// // //           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// // //           <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
// // //         </div>
// // //       </div>

// // //       {/* Hospital Cards Grid */}
// // //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
// // //         {filtered.map(h => (
// // //           <Card key={h._id} className="border shadow-sm hover:shadow-md transition-all duration-200 group">
// // //             <CardContent className="p-5 space-y-3">
// // //               {/* Card Header */}
// // //               <div className="flex items-start justify-between">
// // //                 <div>
// // //                   <h3 className="font-semibold text-base">{h.name}</h3>
// // //                   <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
// // //                     <MapPin className="h-3.5 w-3.5" /> {h.location}
// // //                   </p>
// // //                 </div>
// // //                 <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
// // //                   <MoreHorizontal className="h-4 w-4" />
// // //                 </Button>
// // //               </div>

// // //               {/* Status Badge */}
// // //               <div>{getStatusBadge(h)}</div>

// // //               {/* Rooms */}
// // //               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
// // //                 <Building2 className="h-3.5 w-3.5" />
// // //                 <span>{h.rooms.join(', ')}</span>
// // //               </div>

// // //               {/* Stats Row */}
// // //               <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
// // //                 <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {h.beds} beds</span>
// // //                 <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {h.contact}</span>
// // //               </div>

// // //               {/* Actions */}
// // //               <div className="flex items-center justify-between pt-2 border-t">
// // //                 <Button size="sm" className="gap-1.5">
// // //                   <Eye className="h-3.5 w-3.5" /> View
// // //                 </Button>
// // //                 <div className="flex gap-1">
// // //                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}>
// // //                     <Pencil className="h-3.5 w-3.5" />
// // //                   </Button>
// // //                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(h._id)}>
// // //                     <Trash2 className="h-3.5 w-3.5 text-destructive" />
// // //                   </Button>
// // //                 </div>
// // //               </div>
// // //             </CardContent>
// // //           </Card>
// // //         ))}
// // //       </div>

// // //       {filtered.length === 0 && (
// // //         <div className="text-center py-12 text-muted-foreground">
// // //           <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
// // //           <p>No hospitals found</p>
// // //         </div>
// // //       )}

// // //       {/* Summary Footer */}
// // //       <Card className="border shadow-sm">
// // //         <CardContent className="p-4">
// // //           <div className="flex flex-wrap gap-8 text-sm">
// // //             <div><span className="text-muted-foreground">Total Hospitals:</span> <span className="font-bold ml-1">{totalHospitals}</span></div>
// // //             <div><span className="text-muted-foreground">Unsafe Rooms:</span> <span className="font-bold ml-1 text-destructive">{unsafeRooms}</span></div>
// // //             <div><span className="text-muted-foreground">Low Stock Items:</span> <span className="font-bold ml-1 text-amber-600">{lowStockItems}</span></div>
// // //           </div>
// // //         </CardContent>
// // //       </Card>

// // //       {/* Add/Edit Dialog */}
// // //       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
// // //         <DialogContent>
// // //           <DialogHeader><DialogTitle>{editing ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle></DialogHeader>
// // //           <div className="space-y-4">
// // //             <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
// // //             <div><Label>Location</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
// // //             <div><Label>Beds</Label><Input type="number" value={form.beds} onChange={e => setForm(f => ({ ...f, beds: e.target.value }))} /></div>
// // //             <div><Label>Contact</Label><Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></div>
// // //           </div>
// // //           <DialogFooter><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
// // //         </DialogContent>
// // //       </Dialog>
// // //     </div>
// // //   );
// // // }
