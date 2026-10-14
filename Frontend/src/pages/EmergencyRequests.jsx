import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Siren, Plus, Search, Clock, CheckCircle2, XCircle, Send,
  Droplets, Stethoscope, Package, Building2, AlertTriangle,
  ArrowRight, MessageSquare, Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergency } from '@/contexts/EmergencyContext';
import { useEffect } from "react";
import axios from "axios";

// const hospitals = [
//   { id: '1', name: 'City General Hospital' },
//   { id: '2', name: 'Metro Medical Center' },
//   { id: '3', name: 'Unified Healthcare' },
//   { id: '4', name: "St. John's Hospital" },
//   { id: '5', name: 'River Valley Hospital' },
//   { id: '6', name: 'Regional Health Campus' },
// ];

const typeConfig = {
  blood: { icon: Droplets, label: 'Blood', color: 'bg-red-100 text-red-700 border-red-200' },
  supplies: { icon: Package, label: 'Supplies', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  doctor: { icon: Stethoscope, label: 'Doctor', color: 'bg-violet-100 text-violet-700 border-violet-200' },
};

const urgencyConfig = {
  critical: { label: 'Critical', color: 'bg-red-500 text-white', pulse: true },
  high: { label: 'High', color: 'bg-orange-500 text-white', pulse: false },
  medium: { label: 'Medium', color: 'bg-amber-400 text-amber-900', pulse: false },
  low: { label: 'Low', color: 'bg-emerald-100 text-emerald-700', pulse: false },
};

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
  dispatched: { label: 'Dispatched', icon: Send, color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const filters = ['All', 'Pending', 'Accepted', 'Rejected', 'Dispatched'];
const typeFilters = ['All Types', 'Blood', 'Supplies', 'Doctor'];

export default function EmergencyRequests() {
  const [hospitals, setHospitals] = useState([]);
  const { requests, addRequest, updateRequest } = useEmergency();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState(null);
  const [respondDialog, setRespondDialog] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [form, setForm] = useState({ type: 'blood', urgency: 'high', title: '', description: '', quantity: '', toHospitals: 'all' });
  const { toast } = useToast();
  const { user } = useAuth();

  const filtered = requests.filter(r => {
    // const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.fromHospital.toLowerCase().includes(search.toLowerCase());
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.fromHospital?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter.toLowerCase();
    const matchType = typeFilter === 'All Types' || r.type === typeFilter.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    critical: requests.filter(r => r.urgency === 'critical').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
  };

  const visibleRequests = requests.filter(req => {
    // Broadcast request → visible to all hospitals
    if (!req.toHospitals || req.toHospitals.length === 0) {
      return true;
    }

    // Show only if current user's hospital is in the list
    return req.toHospitals.some(
      h => h.toString() === user?.hospital?.toString()
    );
  });

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/hospitals"
        );
        setHospitals(res.data.hospitals);
      } catch (error) {
        console.log("Failed to load hospitals");
      }
    };
    fetchHospitals();
  }, []);

  const createRequest = () => {
  if (!form.title || !form.description) return;

  console.log("Selected hospital:", form.toHospitals);

  const selectedHospitals =
    form.toHospitals === "all"
      ? []
      : [form.toHospitals];

  addRequest({
    ...form,
    fromHospital: user.hospital,
    toHospitals: selectedHospitals,
    status: "pending",
    createdAt: new Date().toISOString(),
    responses: [],
  });

  setDialogOpen(false);

  setForm({
    type: "blood",
    urgency: "high",
    title: "",
    description: "",
    quantity: "",
    toHospitals: "all"
  });
  console.log("Selected hospital value:", form.toHospitals);
  toast({
    title: "🚨 Emergency Request Sent"
  });
};

  // const createRequest = () => {
  //   if (!form.title || !form.description) return;
  //   addRequest({
  //     ...form,
  //     fromHospital: user.hospital,
  //     toHospitals: form.toHospitals === 'all' ? ['all'] : [form.toHospitals],
  //     status: 'pending', createdAt: new Date().toISOString(), responses: [],
  //   });
  //   setDialogOpen(false);
  //   setForm({ type: 'blood', urgency: 'high', title: '', description: '', quantity: '', toHospitals: 'all' });
  //   toast({ title: '🚨 Emergency Request Sent', description: `Request broadcasted to ${form.toHospitals === 'all' ? 'all hospitals' : form.toHospitals}` });
  // };

  const respondToRequest = (reqId, status) => {
    updateRequest(reqId, status, responseMessage);
    setRespondDialog(null);
    setResponseMessage("");

    toast({
      title: status === "accepted"
        ? "✅ Request Accepted"
        : "❌ Request Declined"
    });
  };

  // const respondToRequest = (reqId, status) => {
  //   const req = requests.find(r => r.id === reqId);
  //   if (!req) return;
  //   const newResponse = { hospital: 'City General Hospital', status, message: responseMessage, respondedAt: new Date().toISOString() };
  //   updateRequest(reqId, status, responseMessage);
  //   // updateRequest(reqId, {
  //   //   responses: [...req.responses, newResponse],
  //   //   status: status === 'accepted' ? 'accepted' : req.status,
  //   // });
  //   setRespondDialog(null);
  //   setResponseMessage('');
  //   toast({ title: status === 'accepted' ? 'Request Accepted' : 'Request Declined' });
  // };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Siren className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Emergency Services</h1>
            <p className="text-muted-foreground text-sm">Inter-hospital emergency requests & coordination</p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg">
          <Siren className="h-4 w-4" /> New Emergency Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: MessageSquare, bg: 'bg-[hsl(var(--stat-blue-light))]', fg: 'text-[hsl(var(--stat-blue))]' },
          { label: 'Pending', value: stats.pending, icon: Clock, bg: 'bg-[hsl(var(--stat-yellow-light))]', fg: 'text-[hsl(var(--stat-yellow))]' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, bg: 'bg-[hsl(var(--stat-coral-light))]', fg: 'text-[hsl(var(--stat-coral))]' },
          { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, bg: 'bg-[hsl(var(--stat-green-light))]', fg: 'text-[hsl(var(--stat-green))]' },
        ].map(s => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.fg}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Button key={f} variant={statusFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(f)}>
              {f}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1">
            {typeFilters.map(f => (
              <Button key={f} variant={typeFilter === f ? 'secondary' : 'ghost'} size="sm" onClick={() => setTypeFilter(f)} className="text-xs">
                {f}
              </Button>
            ))}
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {/* {filtered.map((req) => { */}
        {visibleRequests
        .filter(r => {
          const matchSearch =
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.fromHospital?.name?.toLowerCase().includes(search.toLowerCase());

          const matchStatus =
            statusFilter === "All" ||
            r.status === statusFilter.toLowerCase();

          const matchType =
            typeFilter === "All Types" ||
            r.type === typeFilter.toLowerCase();

          return matchSearch && matchStatus && matchType;
        })
        .map((req) => {
          const TypeIcon = typeConfig[req.type].icon;
          const StatusIcon = statusConfig[req.status].icon;
          const urgency = urgencyConfig[req.urgency];
          return (
            <Card key={req._id} className="border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              {/* Urgency indicator stripe */}
              <div className={`h-1 ${req.urgency === 'critical' ? 'bg-red-500' : req.urgency === 'high' ? 'bg-orange-500' : req.urgency === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Left: Icon + Content */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${typeConfig[req.type].color} border`}>
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-base">{req.title}</h3>
                        <Badge className={`text-[10px] px-2 py-0 ${urgency.color} border-0`}>
                          {urgency.pulse && <span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>}
                          {urgency.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusConfig[req.status].color} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" /> {statusConfig[req.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> From: <strong>{req.fromHospital?.name}</strong></span>
                        <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> To: 
                        <strong>
                        {req.toHospitals && req.toHospitals.length > 0
  ? req.toHospitals
      .map(id => {

        const hospitalId =
          typeof id === "object"
            ? id._id || id.$oid || id
            : id;

        const hospital = hospitals.find(
          h => h._id.toString() === hospitalId.toString()
        );

        return hospital?.name || "Unknown Hospital";

      })
      .join(", ")
  : "All Hospitals"}
                        </strong></span>
                        <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {req.quantity}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(req.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Responses + Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {req.responses.length > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-2">
                          {req.responses.slice(0, 3).map((resp, i) => (
                            <div key={i} className={`h-7 w-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold ${
                              resp.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                              resp.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {/* {resp.hospital.charAt(0)} */}
                              {(resp.hospital?.name || resp.hospital)?.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">{req.responses.length} response{req.responses.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setDetailDialog(req)}>
                      View Details
                    </Button>
                    {req.status === "pending" &&
                    req.fromHospital?._id?.toString() !== user?.hospital?.toString() &&
                    user?.role === "admin" && (
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => setRespondDialog(req)}
                      >
                        Respond
                      </Button>
                    )}
                    {/* {req.status === 'pending' && req.fromHospital !== 'City General Hospital' && (
                      <Button size="sm" className="gap-1" onClick={() => setRespondDialog(req)}>
                        Respond
                      </Button>
                    )} */}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Siren className="h-14 w-14 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No emergency requests found</p>
          <p className="text-sm mt-1">All clear! No matching requests.</p>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          {detailDialog && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeConfig[detailDialog.type].color} border`}>
                    {(() => { const I = typeConfig[detailDialog.type].icon; return <I className="h-5 w-5" />; })()}
                  </div>
                  <div>
                    <DialogTitle>{detailDialog.title}</DialogTitle>
                    {/* <p className="text-xs text-muted-foreground mt-0.5">{detailDialog.fromHospital} • {timeAgo(detailDialog.createdAt)}</p> */}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {detailDialog.fromHospital?.name} • {timeAgo(detailDialog.createdAt)}
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={`${urgencyConfig[detailDialog.urgency].color} border-0`}>{urgencyConfig[detailDialog.urgency].label}</Badge>
                  <Badge variant="outline" className={statusConfig[detailDialog.status].color}>{statusConfig[detailDialog.status].label}</Badge>
                  <Badge variant="outline">{detailDialog.quantity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{detailDialog.description}</p>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Responses ({detailDialog.responses.length})</h4>
                  <div className="space-y-3">
                    {detailDialog.responses.map((resp, i) => (
                      <div key={i} className={`rounded-lg p-3 border ${
                        resp.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' :
                        resp.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{resp.hospital?.name || resp.hospital}</span>
                          <Badge variant="outline" className={`text-[10px] ${
                            resp.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            resp.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>{resp.status}</Badge>
                        </div>
                        {resp.message && <p className="text-sm text-muted-foreground">{resp.message}</p>}
                        {resp.respondedAt && <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(resp.respondedAt)}</p>}
                      </div>
                    ))}
                    {detailDialog.responses.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No responses yet</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Respond Dialog */}
      <Dialog open={!!respondDialog} onOpenChange={() => { setRespondDialog(null); setResponseMessage(''); }}>
        <DialogContent>
          {respondDialog && (
            <>
              <DialogHeader><DialogTitle>Respond to Emergency Request</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium text-sm">{respondDialog.title}</p>
                  {/* <p className="text-xs text-muted-foreground mt-1">From: {respondDialog.fromHospital} • {respondDialog.quantity}</p> */}
                  <p className="text-xs text-muted-foreground mt-1">
                    From: {respondDialog.fromHospital?.name} • {respondDialog.quantity}
                  </p>
                </div>
                <div>
                  <Label>Your Response Message</Label>
                  <Textarea placeholder="E.g., We can supply 3 units. Dispatching via courier..." value={responseMessage} onChange={e => setResponseMessage(e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="destructive" onClick={() => respondToRequest(respondDialog._id, 'rejected')}>
                  <XCircle className="h-4 w-4 mr-1.5" /> Decline
                </Button>
                <Button onClick={() => respondToRequest(respondDialog._id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Accept & Supply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Siren className="h-5 w-5 text-destructive" /> Create Emergency Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Request Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood">🩸 Blood</SelectItem>
                    <SelectItem value="supplies">📦 Supplies</SelectItem>
                    <SelectItem value="doctor">🩺 Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Urgency Level</Label>
                <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Send To</Label>
              <Select
  value={form.toHospitals}
  onValueChange={(value) => {
    console.log("Dropdown selected:", value);
    setForm((prev) => ({
      ...prev,
      toHospitals: value
    }));
  }}
>
  <SelectTrigger className="mt-1.5">
    <SelectValue placeholder="Select hospital" />
  </SelectTrigger>

  <SelectContent>

    <SelectItem value="all">
      📢 All Hospitals (Broadcast)
    </SelectItem>

    {hospitals
      .filter(h => h._id !== user?.hospital)
      .map(h => (
        <SelectItem
          key={h._id}
          value={h._id.toString()}
        >
          {h.name}
        </SelectItem>
      ))}

  </SelectContent>

</Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="E.g., O- Blood Units Urgently Needed" className="mt-1.5" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the emergency situation and what's needed..." className="mt-1.5" />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="E.g., 5 units, 1 specialist, 200 bags" className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={createRequest} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2">
              <Siren className="h-4 w-4" /> Send Emergency Request
            </Button>
          </DialogFooter>
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
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Siren, Plus, Search, Clock, CheckCircle2, XCircle, Send,
//   Droplets, Stethoscope, Package, Building2, AlertTriangle,
//   ArrowRight, MessageSquare, Filter,
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/AuthContext';
// import { useEmergency } from '@/contexts/EmergencyContext';
// import { useEffect } from "react";
// import axios from "axios";

// // const hospitals = [
// //   { id: '1', name: 'City General Hospital' },
// //   { id: '2', name: 'Metro Medical Center' },
// //   { id: '3', name: 'Unified Healthcare' },
// //   { id: '4', name: "St. John's Hospital" },
// //   { id: '5', name: 'River Valley Hospital' },
// //   { id: '6', name: 'Regional Health Campus' },
// // ];

// const typeConfig = {
//   blood: { icon: Droplets, label: 'Blood', color: 'bg-red-100 text-red-700 border-red-200' },
//   supplies: { icon: Package, label: 'Supplies', color: 'bg-blue-100 text-blue-700 border-blue-200' },
//   doctor: { icon: Stethoscope, label: 'Doctor', color: 'bg-violet-100 text-violet-700 border-violet-200' },
// };

// const urgencyConfig = {
//   critical: { label: 'Critical', color: 'bg-red-500 text-white', pulse: true },
//   high: { label: 'High', color: 'bg-orange-500 text-white', pulse: false },
//   medium: { label: 'Medium', color: 'bg-amber-400 text-amber-900', pulse: false },
//   low: { label: 'Low', color: 'bg-emerald-100 text-emerald-700', pulse: false },
// };

// const statusConfig = {
//   pending: { label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
//   accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
//   rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
//   dispatched: { label: 'Dispatched', icon: Send, color: 'bg-blue-100 text-blue-700 border-blue-200' },
// };

// const filters = ['All', 'Pending', 'Accepted', 'Rejected', 'Dispatched'];
// const typeFilters = ['All Types', 'Blood', 'Supplies', 'Doctor'];

// export default function EmergencyRequests() {
//   const [hospitals, setHospitals] = useState([]);
//   const { requests, addRequest, updateRequest } = useEmergency();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [typeFilter, setTypeFilter] = useState('All Types');
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [detailDialog, setDetailDialog] = useState(null);
//   const [respondDialog, setRespondDialog] = useState(null);
//   const [responseMessage, setResponseMessage] = useState('');
//   const [form, setForm] = useState({ type: 'blood', urgency: 'high', title: '', description: '', quantity: '', toHospitals: 'all' });
//   const { toast } = useToast();
//   const { user } = useAuth();

//   const filtered = requests.filter(r => {
//     // const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.fromHospital.toLowerCase().includes(search.toLowerCase());
//     const matchSearch =
//       r.title.toLowerCase().includes(search.toLowerCase()) ||
//       r.fromHospital?.name?.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = statusFilter === 'All' || r.status === statusFilter.toLowerCase();
//     const matchType = typeFilter === 'All Types' || r.type === typeFilter.toLowerCase();
//     return matchSearch && matchStatus && matchType;
//   });

//   const stats = {
//     total: requests.length,
//     pending: requests.filter(r => r.status === 'pending').length,
//     critical: requests.filter(r => r.urgency === 'critical').length,
//     accepted: requests.filter(r => r.status === 'accepted').length,
//   };

//   const visibleRequests = requests.filter(req => {
//     // Broadcast request → visible to all hospitals
//     if (!req.toHospitals || req.toHospitals.length === 0) {
//       return true;
//     }

//     // Show only if current user's hospital is in the list
//     return req.toHospitals.some(
//       h => h.toString() === user?.hospital?.toString()
//     );
//   });

//   useEffect(() => {
//     const fetchHospitals = async () => {
//       try {
//         const res = await axios.get(
//           "https://invora-qkwq.onrender.com/api/v1/hospitals",
//           // "http://localhost:3000/api/v1/hospitals"
//         );
//         setHospitals(res.data.hospitals);
//       } catch (error) {
//         console.log("Failed to load hospitals");
//       }
//     };
//     fetchHospitals();
//   }, []);

//   const createRequest = () => {
//   if (!form.title || !form.description) return;

//   console.log("Selected hospital:", form.toHospitals);

//   const selectedHospitals =
//     form.toHospitals === "all"
//       ? []
//       : [form.toHospitals];

//   addRequest({
//     ...form,
//     toHospitals: selectedHospitals
//   });
//   // addRequest({
//   //   ...form,
//   //   fromHospital: user.hospital,
//   //   toHospitals: selectedHospitals,
//   //   status: "pending",
//   //   createdAt: new Date().toISOString(),
//   //   responses: [],
//   // });

//   setDialogOpen(false);

//   setForm({
//     type: "blood",
//     urgency: "high",
//     title: "",
//     description: "",
//     quantity: "",
//     toHospitals: "all"
//   });
//   console.log("Selected hospital value:", form.toHospitals);
//   toast({
//     title: "🚨 Emergency Request Sent"
//   });
// };

//   // const createRequest = () => {
//   //   if (!form.title || !form.description) return;
//   //   addRequest({
//   //     ...form,
//   //     fromHospital: user.hospital,
//   //     toHospitals: form.toHospitals === 'all' ? ['all'] : [form.toHospitals],
//   //     status: 'pending', createdAt: new Date().toISOString(), responses: [],
//   //   });
//   //   setDialogOpen(false);
//   //   setForm({ type: 'blood', urgency: 'high', title: '', description: '', quantity: '', toHospitals: 'all' });
//   //   toast({ title: '🚨 Emergency Request Sent', description: `Request broadcasted to ${form.toHospitals === 'all' ? 'all hospitals' : form.toHospitals}` });
//   // };

//   const respondToRequest = (reqId, status) => {
//     updateRequest(reqId, status, responseMessage);
//     setRespondDialog(null);
//     setResponseMessage("");

//     toast({
//       title: status === "accepted"
//         ? "✅ Request Accepted"
//         : "❌ Request Declined"
//     });
//   };

//   // const respondToRequest = (reqId, status) => {
//   //   const req = requests.find(r => r.id === reqId);
//   //   if (!req) return;
//   //   const newResponse = { hospital: 'City General Hospital', status, message: responseMessage, respondedAt: new Date().toISOString() };
//   //   updateRequest(reqId, status, responseMessage);
//   //   // updateRequest(reqId, {
//   //   //   responses: [...req.responses, newResponse],
//   //   //   status: status === 'accepted' ? 'accepted' : req.status,
//   //   // });
//   //   setRespondDialog(null);
//   //   setResponseMessage('');
//   //   toast({ title: status === 'accepted' ? 'Request Accepted' : 'Request Declined' });
//   // };

//   const timeAgo = (dateStr) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const mins = Math.floor(diff / 60000);
//     if (mins < 60) return `${mins}m ago`;
//     const hrs = Math.floor(mins / 60);
//     if (hrs < 24) return `${hrs}h ago`;
//     return `${Math.floor(hrs / 24)}d ago`;
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
//             <Siren className="h-6 w-6 text-destructive" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold">Emergency Services</h1>
//             <p className="text-muted-foreground text-sm">Inter-hospital emergency requests & coordination</p>
//           </div>
//         </div>
//         <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg">
//           <Siren className="h-4 w-4" /> New Emergency Request
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: 'Total Requests', value: stats.total, icon: MessageSquare, bg: 'bg-[hsl(var(--stat-blue-light))]', fg: 'text-[hsl(var(--stat-blue))]' },
//           { label: 'Pending', value: stats.pending, icon: Clock, bg: 'bg-[hsl(var(--stat-yellow-light))]', fg: 'text-[hsl(var(--stat-yellow))]' },
//           { label: 'Critical', value: stats.critical, icon: AlertTriangle, bg: 'bg-[hsl(var(--stat-coral-light))]', fg: 'text-[hsl(var(--stat-coral))]' },
//           { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, bg: 'bg-[hsl(var(--stat-green-light))]', fg: 'text-[hsl(var(--stat-green))]' },
//         ].map(s => (
//           <Card key={s.label} className="border shadow-sm">
//             <CardContent className="p-4 flex items-center gap-3">
//               <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
//                 <s.icon className={`h-5 w-5 ${s.fg}`} />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{s.value}</p>
//                 <p className="text-xs text-muted-foreground">{s.label}</p>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//         <div className="flex gap-2 flex-wrap">
//           {filters.map(f => (
//             <Button key={f} variant={statusFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(f)}>
//               {f}
//             </Button>
//           ))}
//         </div>
//         <div className="flex gap-2">
//           <div className="flex gap-1">
//             {typeFilters.map(f => (
//               <Button key={f} variant={typeFilter === f ? 'secondary' : 'ghost'} size="sm" onClick={() => setTypeFilter(f)} className="text-xs">
//                 {f}
//               </Button>
//             ))}
//           </div>
//           <div className="relative w-56">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
//           </div>
//         </div>
//       </div>

//       {/* Request Cards */}
//       <div className="space-y-4">
//         {/* {filtered.map((req) => { */}
//         {visibleRequests
//         .filter(r => {
//           const matchSearch =
//             r.title.toLowerCase().includes(search.toLowerCase()) ||
//             r.fromHospital?.name?.toLowerCase().includes(search.toLowerCase());

//           const matchStatus =
//             statusFilter === "All" ||
//             r.status === statusFilter.toLowerCase();

//           const matchType =
//             typeFilter === "All Types" ||
//             r.type === typeFilter.toLowerCase();

//           return matchSearch && matchStatus && matchType;
//         })
//         .map((req) => {
//           const TypeIcon = typeConfig[req.type].icon;
//           const StatusIcon = statusConfig[req.status].icon;
//           const urgency = urgencyConfig[req.urgency];
//           return (
//             <Card key={req._id} className="border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
//               {/* Urgency indicator stripe */}
//               <div className={`h-1 ${req.urgency === 'critical' ? 'bg-red-500' : req.urgency === 'high' ? 'bg-orange-500' : req.urgency === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
//               <CardContent className="p-5">
//                 <div className="flex flex-col lg:flex-row lg:items-start gap-4">
//                   {/* Left: Icon + Content */}
//                   <div className="flex gap-4 flex-1 min-w-0">
//                     <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${typeConfig[req.type].color} border`}>
//                       <TypeIcon className="h-6 w-6" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap mb-1">
//                         <h3 className="font-semibold text-base">{req.title}</h3>
//                         <Badge className={`text-[10px] px-2 py-0 ${urgency.color} border-0`}>
//                           {urgency.pulse && <span className="relative flex h-2 w-2 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>}
//                           {urgency.label}
//                         </Badge>
//                         <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusConfig[req.status].color} border`}>
//                           <StatusIcon className="h-3 w-3 mr-1" /> {statusConfig[req.status].label}
//                         </Badge>
//                       </div>
//                       <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{req.description}</p>
//                       <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
//                         <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> From: <strong>{req.fromHospital?.name}</strong></span>
//                         <span className="flex items-center gap-1"><ArrowRight className="h-3 w-3" /> To: 
//                         <strong>
//                         {req.toHospitals && req.toHospitals.length > 0
//   ? req.toHospitals
//       .map(id => {

//         const hospitalId =
//           typeof id === "object"
//             ? id._id || id.$oid || id
//             : id;

//         const hospital = hospitals.find(
//           h => h._id.toString() === hospitalId.toString()
//         );

//         return hospital?.name || "Unknown Hospital";

//       })
//       .join(", ")
//   : "All Hospitals"}
//                         </strong></span>
//                         <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {req.quantity}</span>
//                         <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(req.createdAt)}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Right: Responses + Actions */}
//                   <div className="flex items-center gap-3 shrink-0">
//                     {req.responses.length > 0 && (
//                       <div className="flex items-center gap-1">
//                         <div className="flex -space-x-2">
//                           {req.responses.slice(0, 3).map((resp, i) => (
//                             <div key={i} className={`h-7 w-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold ${
//                               resp.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
//                               resp.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
//                             }`}>
//                               {/* {resp.hospital.charAt(0)} */}
//                               {(resp.hospital?.name || resp.hospital)?.charAt(0)}
//                             </div>
//                           ))}
//                         </div>
//                         <span className="text-xs text-muted-foreground ml-1">{req.responses.length} response{req.responses.length > 1 ? 's' : ''}</span>
//                       </div>
//                     )}
//                     <Button variant="outline" size="sm" onClick={() => setDetailDialog(req)}>
//                       View Details
//                     </Button>
//                     {req.status === "pending" &&
//                     req.fromHospital?._id?.toString() !== user?.hospital?.toString() &&
//                     user?.role === "admin" && (
//                       <Button
//                         size="sm"
//                         className="gap-1"
//                         onClick={() => setRespondDialog(req)}
//                       >
//                         Respond
//                       </Button>
//                     )}
//                     {/* {req.status === 'pending' && req.fromHospital !== 'City General Hospital' && (
//                       <Button size="sm" className="gap-1" onClick={() => setRespondDialog(req)}>
//                         Respond
//                       </Button>
//                     )} */}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {filtered.length === 0 && (
//         <div className="text-center py-16 text-muted-foreground">
//           <Siren className="h-14 w-14 mx-auto mb-3 opacity-20" />
//           <p className="font-medium">No emergency requests found</p>
//           <p className="text-sm mt-1">All clear! No matching requests.</p>
//         </div>
//       )}

//       {/* Detail Dialog */}
//       <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
//         <DialogContent className="max-w-lg">
//           {detailDialog && (
//             <>
//               <DialogHeader>
//                 <div className="flex items-center gap-3">
//                   <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeConfig[detailDialog.type].color} border`}>
//                     {(() => { const I = typeConfig[detailDialog.type].icon; return <I className="h-5 w-5" />; })()}
//                   </div>
//                   <div>
//                     <DialogTitle>{detailDialog.title}</DialogTitle>
//                     {/* <p className="text-xs text-muted-foreground mt-0.5">{detailDialog.fromHospital} • {timeAgo(detailDialog.createdAt)}</p> */}
//                     <p className="text-xs text-muted-foreground mt-0.5">
//                       {detailDialog.fromHospital?.name} • {timeAgo(detailDialog.createdAt)}
//                     </p>
//                   </div>
//                 </div>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="flex gap-2">
//                   <Badge className={`${urgencyConfig[detailDialog.urgency].color} border-0`}>{urgencyConfig[detailDialog.urgency].label}</Badge>
//                   <Badge variant="outline" className={statusConfig[detailDialog.status].color}>{statusConfig[detailDialog.status].label}</Badge>
//                   <Badge variant="outline">{detailDialog.quantity}</Badge>
//                 </div>
//                 <p className="text-sm text-muted-foreground">{detailDialog.description}</p>
//                 <div className="border-t pt-4">
//                   <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Responses ({detailDialog.responses.length})</h4>
//                   <div className="space-y-3">
//                     {detailDialog.responses.map((resp, i) => (
//                       <div key={i} className={`rounded-lg p-3 border ${
//                         resp.status === 'accepted' ? 'bg-emerald-50 border-emerald-200' :
//                         resp.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
//                       }`}>
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="font-medium text-sm">{resp.hospital?.name || resp.hospital}</span>
//                           <Badge variant="outline" className={`text-[10px] ${
//                             resp.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
//                             resp.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
//                           }`}>{resp.status}</Badge>
//                         </div>
//                         {resp.message && <p className="text-sm text-muted-foreground">{resp.message}</p>}
//                         {resp.respondedAt && <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(resp.respondedAt)}</p>}
//                       </div>
//                     ))}
//                     {detailDialog.responses.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No responses yet</p>}
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Respond Dialog */}
//       <Dialog open={!!respondDialog} onOpenChange={() => { setRespondDialog(null); setResponseMessage(''); }}>
//         <DialogContent>
//           {respondDialog && (
//             <>
//               <DialogHeader><DialogTitle>Respond to Emergency Request</DialogTitle></DialogHeader>
//               <div className="space-y-4">
//                 <div className="rounded-lg bg-muted p-3">
//                   <p className="font-medium text-sm">{respondDialog.title}</p>
//                   {/* <p className="text-xs text-muted-foreground mt-1">From: {respondDialog.fromHospital} • {respondDialog.quantity}</p> */}
//                   <p className="text-xs text-muted-foreground mt-1">
//                     From: {respondDialog.fromHospital?.name} • {respondDialog.quantity}
//                   </p>
//                 </div>
//                 <div>
//                   <Label>Your Response Message</Label>
//                   <Textarea placeholder="E.g., We can supply 3 units. Dispatching via courier..." value={responseMessage} onChange={e => setResponseMessage(e.target.value)} className="mt-1.5" />
//                 </div>
//               </div>
//               <DialogFooter className="gap-2">
//                 <Button variant="destructive" onClick={() => respondToRequest(respondDialog._id, 'rejected')}>
//                   <XCircle className="h-4 w-4 mr-1.5" /> Decline
//                 </Button>
//                 <Button onClick={() => respondToRequest(respondDialog._id, 'accepted')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
//                   <CheckCircle2 className="h-4 w-4 mr-1.5" /> Accept & Supply
//                 </Button>
//               </DialogFooter>
//             </>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Create Request Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2"><Siren className="h-5 w-5 text-destructive" /> Create Emergency Request</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label>Request Type</Label>
//                 <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
//                   <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="blood">🩸 Blood</SelectItem>
//                     <SelectItem value="supplies">📦 Supplies</SelectItem>
//                     <SelectItem value="doctor">🩺 Doctor</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <Label>Urgency Level</Label>
//                 <Select value={form.urgency} onValueChange={v => setForm(f => ({ ...f, urgency: v }))}>
//                   <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="critical">🔴 Critical</SelectItem>
//                     <SelectItem value="high">🟠 High</SelectItem>
//                     <SelectItem value="medium">🟡 Medium</SelectItem>
//                     <SelectItem value="low">🟢 Low</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div>
//               <Label>Send To</Label>
//               <Select
//   value={form.toHospitals}
//   onValueChange={(value) => {
//     console.log("Dropdown selected:", value);
//     setForm((prev) => ({
//       ...prev,
//       toHospitals: value
//     }));
//   }}
// >
//   <SelectTrigger className="mt-1.5">
//     <SelectValue placeholder="Select hospital" />
//   </SelectTrigger>

//   <SelectContent>

//     <SelectItem value="all">
//       📢 All Hospitals (Broadcast)
//     </SelectItem>

//     {hospitals
//       .filter(h => h._id !== user?.hospital)
//       .map(h => (
//         <SelectItem
//           key={h._id}
//           value={h._id.toString()}
//         >
//           {h.name}
//         </SelectItem>
//       ))}

//   </SelectContent>

// </Select>
//             </div>
//             <div>
//               <Label>Title</Label>
//               <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="E.g., O- Blood Units Urgently Needed" className="mt-1.5" />
//             </div>
//             <div>
//               <Label>Description</Label>
//               <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the emergency situation and what's needed..." className="mt-1.5" />
//             </div>
//             <div>
//               <Label>Quantity</Label>
//               <Input value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="E.g., 5 units, 1 specialist, 200 bags" className="mt-1.5" />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
//             <Button onClick={createRequest} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2">
//               <Siren className="h-4 w-4" /> Send Emergency Request
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// // import { useState, useEffect } from "react";
// // import axios from "axios";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { useToast } from "@/hooks/use-toast";

// // export default function EmergencyRequest() {
// //   const { toast } = useToast();
// //   const [hospitals, setHospitals] = useState([]);
// //   const [form, setForm] = useState({
// //     type: "Inventory",
// //     item: "",
// //     quantity: "",
// //     specialization: "",
// //     requestedHospitals: []
// //   });

// //   const token = JSON.parse(localStorage.getItem("auth"))?.token;

// //   useEffect(() => {
// //     const fetchHospitals = async () => {
// //       try {
// //         const res = await axios.get("http://localhost:3000/api/v1/hospitals");
// //         setHospitals(res.data.hospitals);
// //       } catch (err) {
// //         console.error(err);
// //       }
// //     };

// //     fetchHospitals();
// //   }, []);

// //   const handleHospitalSelect = (id) => {
// //     setForm((prev) => ({
// //       ...prev,
// //       requestedHospitals: prev.requestedHospitals.includes(id)
// //         ? prev.requestedHospitals.filter((h) => h !== id)
// //         : [...prev.requestedHospitals, id],
// //     }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {

// //       await axios.post(
// //         "http://localhost:3000/api/v1/emergency-requests",
// //         form,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`
// //           }
// //         }
// //       );

// //       setForm({
// //         type: "Inventory",
// //         item: "",
// //         quantity: "",
// //         specialization: "",
// //         requestedHospitals: []
// //       });
// //       toast({
// //         title: "Emergency Request Sent",
// //         description: "Your request has been sent to selected hospitals.",
// //       });
// //     } catch (err) {
// //       console.error(err);
// //       toast({
// //         title: "Error",
// //         description: "Failed to send emergency request.",
// //         variant: "destructive",
// //       });
// //       // alert("Failed to send request");
// //     }
// //   };

//   // return (
//   //   <div className="max-w-2xl mx-auto space-y-6">

//   //     <Card>
//   //       <CardHeader>
//   //         <CardTitle>Create Emergency Request</CardTitle>
//   //       </CardHeader>

//   //       <CardContent className="space-y-4">

//   //         <form onSubmit={handleSubmit} className="space-y-4">

//   //           <div>
//   //             <Label>Request Type</Label>
//   //             <select
//   //               className="w-full border rounded p-2"
//   //               value={form.type}
//   //               onChange={(e) =>
//   //                 setForm({ ...form, type: e.target.value })
//   //               }
//   //             >
//   //               <option value="Inventory">Inventory</option>
//   //               <option value="Blood">Blood</option>
//   //               <option value="Doctor">Doctor</option>
//   //             </select>
//   //           </div>

//   //           {form.type === "Inventory" && (
//   //             <>
//   //               <div>
//   //                 <Label>Item</Label>
//   //                 <Input
//   //                   value={form.item}
//   //                   onChange={(e) =>
//   //                     setForm({ ...form, item: e.target.value })
//   //                   }
//   //                 />
//   //               </div>

//   //               <div>
//   //                 <Label>Quantity</Label>
//   //                 <Input
//   //                   type="number"
//   //                   value={form.quantity}
//   //                   onChange={(e) =>
//   //                     setForm({ ...form, quantity: e.target.value })
//   //                   }
//   //                 />
//   //               </div>
//   //             </>
//   //           )}

//   //           {form.type === "Doctor" && (
//   //             <div>
//   //               <Label>Specialization</Label>
//   //               <Input
//   //                 value={form.specialization}
//   //                 onChange={(e) =>
//   //                   setForm({ ...form, specialization: e.target.value })
//   //                 }
//   //               />
//   //             </div>
//   //           )}

//   //           <div>
//   //             <Label>Select Hospitals</Label>

//   //             <div className="grid grid-cols-2 gap-2 mt-2">

//   //               {hospitals.map((h) => (

//   //                 <label key={h._id} className="flex items-center gap-2">

//   //                   <input
//   //                     type="checkbox"
//   //                     checked={form.requestedHospitals.includes(h._id)}
//   //                     onChange={() => handleHospitalSelect(h._id)}
//   //                   />

//   //                   {h.name}

//   //                 </label>

//   //               ))}

//   //             </div>

//   //           </div>

//   //           <Button type="submit" className="w-full">
//   //             Send Emergency Request
//   //           </Button>

//   //         </form>

//   //       </CardContent>
//   //     </Card>

//   //   </div>
//   // );
// // }