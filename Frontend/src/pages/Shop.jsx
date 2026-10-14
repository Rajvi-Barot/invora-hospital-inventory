import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// const instruments = [
//   { id: '1', name: 'Surgical Scalpel Set', category: 'Cutting', price: 45.99, image: '🔪' },
//   { id: '2', name: 'Hemostatic Forceps', category: 'Clamping', price: 32.50, image: '🔧' },
//   { id: '3', name: 'Needle Holder', category: 'Suturing', price: 28.00, image: '🪡' },
//   { id: '4', name: 'Retractor Set', category: 'Retraction', price: 89.99, image: '🔩' },
//   { id: '5', name: 'Surgical Scissors', category: 'Cutting', price: 36.75, image: '✂️' },
//   { id: '6', name: 'Suction Tube Kit', category: 'Aspiration', price: 54.00, image: '💉' },
//   { id: '7', name: 'Electrocautery Pen', category: 'Cautery', price: 125.00, image: '⚡' },
//   { id: '8', name: 'Trocar Set', category: 'Access', price: 78.50, image: '🔬' },
//   { id: '9', name: 'Bone Chisel', category: 'Orthopedic', price: 65.00, image: '🦴' },
//   { id: '10', name: 'Dermatome', category: 'Skin', price: 220.00, image: '🩹' },
//   { id: '11', name: 'Laparoscopic Grasper', category: 'Laparoscopy', price: 185.00, image: '🔭' },
//   { id: '12', name: 'Surgical Drill Bit Set', category: 'Orthopedic', price: 310.00, image: '🔩' },
// ];

// const categories = ['All', ...Array.from(new Set(instruments.map(i => i.category)))];


export default function Shop() {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const { addToCart, totalItems } = useCart();
  const { toast } = useToast();

  const filtered = instruments.filter(i => {
    const matchSearch = (i.name || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || i.category === category;
    return matchSearch && matchCat;
  });

  const categories = [
    'All',
    ...Array.from(new Set(instruments.map(i => i.category)))
  ];

  const handleAdd = (item) => {
    addToCart({ id: item._id, name: item.name, category: item.category, price: item.price, image: item.image });
    toast({ title: `${item.name} added to cart` });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const res = await axios.get("http://localhost:3000/api/v1/products");
        const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/products");
        setInstruments(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surgical Instruments Shop</h1>
          <p className="text-muted-foreground text-sm">Order instruments for your hospital</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/shop/cart'}>
          <ShoppingCart className="h-4 w-4 mr-2" /> Cart ({totalItems})
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search instruments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <Button key={c} variant={category === c ? 'default' : 'outline'} size="sm" onClick={() => setCategory(c)}>{c}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => (
          <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="text-4xl mb-3">{item.image}</div>
              <Badge variant="secondary" className="mb-2">{item.category}</Badge>
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
              <Button className="w-full mt-3" size="sm" onClick={() => handleAdd(item)}>
                <Plus className="h-4 w-4 mr-1" /> Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// import { useEffect } from 'react';
// import axios from 'axios';
// import { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { useCart } from '@/contexts/CartContext';
// import { ShoppingCart, Search, Plus } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// // const instruments = [
// //   { id: '1', name: 'Surgical Scalpel Set', category: 'Cutting', price: 45.99, image: '🔪' },
// //   { id: '2', name: 'Hemostatic Forceps', category: 'Clamping', price: 32.50, image: '🔧' },
// //   { id: '3', name: 'Needle Holder', category: 'Suturing', price: 28.00, image: '🪡' },
// //   { id: '4', name: 'Retractor Set', category: 'Retraction', price: 89.99, image: '🔩' },
// //   { id: '5', name: 'Surgical Scissors', category: 'Cutting', price: 36.75, image: '✂️' },
// //   { id: '6', name: 'Suction Tube Kit', category: 'Aspiration', price: 54.00, image: '💉' },
// //   { id: '7', name: 'Electrocautery Pen', category: 'Cautery', price: 125.00, image: '⚡' },
// //   { id: '8', name: 'Trocar Set', category: 'Access', price: 78.50, image: '🔬' },
// //   { id: '9', name: 'Bone Chisel', category: 'Orthopedic', price: 65.00, image: '🦴' },
// //   { id: '10', name: 'Dermatome', category: 'Skin', price: 220.00, image: '🩹' },
// //   { id: '11', name: 'Laparoscopic Grasper', category: 'Laparoscopy', price: 185.00, image: '🔭' },
// //   { id: '12', name: 'Surgical Drill Bit Set', category: 'Orthopedic', price: 310.00, image: '🔩' },
// // ];

// // const categories = ['All', ...Array.from(new Set(instruments.map(i => i.category)))];


// export default function Shop() {
//   const [instruments, setInstruments] = useState([]);
//   const [search, setSearch] = useState('');
//   const [category, setCategory] = useState('All');
//   const { addToCart, totalItems } = useCart();
//   const { toast } = useToast();

//   const filtered = instruments.filter(i => {
//     const matchSearch = (i.name || "").toLowerCase().includes(search.toLowerCase());
//     const matchCat = category === 'All' || i.category === category;
//     return matchSearch && matchCat;
//   });

//   const categories = [
//     'All',
//     ...Array.from(new Set(instruments.map(i => i.category)))
//   ];

//   const handleAdd = (item) => {
//     addToCart({ id: item.id, name: item.name, category: item.category, price: item.price, image: item.image });
//     toast({ title: `${item.name} added to cart` });
//   };

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await axios.get("http://localhost:3000/api/v1/products");
//         setInstruments(res.data.products);
//       } catch (err) {
//         console.error("Failed to fetch products:", err);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Surgical Instruments Shop</h1>
//           <p className="text-muted-foreground text-sm">Order instruments for your hospital</p>
//         </div>
//         <Button variant="outline" onClick={() => window.location.href = '/shop/cart'}>
//           <ShoppingCart className="h-4 w-4 mr-2" /> Cart ({totalItems})
//         </Button>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative max-w-sm flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input placeholder="Search instruments..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
//         </div>
//         <div className="flex gap-2 flex-wrap">
//           {categories.map(c => (
//             <Button key={c} variant={category === c ? 'default' : 'outline'} size="sm" onClick={() => setCategory(c)}>{c}</Button>
//           ))}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {filtered.map(item => (
//           <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
//             <CardContent className="p-5">
//               <div className="text-4xl mb-3">{item.image}</div>
//               <Badge variant="secondary" className="mb-2">{item.category}</Badge>
//               <h3 className="font-semibold text-sm">{item.name}</h3>
//               <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
//               <Button className="w-full mt-3" size="sm" onClick={() => handleAdd(item)}>
//                 <Plus className="h-4 w-4 mr-1" /> Add to Cart
//               </Button>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
