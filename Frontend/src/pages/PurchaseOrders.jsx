import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import {
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Search,
    Building2,
    PackageCheck,
    ChevronDown,
    ChevronUp,
    ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function PurchaseOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // const res = await axios.get("http://localhost:3000/api/v1/orders");
            const res = await axios.get("https://invora-qkwq.onrender.com/api/v1/orders");
            setOrders(res.data.orders);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            toast({ title: "Failed to load orders", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const approveOrder = async (id) => {
    try {
        // await axios.patch(`http://localhost:3000/api/v1/orders/${id}/approve`);
        await axios.patch(`https://invora-qkwq.onrender.com/api/v1/orders/${id}/approve`);
        fetchOrders(); // refresh list
    } catch (err) {
        console.error("Approve failed", err);
    }
    };

    const rejectOrder = async (id) => {
    try {
        // await axios.patch(`http://localhost:3000/api/v1/orders/${id}/reject`);
        await axios.patch(`https://invora-qkwq.onrender.com/api/v1/orders/${id}/reject`);
        fetchOrders();
    } catch (err) {
        console.error("Reject failed", err);
    }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            // await axios.put(`http://localhost:3000/api/v1/orders/${id}/status`, {
            await axios.put(`https://invora-qkwq.onrender.com/api/v1/orders/${id}/status`, {
                status: newStatus,
            });

            setOrders((prev) =>
                prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
            );

            // Also update the dialog if it's currently open
            if (selectedOrder?._id === id) {
                setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
            }

            toast({
                title: "Order Updated",
                description: `Order successfully marked as ${newStatus}`,
            });
        } catch (err) {
            console.error("Failed to update status:", err);
            toast({ title: "Update failed", variant: "destructive" });
        }
    };

    const filteredOrders = orders.filter((o) => {
        const matchSearch =
            o._id.toLowerCase().includes(search.toLowerCase()) ||
            o.hospital.toLowerCase().includes(search.toLowerCase()) ||
            o.user.toLowerCase().includes(search.toLowerCase());

        const matchStatus = filterStatus === "All" || o.status === filterStatus;

        return matchSearch && matchStatus;
    });

    const getStatusConfig = (status) => {
        switch (status) {
            case "Draft":
                return { icon: FileText, color: "bg-slate-100 text-slate-700 border-slate-200" };
            case "Pending":
                return { icon: Clock, color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
            case "Approved":
                return { icon: CheckCircle2, color: "bg-green-100 text-green-800 border-green-200" };
            case "Rejected":
                return { icon: XCircle, color: "bg-red-100 text-red-800 border-red-200" };
            case "Completed":
                return { icon: PackageCheck, color: "bg-blue-100 text-blue-800 border-blue-200" };
            default:
                return { icon: FileText, color: "bg-gray-100 text-gray-800 border-gray-200" };
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
                Loading orders...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                    Review and manage incoming supply requests
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search ID, hospital, or user..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full pb-2 sm:pb-0">
                    {["All", "Draft", "Pending", "Approved", "Rejected", "Completed"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 whitespace-nowrap rounded-lg text-sm font-medium transition-all ${filterStatus === f
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-card text-muted-foreground hover:text-foreground border border-border"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="grid gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
                        <PackageCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No orders found matching your criteria</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const StatusIcon = getStatusConfig(order.status).icon;
                        const itemCount = order.items?.length || 0;

                        return (
                            <div
                                key={order._id}
                                className="bg-card rounded-2xl border border-border p-5 transition-all hover:shadow-md"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                    {/* Left: Meta */}
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono text-sm font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                                                #{order._id.toString().slice(-6).toUpperCase()}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`gap-1.5 pr-3 font-semibold border ${getStatusConfig(order.status).color}`}
                                            >
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {order.status}
                                            </Badge>
                                            {order.autoGenerated && (
                                                <Badge
                                                    variant="secondary"
                                                    className="gap-1 bg-indigo-50 text-indigo-700 border-indigo-200"
                                                >
                                                    ⚡ Auto-Generated
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                    Requested By
                                                </p>
                                                <p className="font-medium">{order.user}</p>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                    Location
                                                </p>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {order.hospital}
                                                </div>
                                                <p className="text-sm text-muted-foreground ml-5 mt-0.5">
                                                    {order.department}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Summary + Actions */}
                                    <div className="flex flex-col lg:items-end gap-3 min-w-[260px]">
                                        {/* Quick summary */}
                                        <div className="w-full bg-muted/40 rounded-xl p-4 border border-border/50">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Order Summary
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                                                </span>
                                            </div>

                                            {/* Show first 2 items inline */}
                                            <div className="space-y-1.5 mb-3">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="font-medium truncate max-w-[160px]">
                                                            {item.quantity}x{" "}
                                                            <span className="text-muted-foreground font-normal">
                                                                {item.name}
                                                            </span>
                                                        </span>
                                                        <span className="font-medium text-muted-foreground ml-2 shrink-0">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {itemCount > 2 && (
                                                    <p className="text-xs text-primary font-medium">
                                                        +{itemCount - 2} more item{itemCount - 2 !== 1 ? "s" : ""}…
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end border-t border-border pt-2">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                                    Total
                                                </span>
                                                <span className="text-xl font-bold text-foreground">
                                                    ${order.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-2 w-full justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <ShoppingBag className="h-4 w-4" />
                                                View All Items
                                            </Button>
                                            {isAdmin &&
                                                (order.status === "Pending" || order.status === "Draft") && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 hover:text-red-800"
                                                            onClick={() => updateStatus(order._id, "Rejected")}
                                                        >
                                                            <XCircle className="mr-1 h-4 w-4" /> Reject
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => updateStatus(order._id, "Approved")}
                                                        >
                                                            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                                                        </Button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <span>
                                    Order #
                                    {selectedOrder._id.toString().slice(-6).toUpperCase()}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`gap-1.5 pr-3 font-semibold border text-sm ${getStatusConfig(selectedOrder.status).color}`}
                                >
                                    {selectedOrder.status}
                                </Badge>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 mt-2">
                            {/* Order Meta */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                        Requested By
                                    </p>
                                    <p className="font-medium">{selectedOrder.user}</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">
                                        {format(new Date(selectedOrder.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                        Location
                                    </p>
                                    <p className="font-medium">{selectedOrder.hospital}</p>
                                    <p className="text-muted-foreground text-xs mt-0.5">
                                        {selectedOrder.department}
                                    </p>
                                </div>
                            </div>

                            {/* Full Items Table */}
                            <div className="bg-muted/40 rounded-xl border border-border/50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-border bg-muted/60">
                                    <div className="grid grid-cols-12 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <span className="col-span-5">Item</span>
                                        <span className="col-span-2 text-center">Qty</span>
                                        <span className="col-span-2 text-right">Unit Price</span>
                                        <span className="col-span-3 text-right">Subtotal</span>
                                    </div>
                                </div>
                                <div className="divide-y divide-border">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 text-sm px-4 py-3 items-center">
                                            <span className="col-span-5 font-medium">{item.name}</span>
                                            <span className="col-span-2 text-center text-muted-foreground">{item.quantity}</span>
                                            <span className="col-span-2 text-right text-muted-foreground">${item.price?.toFixed(2)}</span>
                                            <span className="col-span-3 text-right font-semibold">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-4 py-3 border-t border-border bg-muted/60 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">
                                        Grand Total
                                    </span>
                                    <span className="text-xl font-bold">
                                        ${selectedOrder.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Admin Actions inside modal */}
                            {isAdmin &&
                                (selectedOrder.status === "Pending" || selectedOrder.status === "Draft") && (
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button
                                            variant="outline"
                                            className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200 hover:text-red-800"
                                            onClick={() => updateStatus(selectedOrder._id, "Rejected")}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Reject Order
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => updateStatus(selectedOrder._id, "Approved")}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Approve Order
                                        </Button>
                                    </div>
                                )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}