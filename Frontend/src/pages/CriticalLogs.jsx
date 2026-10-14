import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield, Search, AlertTriangle, UserX, Trash2, Lock,
  ServerCrash, Clock, Filter, Download, ChevronDown,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const criticalLogs = [
  { id: '1', severity: 'critical', action: 'UNAUTHORIZED_ACCESS', description: 'Failed login attempt from unknown IP 192.168.45.12 — 5 consecutive failures', user: 'Unknown', ip: '192.168.45.12', timestamp: '2026-03-20T09:14:00Z', module: 'Auth' },
  { id: '2', severity: 'critical', action: 'STOCK_DEPLETED', description: 'O-negative blood stock depleted at City General Hospital — 0 units remaining', user: 'System', ip: '-', timestamp: '2026-03-20T08:30:00Z', module: 'Inventory' },
  { id: '3', severity: 'high', action: 'EMERGENCY_BROADCAST', description: 'Critical emergency request broadcasted to all hospitals for trauma patient', user: 'Dr. Sarah Johnson', ip: '10.0.1.55', timestamp: '2026-03-20T08:15:00Z', module: 'Emergency' },
  { id: '4', severity: 'high', action: 'TEMP_VIOLATION', description: 'Temperature exceeded safe range (12.3°C) in Vaccine Storage Bin BIN-042', user: 'System', ip: '-', timestamp: '2026-03-19T23:45:00Z', module: 'Monitoring' },
  { id: '5', severity: 'critical', action: 'DATA_DELETION', description: 'Bulk deletion of 47 expired inventory records from Metro Medical Center', user: 'Admin', ip: '10.0.1.10', timestamp: '2026-03-19T18:00:00Z', module: 'Database' },
  { id: '6', severity: 'medium', action: 'PERMISSION_CHANGE', description: 'Nurse Williams elevated to admin privileges for River Valley Hospital', user: 'Admin', ip: '10.0.1.10', timestamp: '2026-03-19T14:20:00Z', module: 'Auth' },
  { id: '7', severity: 'high', action: 'SYSTEM_OVERLOAD', description: 'API rate limit exceeded — 1,247 requests in 60 seconds from Metro Medical', user: 'System', ip: '10.0.2.100', timestamp: '2026-03-19T12:05:00Z', module: 'Infrastructure' },
  { id: '8', severity: 'medium', action: 'BACKUP_FAILED', description: 'Scheduled database backup failed — disk space insufficient on backup server', user: 'System', ip: '-', timestamp: '2026-03-18T03:00:00Z', module: 'Infrastructure' },
  { id: '9', severity: 'critical', action: 'EMERGENCY_UNRESPONDED', description: 'Critical blood request from City General unresponded after 2 hours', user: 'System', ip: '-', timestamp: '2026-03-18T01:30:00Z', module: 'Emergency' },
  { id: '10', severity: 'high', action: 'EQUIPMENT_FAILURE', description: 'Ventilator #V-034 offline at ICU-101 — maintenance alert triggered', user: 'System', ip: '-', timestamp: '2026-03-17T22:15:00Z', module: 'Equipment' },
];

const severityConfig = {
  critical: { color: 'bg-red-500 text-white', icon: AlertTriangle, dot: 'bg-red-500' },
  high: { color: 'bg-orange-500 text-white', icon: ServerCrash, dot: 'bg-orange-500' },
  medium: { color: 'bg-amber-400 text-amber-900', icon: Shield, dot: 'bg-amber-400' },
};

const moduleIcons = {
  Auth: Lock,
  Inventory: AlertTriangle,
  Emergency: AlertTriangle,
  Monitoring: AlertTriangle,
  Database: Trash2,
  Infrastructure: ServerCrash,
  Equipment: ServerCrash,
};

export default function CriticalLogs() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = [...new Set(criticalLogs.map(l => l.module))];

  const filtered = criticalLogs.filter(log => {
    const matchSearch = log.description.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchSearch && matchSeverity && matchModule;
  });

  const stats = {
    critical: criticalLogs.filter(l => l.severity === 'critical').length,
    high: criticalLogs.filter(l => l.severity === 'high').length,
    medium: criticalLogs.filter(l => l.severity === 'medium').length,
  };

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
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Critical Action Logs</h1>
            <p className="text-muted-foreground text-sm">Security events, system alerts & audit trail</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Logs
        </Button>
      </div>

      {/* Severity Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical', count: stats.critical, color: 'bg-red-50 border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
          { label: 'High', count: stats.high, color: 'bg-orange-50 border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' },
          { label: 'Medium', count: stats.medium, color: 'bg-amber-50 border-amber-200', text: 'text-amber-600', dot: 'bg-amber-400' },
        ].map(s => (
          <Card key={s.label} className={`border ${s.color}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${s.dot} ${s.label === 'Critical' ? 'animate-pulse' : ''}`} />
              <div>
                <p className={`text-2xl font-bold ${s.text}`}>{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label} Events</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">🔴 Critical</SelectItem>
            <SelectItem value="high">🟠 High</SelectItem>
            <SelectItem value="medium">🟡 Medium</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Module" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Log Entries */}
      <div className="space-y-3">
        {filtered.map(log => {
          const sev = severityConfig[log.severity];
          const SevIcon = sev.icon;
          return (
            <Card key={log.id} className="border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className={`h-0.5 ${sev.dot}`} />
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  log.severity === 'critical' ? 'bg-red-100' : log.severity === 'high' ? 'bg-orange-100' : 'bg-amber-100'
                }`}>
                  <SevIcon className={`h-5 w-5 ${
                    log.severity === 'critical' ? 'text-red-600' : log.severity === 'high' ? 'text-orange-600' : 'text-amber-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={`${sev.color} border-0 text-[10px]`}>{log.severity.toUpperCase()}</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">{log.action}</Badge>
                    <Badge variant="outline" className="text-[10px]">{log.module}</Badge>
                  </div>
                  <p className="text-sm text-foreground mb-1">{log.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><UserX className="h-3 w-3" /> {log.user}</span>
                    {log.ip !== '-' && <span className="font-mono">{log.ip}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(log.timestamp)}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="h-14 w-14 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No logs matching filters</p>
        </div>
      )}
    </div>
  );
}
