import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Shield, User, CalendarDays, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin } from "lucide-react";
import { Pencil } from "lucide-react";

export default function Profile() {
  const { user, loading, setUser } = useAuth();

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const handleLeaveSubmit = async () => {
    if (!leaveForm.from || !leaveForm.to || !leaveForm.reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // await axios.post("http://localhost:3000/api/v1/leave", {
      await axios.post("https://invora-qkwq.onrender.com/api/v1/leave", {
        nurseId: user._id,
        nurseName: user.name,
        from: leaveForm.from,
        to: leaveForm.to,
        reason: leaveForm.reason
      });

      toast.success('Leave request submitted successfully');

      setLeaveForm({ from: '', to: '', reason: '' });
      setLeaveOpen(false);

    } catch (err) {
      toast.error("Failed to submit leave request");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast.error("Enter new password");
      return;
    }

    try {
      await axios.put(
        // "http://localhost:3000/api/v1/reset-password",
        "https://invora-qkwq.onrender.com/api/v1/reset-password",
        {
          email: user.email,
          newPassword
        }
      );

      toast.success("Password updated successfully");
      setPasswordOpen(false);
      setNewPassword("");

    } catch (err) {
      toast.error("Failed to update password");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("auth"))?.token;

      const res = await axios.put(
        // "http://localhost:3000/api/v1/profile",
        "https://invora-qkwq.onrender.com/api/v1/profile",
        { phone, address },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(res.data.user);

      localStorage.setItem(
        "auth",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("auth")),
          user: res.data.user
        })
      );

      toast.success("Profile updated");
      setEditOpen(false);

    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      toast.error("Failed to update");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const token = JSON.parse(localStorage.getItem("auth"))?.token;

    try {
      const res = await axios.put(
        // "http://localhost:3000/api/v1/upload-profile-pic",
        "https://invora-qkwq.onrender.com/api/v1/upload-profile-pic",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setUser(res.data.user);
      toast.success("Profile picture updated");

    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data || err.message);
      toast.error("Upload failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>

        <div className="flex gap-2">
          <Button onClick={() => setLeaveOpen(true)} className="gap-2">
            <CalendarDays className="h-4 w-4" /> Request Leave
          </Button>

          <Button variant="outline" onClick={() => setPasswordOpen(true)}>
            Change Password
          </Button>

          {/* <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button> */}
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={
                  user.profilePic
                    // ? `http://localhost:3000/uploads/${user.profilePic}`
                    ? `https://invora-qkwq.onrender.com/uploads/${user.profilePic}`
                    : `https://ui-avatars.com/api/?name=${user.name}`
                }
                alt="profile"
                className="h-20 w-20 rounded-full object-cover"
              />

              {/* Upload button */}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
            </div>
            {/* <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
              {user.name.charAt(0)}
            </div> */}
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <Badge className="mt-1 capitalize">{user.role}</Badge>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="text-sm font-medium">
                    {user.phone || "Not added"}
                  </p>
                </div>
              </div>
              <Pencil
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-primary"
                onClick={() => setEditOpen(true)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium">
                  {user.address || "Not added"}
                </p>
              </div>
            </div>
            <Pencil
              className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-primary"
              onClick={() => setEditOpen(true)}
            />
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Dialog */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" value={leaveForm.from} onChange={e => setLeaveForm(p => ({ ...p, from: e.target.value }))} />
              <Input type="date" value={leaveForm.to} onChange={e => setLeaveForm(p => ({ ...p, to: e.target.value }))} />
            </div>

            <Textarea
              placeholder="Enter reason..."
              value={leaveForm.reason}
              onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>Cancel</Button>
            <Button onClick={handleLeaveSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">

          <DialogHeader>
            <DialogTitle>Edit Contact Details</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update your phone number and address
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    </div>
  );
}

// import { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/contexts/AuthContext';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Mail, Shield, User, CalendarDays } from 'lucide-react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import { MapPin } from "lucide-react";

// export default function Profile() {
//   const { user, loading } = useAuth();
//   const [address, setAddress] = useState("");
//   const [phone, setPhone] = useState("");
//   const [editOpen, setEditOpen] = useState(false);
//   const [leaveOpen, setLeaveOpen] = useState(false);
//   const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });
//   const [passwordOpen, setPasswordOpen] = useState(false);
//   const [newPassword, setNewPassword] = useState("");

//   if (loading) return <div>Loading...</div>;
//   if (!user) return null;

//   const handleLeaveSubmit = async () => {
//     if (!leaveForm.from || !leaveForm.to || !leaveForm.reason.trim()) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     try {
//       await axios.post("http://localhost:3000/api/v1/leave", {
//         nurseId: user._id,
//         nurseName: user.name,
//         from: leaveForm.from,
//         to: leaveForm.to,
//         reason: leaveForm.reason
//       });

//       toast.success('Leave request submitted successfully');

//       setLeaveForm({ from: '', to: '', reason: '' });
//       setLeaveOpen(false);

//     } catch (err) {
//       toast.error("Failed to submit leave request");
//     }
//   };
//   const handlePasswordChange = async () => {
//     if (!newPassword) {
//       toast.error("Enter new password");
//       return;
//     }

//     try {
//       await axios.put(
//         "http://localhost:3000/api/v1/reset-password",
//         {
//           email: user.email,
//           newPassword
//         }
//       );

//       toast.success("Password updated successfully");
//       setPasswordOpen(false);
//       setNewPassword("");

//     } catch (err) {
//       toast.error("Failed to update password");
//     }
//   };

//   const handleUpdatePhone = async () => {
//     try {
//       const token = JSON.parse(localStorage.getItem("auth"))?.token;

//       const res = await axios.put(
//         "http://localhost:3000/api/v1/update-profile",
//         {
//           phone,
//           address
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         }
//       );

//       toast.success("Profile updated");

//       localStorage.setItem(
//         "auth",
//         JSON.stringify({
//           ...JSON.parse(localStorage.getItem("auth")),
//           user: res.data.user
//         })
//       );

//       setEditOpen(false);

//     } catch (err) {
//       toast.error("Failed to update");
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Profile</h1>

//         <div className="flex gap-2">
//           <Button onClick={() => setLeaveOpen(true)} className="gap-2">
//             <CalendarDays className="h-4 w-4" /> Request Leave
//           </Button>

//           <Button variant="outline" onClick={() => setPasswordOpen(true)}>
//             Change Password
//           </Button>
//         </div>
//       </div>
//       {/* <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Profile</h1>
//         <Button onClick={() => setLeaveOpen(true)} className="gap-2">
//           <CalendarDays className="h-4 w-4" /> Request Leave
//         </Button>
//       </div> */}

//       <Card className="border-none shadow-sm">
//         <CardContent className="p-8">
//           <div className="flex items-center gap-6">
//             <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
//               {user.name.charAt(0)}
//             </div>
//             <div>
//               <h2 className="text-xl font-bold">{user.name}</h2>
//               <Badge className="mt-1 capitalize">{user.role}</Badge>
//             </div>
//           </div>

//           <div className="mt-8 space-y-4">
//             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
//               <User className="h-5 w-5 text-muted-foreground" />
//               <div>
//                 <p className="text-xs text-muted-foreground">Full Name</p>
//                 <p className="text-sm font-medium">{user.name}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
//               <Mail className="h-5 w-5 text-muted-foreground" />
//               <div>
//                 <p className="text-xs text-muted-foreground">Email</p>
//                 <p className="text-sm font-medium">{user.email}</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
//               <Shield className="h-5 w-5 text-muted-foreground" />
//               <div>
//                 <p className="text-xs text-muted-foreground">Role</p>
//                 <p className="text-sm font-medium capitalize">{user.role}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
//               <MapPin className="h-5 w-5 text-muted-foreground" />
//               <div>
//                 <p className="text-xs text-muted-foreground">Address</p>
//                 <p className="text-sm font-medium">
//                   {user.address || "Not added"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Request Leave</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4 py-2">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="from">From Date</Label>
//                 <Input
//                   id="from"
//                   type="date"
//                   value={leaveForm.from}
//                   onChange={e =>
//                     setLeaveForm(p => ({ ...p, from: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="to">To Date</Label>
//                 <Input
//                   id="to"
//                   type="date"
//                   value={leaveForm.to}
//                   onChange={e =>
//                     setLeaveForm(p => ({ ...p, to: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="reason">Reason</Label>
//               <Textarea
//                 id="reason"
//                 placeholder="Enter reason for leave..."
//                 value={leaveForm.reason}
//                 onChange={e =>
//                   setLeaveForm(p => ({ ...p, reason: e.target.value }))
//                 }
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setLeaveOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleLeaveSubmit}>
//               Submit Request
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Change Password</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4 py-2">
//             <div className="space-y-2">
//               <Label>New Password</Label>
//               <Input
//                 type="password"
//                 placeholder="Enter new password"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setPasswordOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handlePasswordChange}>
//               Update Password
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // import { useState } from 'react';
// // import { useAuth } from '@/contexts/AuthContext';
// // import { Card, CardContent } from '@/components/ui/card';
// // import { Badge } from '@/components/ui/badge';
// // import { Button } from '@/components/ui/button';
// // import { Mail, Shield, User, CalendarDays } from 'lucide-react';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
// // import { Input } from '@/components/ui/input';
// // import { Textarea } from '@/components/ui/textarea';
// // import { Label } from '@/components/ui/label';
// // import { toast } from 'sonner';

// // export default function Profile() {
// //   const { user, loading} = useAuth();
// //   const [leaveOpen, setLeaveOpen] = useState(false);
// //   const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '' });
// //   // const { user, loading } = useAuth();

// //   if (loading) return <div>Loading...</div>;
// //   if (!user) return null;

// //   if (!user) return null;

// //   const handleLeaveSubmit = () => {
// //     if (!leaveForm.from || !leaveForm.to || !leaveForm.reason.trim()) {
// //       toast.error('Please fill in all fields');
// //       return;
// //     }
// //     toast.success('Leave request submitted successfully');
// //     setLeaveForm({ from: '', to: '', reason: '' });
// //     setLeaveOpen(false);
// //   };

// //   return (
// //     <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
// //       <div className="flex items-center justify-between">
// //         <h1 className="text-2xl font-bold">Profile</h1>
// //         <Button onClick={() => setLeaveOpen(true)} className="gap-2">
// //           <CalendarDays className="h-4 w-4" /> Request Leave
// //         </Button>
// //       </div>

// //       <Card className="border-none shadow-sm">
// //         <CardContent className="p-8">
// //           <div className="flex items-center gap-6">
// //             <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
// //               {user.name.charAt(0)}
// //             </div>
// //             <div>
// //               <h2 className="text-xl font-bold">{user.name}</h2>
// //               <Badge className="mt-1 capitalize">{user.role}</Badge>
// //             </div>
// //           </div>

// //           <div className="mt-8 space-y-4">
// //             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
// //               <User className="h-5 w-5 text-muted-foreground" />
// //               <div><p className="text-xs text-muted-foreground">Full Name</p><p className="text-sm font-medium">{user.name}</p></div>
// //             </div>
// //             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
// //               <Mail className="h-5 w-5 text-muted-foreground" />
// //               <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{user.email}</p></div>
// //             </div>
// //             <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
// //               <Shield className="h-5 w-5 text-muted-foreground" />
// //               <div><p className="text-xs text-muted-foreground">Role</p><p className="text-sm font-medium capitalize">{user.role}</p></div>
// //             </div>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
// //         <DialogContent>
// //           <DialogHeader>
// //             <DialogTitle>Request Leave</DialogTitle>
// //           </DialogHeader>
// //           <div className="space-y-4 py-2">
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="from">From Date</Label>
// //                 <Input id="from" type="date" value={leaveForm.from} onChange={e => setLeaveForm(p => ({ ...p, from: e.target.value }))} />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="to">To Date</Label>
// //                 <Input id="to" type="date" value={leaveForm.to} onChange={e => setLeaveForm(p => ({ ...p, to: e.target.value }))} />
// //               </div>
// //             </div>
// //             <div className="space-y-2">
// //               <Label htmlFor="reason">Reason</Label>
// //               <Textarea id="reason" placeholder="Enter reason for leave..." value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} />
// //             </div>
// //           </div>
// //           <DialogFooter>
// //             <Button variant="outline" onClick={() => setLeaveOpen(false)}>Cancel</Button>
// //             <Button onClick={handleLeaveSubmit}>Submit Request</Button>
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   );
// // }
