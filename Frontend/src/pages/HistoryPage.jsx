import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// const auditLog = [
//   { _id: '1', action: 'CREATE', entity: 'Hospital', entityName: 'Metro Emergency Hospital', user: 'Dr. Sarah Johnson', timestamp: '2026-02-16T10:30:00Z', details: 'New hospital registered' },
//   { _id: '2', action: 'UPDATE', entity: 'Room', entityName: 'ICU-101', user: 'Dr. Sarah Johnson', timestamp: '2026-02-16T09:15:00Z', details: 'Updated room capacity' },
//   { _id: '3', action: 'DELETE', entity: 'Bin', entityName: 'BIN-099', user: 'Nurse Williams', timestamp: '2026-02-15T16:45:00Z', details: 'Removed expired bin' },
//   { _id: '4', action: 'CREATE', entity: 'Rack', entityName: 'Rack-E1', user: 'Dr. Sarah Johnson', timestamp: '2026-02-15T14:20:00Z', details: 'Added new storage rack' },
//   { _id: '5', action: 'UPDATE', entity: 'Hospital', entityName: 'City General Hospital', user: 'Admin', timestamp: '2026-02-15T11:00:00Z', details: 'Updated contact information' },
//   { _id: '6', action: 'CREATE', entity: 'Bin', entityName: 'BIN-005', user: 'Nurse Williams', timestamp: '2026-02-14T08:30:00Z', details: 'New bin for vaccine storage' },
// ];

const actionColors = {
  CREATE: 'bg-stat-green-light text-stat-green',
  UPDATE: 'bg-stat-blue-light text-stat-blue',
  DELETE: 'bg-stat-coral-light text-stat-coral',
};

export default function HistoryPage() {
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/history");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/history");
        setAuditLog(res.data.history);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-muted-foreground text-sm">Audit log of all system actions</p>
      </div>

      <div className="space-y-3">
        {auditLog.map(entry => (
          <Card key={entry._id} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <Badge className={`${actionColors[entry.action]} border-none font-semibold text-xs min-w-[70px] justify-center`}>
                {entry.action}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {entry.entity}: <span className="text-foreground">{entry.entityName}</span>
                </p>
                <p className="text-xs text-muted-foreground">{entry.details}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{entry.user}</p>
                <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
