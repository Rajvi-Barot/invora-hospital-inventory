import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sparkles, Building2, MapPin, Package, Droplets, Stethoscope,
  CheckCircle2, Star, TrendingUp, ArrowRight, Zap, Clock,
  ThumbsUp, AlertTriangle, Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useEmergency } from '@/contexts/EmergencyContext';

const hospitalDatabase = [
  {
    id: '1', name: 'Metro Medical Center', distance: 2.4, city: 'Downtown',
    stock: { blood: { 'O-': 12, 'O+': 28, 'A+': 15, 'A-': 8, 'B+': 20, 'AB+': 6 }, supplies: { 'IV Fluids': 340, 'Syringes': 1200, 'Bandages': 800, 'Ventilators': 5 }, doctors: { 'Cardiologist': 3, 'Neurologist': 2, 'Surgeon': 4, 'Anesthesiologist': 2 } },
    rating: 4.8, responseTime: '12 min', successRate: 94,
  },
  {
    id: '2', name: 'Unified Healthcare', distance: 5.1, city: 'Midtown',
    stock: { blood: { 'O-': 5, 'O+': 18, 'A+': 22, 'A-': 3, 'B+': 14, 'AB+': 9 }, supplies: { 'IV Fluids': 180, 'Syringes': 900, 'Bandages': 450, 'Ventilators': 2 }, doctors: { 'Cardiologist': 1, 'Neurologist': 3, 'Surgeon': 2, 'Anesthesiologist': 1 } },
    rating: 4.5, responseTime: '18 min', successRate: 88,
  },
  {
    id: '3', name: "St. John's Hospital", distance: 8.3, city: 'Westside',
    stock: { blood: { 'O-': 20, 'O+': 35, 'A+': 10, 'A-': 12, 'B+': 25, 'AB+': 4 }, supplies: { 'IV Fluids': 520, 'Syringes': 2000, 'Bandages': 1100, 'Ventilators': 8 }, doctors: { 'Cardiologist': 4, 'Neurologist': 1, 'Surgeon': 5, 'Anesthesiologist': 3 } },
    rating: 4.9, responseTime: '25 min', successRate: 97,
  },
  {
    id: '4', name: 'River Valley Hospital', distance: 12.7, city: 'Eastside',
    stock: { blood: { 'O-': 8, 'O+': 22, 'A+': 18, 'A-': 6, 'B+': 11, 'AB+': 7 }, supplies: { 'IV Fluids': 290, 'Syringes': 750, 'Bandages': 600, 'Ventilators': 3 }, doctors: { 'Cardiologist': 2, 'Neurologist': 2, 'Surgeon': 3, 'Anesthesiologist': 2 } },
    rating: 4.3, responseTime: '35 min', successRate: 82,
  },
  {
    id: '5', name: 'Regional Health Campus', distance: 18.2, city: 'Northside',
    stock: { blood: { 'O-': 30, 'O+': 45, 'A+': 25, 'A-': 15, 'B+': 30, 'AB+': 12 }, supplies: { 'IV Fluids': 700, 'Syringes': 3000, 'Bandages': 1500, 'Ventilators': 12 }, doctors: { 'Cardiologist': 5, 'Neurologist': 4, 'Surgeon': 6, 'Anesthesiologist': 4 } },
    rating: 4.7, responseTime: '45 min', successRate: 91,
  },
];

const needCategories = {
  blood: { label: 'Blood', icon: Droplets, items: ['O-', 'O+', 'A+', 'A-', 'B+', 'AB+'] },
  supplies: { label: 'Supplies', icon: Package, items: ['IV Fluids', 'Syringes', 'Bandages', 'Ventilators'] },
  doctors: { label: 'Doctor', icon: Stethoscope, items: ['Cardiologist', 'Neurologist', 'Surgeon', 'Anesthesiologist'] },
};

function getMatchScore(hospital, category, item, quantity) {
  const available = hospital.stock[category]?.[item] || 0;
  if (available === 0) return 0;
  const fulfillment = Math.min(available / quantity, 1);
  const distanceScore = Math.max(0, 1 - hospital.distance / 30);
  const ratingScore = hospital.rating / 5;
  const successScore = hospital.successRate / 100;
  return Math.round((fulfillment * 0.4 + distanceScore * 0.25 + ratingScore * 0.15 + successScore * 0.2) * 100);
}

export default function HospitalMatcher() {
  const [category, setCategory] = useState('blood');
  const [item, setItem] = useState('O-');
  const [quantity, setQuantity] = useState(5);
  const [results, setResults] = useState(null);
  const [requestDialog, setRequestDialog] = useState(null);
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const { addRequest } = useEmergency();

  const findMatches = () => {
    const scored = hospitalDatabase
      .map(h => ({ ...h, score: getMatchScore(h, category, item, quantity), available: h.stock[category]?.[item] || 0 }))
      .filter(h => h.available > 0)
      .sort((a, b) => b.score - a.score);
    setResults(scored);
  };

  const sendRequest = (hospital) => {
    addRequest({
      type: category,
      urgency: 'high',
      fromHospital: 'City General Hospital',
      toHospitals: [hospital.name],
      title: `${item} Request — ${quantity} ${category === 'doctors' ? 'specialist(s)' : 'units'} needed`,
      description: message || `Requesting ${quantity} ${item} from ${hospital.name}. Match score: ${hospital.score}%.`,
      quantity: `${quantity} ${category === 'doctors' ? 'specialist(s)' : 'units'}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      responses: [],
    });
    setRequestDialog(null);
    setMessage('');
    toast({ title: '✅ Request Sent', description: `Emergency request sent to ${hospital.name}` });
  };

  const CatIcon = needCategories[category].icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Smart Hospital Matcher</h1>
          <p className="text-muted-foreground text-sm">AI-powered recommendations based on stock, distance & reliability</p>
        </div>
      </div>

      {/* Search Panel */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</Label>
              <Select value={category} onValueChange={v => { setCategory(v); setItem(needCategories[v].items[0]); setResults(null); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">🩸 Blood</SelectItem>
                  <SelectItem value="supplies">📦 Supplies</SelectItem>
                  <SelectItem value="doctors">🩺 Doctors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Specific Need</Label>
              <Select value={item} onValueChange={v => { setItem(v); setResults(null); }}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {needCategories[category].items.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quantity Needed</Label>
              <Input type="number" min={1} value={quantity} onChange={e => { setQuantity(Number(e.target.value)); setResults(null); }} className="mt-1.5" />
            </div>
            <Button onClick={findMatches} className="gap-2 h-10">
              <Zap className="h-4 w-4" /> Find Best Matches
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {results.length} Hospital{results.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-sm text-muted-foreground">
              Searching for <strong>{quantity} {item}</strong>
            </p>
          </div>

          {results.length === 0 && (
            <Card className="border">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-medium text-muted-foreground">No hospitals have this item in stock</p>
                <p className="text-sm text-muted-foreground mt-1">Try broadening your search or reducing the quantity</p>
              </CardContent>
            </Card>
          )}

          {results.map((hospital, idx) => {
            const canFulfill = hospital.available >= quantity;
            return (
              <Card key={hospital.id} className={`border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${idx === 0 ? 'ring-2 ring-primary/20' : ''}`}>
                {idx === 0 && (
                  <div className="bg-primary/5 border-b border-primary/10 px-5 py-1.5 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                    <span className="text-xs font-semibold text-primary">Best Match</span>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Score Circle */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                        hospital.score >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        hospital.score >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        <span className="text-xl font-bold leading-none">{hospital.score}</span>
                        <span className="text-[9px] font-medium uppercase tracking-wider">score</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base">{hospital.name}</h3>
                          {idx < 3 && <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Top {idx + 1}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {hospital.distance} km — {hospital.city}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{hospital.responseTime}</span>
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {hospital.successRate}% success</span>
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {hospital.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Availability + Action */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <CatIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-lg font-bold">{hospital.available}</span>
                          <span className="text-xs text-muted-foreground">available</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] mt-1 ${canFulfill ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {canFulfill ? `Can fulfill ${quantity}/${quantity}` : `Partial: ${hospital.available}/${quantity}`}
                        </Badge>
                      </div>
                      <Button size="sm" className="gap-1.5" onClick={() => setRequestDialog(hospital)}>
                        <Send className="h-3.5 w-3.5" /> Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Request Dialog */}
      <Dialog open={!!requestDialog} onOpenChange={() => { setRequestDialog(null); setMessage(''); }}>
        <DialogContent>
          {requestDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" /> Send Request to {requestDialog.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Requesting</span>
                    <Badge>{quantity} {item}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Available at {requestDialog.name}</span>
                    <span className="font-medium text-foreground">{requestDialog.available} {category === 'doctors' ? 'specialist(s)' : 'units'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Match Score</span>
                    <span className="font-medium text-foreground">{requestDialog.score}%</span>
                  </div>
                </div>
                <div>
                  <Label>Additional Message (optional)</Label>
                  <Textarea placeholder="Any specific details or requirements..." value={message} onChange={e => setMessage(e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRequestDialog(null)}>Cancel</Button>
                <Button onClick={() => sendRequest(requestDialog)} className="gap-2">
                  <Send className="h-4 w-4" /> Send Emergency Request
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
