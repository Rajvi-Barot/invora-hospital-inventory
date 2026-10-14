import axios from 'axios';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    hospital: '',
    nurseId: '',
    notes: ''
  });

  // Prefill logged-in user info
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/hospitals");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/hospitals");
        setHospitals(res.data.hospitals || []);
      } catch (err) {
        console.error("Failed to fetch hospitals:", err);
      }
    };

    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.hospital || !form.department) return;

    try {
      // await axios.post("http://localhost:3000/api/v1/orders", {
      await axios.post("https://invora-qkwq.onrender.com/api/v1/orders", {
        user: form.name,
        hospital: form.hospital,
        department: form.department,
        items: items.map(i => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        totalAmount: totalPrice
      });

      clearCart();

      navigate('/shop/success', {
        state: { nurse: form, items, total: totalPrice }
      });

    } catch (err) {
      console.error("Order failed:", err);
    }
  };

  if (items.length === 0) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/shop/cart')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nurse Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <Label>Full Name *</Label>
                <Input
                  required
                  value={form.name}
                  // onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  disabled
                />
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  // onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label>Nurse ID</Label>
                <Input
                  value={form.nurseId}
                  onChange={e => setForm(f => ({ ...f, nurseId: e.target.value }))}
                />
              </div>

              <div>
                <Label>Hospital *</Label>
                <select
                  required
                  value={form.hospital}
                  onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select Hospital</option>

                  {hospitals.map(h => (
                    <option key={h._id} value={h.name}>
                      {h.name}
                    </option>
                  ))}

                </select>
              </div>

              <div>
                <Label>Department *</Label>
                <Input
                  required
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                />
              </div>

            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>

          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">

            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Place Order
        </Button>

      </form>
    </div>
  );
}

// import axios from 'axios';
// import { useState } from 'react';
// import { useCart } from '@/contexts/CartContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useEffect } from 'react';


// export default function Checkout() {
//   const { items, totalPrice, clearCart } = useCart();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', hospital: '', nurseId: '', notes: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.email || !form.hospital || !form.department) return;

//     try {
//       await axios.post("http://localhost:3000/api/v1/orders", {
//         user: form.name,
//         hospital: form.hospital,
//         department: form.department,
//         items: items.map(i => ({
//           productId: i.id,
//           name: i.name,
//           price: i.price,
//           quantity: i.quantity
//         })),
//         totalAmount: totalPrice
//       });

//       clearCart();

//       navigate('/shop/success', {
//         state: { nurse: form, items, total: totalPrice }
//       });

//     } catch (err) {
//       console.error("Order failed:", err);
//     }
//   };

//   if (items.length === 0) {
//     navigate('/shop');
//     return null;
//   }

//   return (
//     <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
//       <div className="flex items-center gap-4">
//         <Button variant="ghost" size="icon" onClick={() => navigate('/shop/cart')}><ArrowLeft className="h-5 w-5" /></Button>
//         <h1 className="text-2xl font-bold">Checkout</h1>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <Card className="border-none shadow-sm">
//           <CardHeader><CardTitle className="text-base">Nurse Details</CardTitle></CardHeader>
//           <CardContent className="space-y-4">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div><Label>Full Name *</Label><Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
//               <div><Label>Email *</Label><Input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
//               <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
//               <div><Label>Nurse ID</Label><Input value={form.nurseId} onChange={e => setForm(f => ({ ...f, nurseId: e.target.value }))} /></div>
//               <div><Label>Hospital *</Label><Input required value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))} /></div>
//               <div><Label>Department *</Label><Input required value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
//             </div>
//             <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
//           </CardContent>
//         </Card>

//         <Card className="border-none shadow-sm">
//           <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
//           <CardContent className="space-y-2">
//             {items.map(item => (
//               <div key={item.id} className="flex justify-between text-sm">
//                 <span>{item.name} × {item.quantity}</span>
//                 <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
//               </div>
//             ))}
//             <div className="border-t pt-2 mt-2 flex justify-between font-bold">
//               <span>Total</span><span>${totalPrice.toFixed(2)}</span>
//             </div>
//           </CardContent>
//         </Card>

//         <Button type="submit" size="lg" className="w-full">Place Order</Button>
//       </form>
//     </div>
//   );
// }
