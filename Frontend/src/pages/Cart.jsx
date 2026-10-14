import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">Browse surgical instruments to add items</p>
        <Button onClick={() => navigate('/shop')}>Browse Shop</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/shop')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold">Shopping Cart</h1><p className="text-muted-foreground text-sm">{totalItems} items</p></div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-3xl">{item.image}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
                <p className="font-bold mt-1">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
              </div>
              <p className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
          </div>
          <Button size="lg" onClick={() => navigate('/shop/checkout')}>Proceed to Checkout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
