import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Globe, Building2, MapPin, Droplets, Package, Thermometer,
  Search, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  ChevronRight, Layers, Filter,
} from 'lucide-react';

const hospitalInventory = [
  {
    id: '1', name: 'City General Hospital', location: 'Toronto, ON', lat: 43.65, lng: -79.38,
    status: 'healthy',
    inventory: {
      blood: { total: 450, available: 380, critical: false, types: { 'O-': 45, 'O+': 80, 'A+': 95, 'A-': 30, 'B+': 60, 'B-': 20, 'AB+': 35, 'AB-': 15 } },
      supplies: { total: 12000, available: 9800, critical: false, lowItems: [] },
      equipment: { total: 320, operational: 305, maintenance: 15 },
      temperature: { rooms: 8, safe: 8, alerts: 0 },
    },
    trend: 'up',
  },
  {
    id: '2', name: 'Metro Medical Center', location: 'New York, NY', lat: 40.71, lng: -74.01,
    status: 'warning',
    inventory: {
      blood: { total: 280, available: 120, critical: true, types: { 'O-': 8, 'O+': 25, 'A+': 35, 'A-': 12, 'B+': 18, 'B-': 5, 'AB+': 12, 'AB-': 5 } },
      supplies: { total: 8500, available: 3200, critical: true, lowItems: ['IV Fluids', 'Syringes'] },
      equipment: { total: 210, operational: 195, maintenance: 15 },
      temperature: { rooms: 5, safe: 4, alerts: 1 },
    },
    trend: 'down',
  },
  {
    id: '3', name: 'Unified Healthcare', location: 'Chicago, IL', lat: 41.88, lng: -87.63,
    status: 'healthy',
    inventory: {
      blood: { total: 520, available: 480, critical: false, types: { 'O-': 55, 'O+': 90, 'A+': 110, 'A-': 40, 'B+': 75, 'B-': 25, 'AB+': 50, 'AB-': 35 } },
      supplies: { total: 15000, available: 13500, critical: false, lowItems: [] },
      equipment: { total: 400, operational: 390, maintenance: 10 },
      temperature: { rooms: 12, safe: 12, alerts: 0 },
    },
    trend: 'up',
  },
  {
    id: '4', name: "St. John's Hospital", location: 'Dallas, TX', lat: 32.78, lng: -96.80,
    status: 'critical',
    inventory: {
      blood: { total: 180, available: 45, critical: true, types: { 'O-': 3, 'O+': 10, 'A+': 12, 'A-': 5, 'B+': 8, 'B-': 2, 'AB+': 3, 'AB-': 2 } },
      supplies: { total: 6000, available: 1800, critical: true, lowItems: ['Gloves', 'Masks', 'IV Fluids', 'Bandages'] },
      equipment: { total: 150, operational: 130, maintenance: 20 },
      temperature: { rooms: 4, safe: 2, alerts: 2 },
    },
    trend: 'down',
  },
  {
    id: '5', name: 'River Valley Hospital', location: 'Portland, OR', lat: 45.52, lng: -122.68,
    status: 'warning',
    inventory: {
      blood: { total: 320, available: 210, critical: false, types: { 'O-': 20, 'O+': 45, 'A+': 55, 'A-': 18, 'B+': 35, 'B-': 10, 'AB+': 18, 'AB-': 9 } },
      supplies: { total: 9000, available: 5400, critical: false, lowItems: ['Surgical Kits'] },
      equipment: { total: 250, operational: 230, maintenance: 20 },
      temperature: { rooms: 6, safe: 5, alerts: 1 },
    },
    trend: 'up',
  },
  {
    id: '6', name: 'Regional Health Campus', location: 'Seattle, WA', lat: 47.61, lng: -122.33,
    status: 'healthy',
    inventory: {
      blood: { total: 400, available: 350, critical: false, types: { 'O-': 40, 'O+': 70, 'A+': 85, 'A-': 30, 'B+': 55, 'B-': 18, 'AB+': 35, 'AB-': 17 } },
      supplies: { total: 11000, available: 9900, critical: false, lowItems: [] },
      equipment: { total: 350, operational: 340, maintenance: 10 },
      temperature: { rooms: 10, safe: 10, alerts: 0 },
    },
    trend: 'up',
  },
];

const statusColors = {
  healthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Healthy' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Warning' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Critical' },
};

export default function GlobalInventoryMap() {
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [viewFilter, setViewFilter] = useState('all');

  const filtered = hospitalInventory.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase())
  ).filter(h => viewFilter === 'all' || h.status === viewFilter);

  const globalStats = {
    totalBlood: hospitalInventory.reduce((a, h) => a + h.inventory.blood.available, 0),
    totalSupplies: hospitalInventory.reduce((a, h) => a + h.inventory.supplies.available, 0),
    tempAlerts: hospitalInventory.reduce((a, h) => a + h.inventory.temperature.alerts, 0),
    criticalHospitals: hospitalInventory.filter(h => h.status === 'critical').length,
  };

  const pct = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Global Inventory Map</h1>
            <p className="text-muted-foreground text-sm">Real-time inventory overview across all hospitals</p>
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Blood Units Available', value: globalStats.totalBlood.toLocaleString(), icon: Droplets, bg: 'bg-[hsl(var(--stat-coral-light))]', fg: 'text-[hsl(var(--stat-coral))]' },
          { label: 'Supply Items', value: globalStats.totalSupplies.toLocaleString(), icon: Package, bg: 'bg-[hsl(var(--stat-blue-light))]', fg: 'text-[hsl(var(--stat-blue))]' },
          { label: 'Temp Alerts', value: globalStats.tempAlerts, icon: Thermometer, bg: 'bg-[hsl(var(--stat-yellow-light))]', fg: 'text-[hsl(var(--stat-yellow))]' },
          { label: 'Critical Sites', value: globalStats.criticalHospitals, icon: AlertTriangle, bg: globalStats.criticalHospitals > 0 ? 'bg-[hsl(var(--stat-coral-light))]' : 'bg-[hsl(var(--stat-green-light))]', fg: globalStats.criticalHospitals > 0 ? 'text-[hsl(var(--stat-coral))]' : 'text-[hsl(var(--stat-green))]' },
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

      {/* Visual Map */}
      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-[hsl(var(--stat-blue-light))] via-background to-[hsl(var(--stat-green-light))] p-8" style={{ minHeight: 320 }}>
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative grid grid-cols-3 md:grid-cols-6 gap-4">
              {hospitalInventory.map(h => {
                const sc = statusColors[h.status];
                const bloodPct = pct(h.inventory.blood.available, h.inventory.blood.total);
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHospital(selectedHospital?.id === h.id ? null : h)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                      selectedHospital?.id === h.id ? `${sc.border} ${sc.bg} shadow-lg scale-105` : 'border-border bg-card/80 backdrop-blur-sm hover:shadow-md'
                    }`}
                  >
                    <div className={`absolute top-2 right-2 h-3 w-3 rounded-full ${sc.dot} ${h.status === 'critical' ? 'animate-pulse' : ''}`} />
                    <Building2 className="h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-xs font-semibold leading-tight truncate">{h.name.split(' ').slice(0, 2).join(' ')}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{h.location}</p>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${bloodPct > 60 ? 'bg-emerald-500' : bloodPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bloodPct}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Blood: {bloodPct}%</p>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {['all', 'healthy', 'warning', 'critical'].map(f => (
            <Button key={f} variant={viewFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setViewFilter(f)} className="capitalize">
              {f === 'all' ? 'All Sites' : f}
            </Button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Hospital Detail Cards */}
      {selectedHospital ? (
        <HospitalDetail hospital={selectedHospital} pct={pct} onClose={() => setSelectedHospital(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(h => (
            <HospitalCard key={h.id} hospital={h} pct={pct} onClick={() => setSelectedHospital(h)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HospitalCard({ hospital: h, pct, onClick }) {
  const sc = statusColors[h.status];
  const bloodPct = pct(h.inventory.blood.available, h.inventory.blood.total);
  const supplyPct = pct(h.inventory.supplies.available, h.inventory.supplies.total);

  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={onClick}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">{h.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {h.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] ${sc.bg} ${sc.text} ${sc.border} border`}>
              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} mr-1 inline-block`} /> {sc.label}
            </Badge>
            {h.trend === 'up' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Droplets className="h-3 w-3" /> Blood</span>
              <span className={`text-[10px] font-bold ${bloodPct > 60 ? 'text-emerald-600' : bloodPct > 30 ? 'text-amber-600' : 'text-red-600'}`}>{bloodPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${bloodPct > 60 ? 'bg-emerald-500' : bloodPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bloodPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Package className="h-3 w-3" /> Supplies</span>
              <span className={`text-[10px] font-bold ${supplyPct > 60 ? 'text-emerald-600' : supplyPct > 30 ? 'text-amber-600' : 'text-red-600'}`}>{supplyPct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${supplyPct > 60 ? 'bg-emerald-500' : supplyPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${supplyPct}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
          <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> {h.inventory.temperature.alerts > 0 ? `${h.inventory.temperature.alerts} alert${h.inventory.temperature.alerts > 1 ? 's' : ''}` : 'All safe'}</span>
          <span className="flex items-center gap-1 text-primary font-medium group-hover:underline">Details <ChevronRight className="h-3 w-3" /></span>
        </div>
      </CardContent>
    </Card>
  );
}

function HospitalDetail({ hospital: h, pct, onClose }) {
  const sc = statusColors[h.status];
  const bloodPct = pct(h.inventory.blood.available, h.inventory.blood.total);
  const supplyPct = pct(h.inventory.supplies.available, h.inventory.supplies.total);
  const equipPct = pct(h.inventory.equipment.operational, h.inventory.equipment.total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">{h.name}</h2>
          <Badge className={`${sc.bg} ${sc.text} ${sc.border} border`}>{sc.label}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>← Back to All</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blood Bank */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center"><Droplets className="h-5 w-5 text-red-600" /></div>
              <div>
                <h3 className="font-semibold text-sm">Blood Bank</h3>
                <p className="text-[10px] text-muted-foreground">{h.inventory.blood.available} / {h.inventory.blood.total} units</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
              <div className={`h-full rounded-full ${bloodPct > 60 ? 'bg-emerald-500' : bloodPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${bloodPct}%` }} />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(h.inventory.blood.types).map(([type, count]) => (
                <div key={type} className={`text-center p-1.5 rounded-md border ${count < 10 ? 'bg-red-50 border-red-200' : 'bg-muted/50'}`}>
                  <p className="text-[10px] font-bold">{type}</p>
                  <p className={`text-sm font-bold ${count < 10 ? 'text-red-600' : ''}`}>{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supplies */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center"><Package className="h-5 w-5 text-blue-600" /></div>
              <div>
                <h3 className="font-semibold text-sm">Supplies</h3>
                <p className="text-[10px] text-muted-foreground">{h.inventory.supplies.available.toLocaleString()} / {h.inventory.supplies.total.toLocaleString()} items</p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
              <div className={`h-full rounded-full ${supplyPct > 60 ? 'bg-emerald-500' : supplyPct > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${supplyPct}%` }} />
            </div>
            {h.inventory.supplies.lowItems.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low Stock Items</p>
                {h.inventory.supplies.lowItems.map(item => (
                  <div key={item} className="text-xs bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">{item}</div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> All supplies adequately stocked</div>
            )}
          </CardContent>
        </Card>

        {/* Temperature & Equipment */}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center"><Thermometer className="h-5 w-5 text-amber-600" /></div>
              <div>
                <h3 className="font-semibold text-sm">Environment</h3>
                <p className="text-[10px] text-muted-foreground">{h.inventory.temperature.safe}/{h.inventory.temperature.rooms} rooms safe</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`p-2.5 rounded-lg text-center border ${h.inventory.temperature.alerts > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <p className={`text-xl font-bold ${h.inventory.temperature.alerts > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{h.inventory.temperature.alerts}</p>
                <p className="text-[10px] text-muted-foreground">Temp Alerts</p>
              </div>
              <div className="p-2.5 rounded-lg text-center border bg-muted/50">
                <p className="text-xl font-bold">{equipPct}%</p>
                <p className="text-[10px] text-muted-foreground">Equipment Up</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>{h.inventory.equipment.operational} of {h.inventory.equipment.total} equipment operational</p>
              <p>{h.inventory.equipment.maintenance} in maintenance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
