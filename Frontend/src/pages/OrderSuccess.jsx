// import { useEffect } from 'react';
// import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <p className="text-muted-foreground">No order data found.</p>
        <Button className="mt-4" onClick={() => navigate('/shop')}>Go to Shop</Button>
      </div>
    );
  }

  // useEffect(() => {
  //   const submitOrder = async () => {
  //     try {
  //       await axios.post("http://localhost:3000/api/v1/orders", {
  //         user: state.nurse.name,
  //         hospital: state.nurse.hospital,
  //         department: state.nurse.department,
  //         items: state.items,
  //         totalAmount: state.total
  //       });
  //     } catch (err) {
  //       console.error("Order failed:", err);
  //     }
  //   };

  //   submitOrder();
  // }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-8">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-safe mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mt-2">Your surgical instruments order has been submitted</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-base">Nurse Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Name</p><p className="font-medium">{state.nurse.name}</p></div>
            <div><p className="text-muted-foreground">Email</p><p className="font-medium">{state.nurse.email}</p></div>
            <div><p className="text-muted-foreground">Hospital</p><p className="font-medium">{state.nurse.hospital}</p></div>
            <div><p className="text-muted-foreground">Department</p><p className="font-medium">{state.nurse.department}</p></div>
            {state.nurse.phone && <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{state.nurse.phone}</p></div>}
            {state.nurse.nurseId && <div><p className="text-muted-foreground">Nurse ID</p><p className="font-medium">{state.nurse.nurseId}</p></div>}
          </div>
          {state.nurse.notes && <div className="text-sm"><p className="text-muted-foreground">Notes</p><p className="font-medium">{state.nurse.notes}</p></div>}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-base">Order Items</h3>
          {state.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span>Total</span><span>${state.total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    </div>
  );
}

// import { useEffect } from 'react';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { CheckCircle2 } from 'lucide-react';

// export default function OrderSuccess() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const state = location.state;

//   if (!state) {
//     return (
//       <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
//         <p className="text-muted-foreground">No order data found.</p>
//         <Button className="mt-4" onClick={() => navigate('/shop')}>Go to Shop</Button>
//       </div>
//     );
//   }

//   useEffect(() => {
//     const submitOrder = async () => {
//       try {
//         await axios.post("http://localhost:3000/api/v1/orders", {
//           user: "Admin", // or logged-in user
//           items: cartItems,
//           totalAmount: totalPrice
//         });
//       } catch (err) {
//         console.error("Order failed:", err);
//       }
//     };

//     submitOrder();
//   }, []);

//   return (
//     <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-8">
//       <div className="text-center">
//         <CheckCircle2 className="h-16 w-16 text-safe mx-auto mb-4" />
//         <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
//         <p className="text-muted-foreground mt-2">Your surgical instruments order has been submitted</p>
//       </div>

//       <Card className="border-none shadow-sm">
//         <CardContent className="p-6 space-y-4">
//           <h3 className="font-semibold text-base">Nurse Details</h3>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div><p className="text-muted-foreground">Name</p><p className="font-medium">{state.nurse.name}</p></div>
//             <div><p className="text-muted-foreground">Email</p><p className="font-medium">{state.nurse.email}</p></div>
//             <div><p className="text-muted-foreground">Hospital</p><p className="font-medium">{state.nurse.hospital}</p></div>
//             <div><p className="text-muted-foreground">Department</p><p className="font-medium">{state.nurse.department}</p></div>
//             {state.nurse.phone && <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{state.nurse.phone}</p></div>}
//             {state.nurse.nurseId && <div><p className="text-muted-foreground">Nurse ID</p><p className="font-medium">{state.nurse.nurseId}</p></div>}
//           </div>
//           {state.nurse.notes && <div className="text-sm"><p className="text-muted-foreground">Notes</p><p className="font-medium">{state.nurse.notes}</p></div>}
//         </CardContent>
//       </Card>

//       <Card className="border-none shadow-sm">
//         <CardContent className="p-6 space-y-3">
//           <h3 className="font-semibold text-base">Order Items</h3>
//           {state.items.map((item, i) => (
//             <div key={i} className="flex justify-between text-sm">
//               <span>{item.name} × {item.quantity}</span>
//               <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
//             </div>
//           ))}
//           <div className="border-t pt-3 flex justify-between font-bold text-lg">
//             <span>Total</span><span>${state.total.toFixed(2)}</span>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex gap-3 justify-center">
//         <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
//         <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
//       </div>
//     </div>
//   );
// }
