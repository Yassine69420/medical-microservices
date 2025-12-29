import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Search,
  LayoutDashboard,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    if (user?.id) {
      try {
        const res = await api.get(`/rendezvous/doctor/${user.id}/upcoming`);
        setUpcomingAppointments(res.data);
      } catch (error) {
        console.error("Failed to fetch upcoming appts", error);
      }
    }
  };

  useEffect(() => {
    fetchPatients();
    if (user) fetchUpcomingAppointments();
  }, [user]);

  const resetForm = () => {
    setNewPatient({ firstName: "", lastName: "", email: "" });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(false);
  };

  const handleSavePatient = async () => {
    try {
      if (isEditing) {
        await api.put(`/patients/${currentId}`, {
          firstName: newPatient.firstName,
          lastName: newPatient.lastName,
        });
      } else {
        const authResponse = await api.post("/auth/register", {
          email: newPatient.email,
          passwordHash: "",
          role: "PATIENT",
        });

        const userId = authResponse.data.id;
        await api.post("/patients", {
          firstName: newPatient.firstName,
          lastName: newPatient.lastName,
          userId: userId,
        });
      }

      resetForm();
      fetchPatients();
    } catch (error) {
      console.error("Failed to save patient", error);
      alert("Error processing request. See console.");
    }
  };

  const handleEdit = (patient) => {
    setNewPatient({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || "",
    });
    setCurrentId(patient.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Permanently delete this patient profile?")) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error("Failed to delete patient", error);
      }
    }
  };

  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-10 animate-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-1">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">
                Administration
              </span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Patient Registry
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Total Patients:{" "}
              <span className="text-primary">{patients.length}</span> recorded
              in system
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/appointments")}
              variant="outline"
              className="btn-primary gap-2 h-12 px-6 rounded-xl font-bold bg-white text-primary border-slate-200 hover:bg-slate-50 shadow-sm"
            >
              Manage Schedule
            </Button>
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) resetForm();
                setIsOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="btn-primary gap-2 h-12 px-6 rounded-xl font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Add New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] rounded-3xl p-8">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-2xl font-bold">
                    {isEditing ? "Modify Patient" : "Enroll New Patient"}
                  </DialogTitle>
                  <DialogDescription className="text-[15px]">
                    {isEditing
                      ? "Update the patient's identity information below."
                      : "Fill in the details to create a new patient account and profile."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="firstName"
                      className="font-bold text-slate-700 ml-1"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={newPatient.firstName}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="Enter first name"
                      className="input-field h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="lastName"
                      className="font-bold text-slate-700 ml-1"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={newPatient.lastName}
                      onChange={(e) =>
                        setNewPatient({
                          ...newPatient,
                          lastName: e.target.value,
                        })
                      }
                      placeholder="Enter last name"
                      className="input-field h-11"
                    />
                  </div>
                  {!isEditing && (
                    <div className="grid gap-2">
                      <Label
                        htmlFor="email"
                        className="font-bold text-slate-700 ml-1"
                      >
                        Email (Account ID)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPatient.email}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            email: e.target.value,
                          })
                        }
                        placeholder="patient@email.com"
                        className="input-field h-11"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="pt-6">
                  <Button
                    onClick={handleSavePatient}
                    className="btn-primary h-12 px-8 font-bold w-full sm:w-auto"
                  >
                    {isEditing ? "Save Changes" : "Confirm Enrollment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Upcoming Appointments Summary */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="premium-card p-5 flex flex-col justify-between border-l-4 border-l-primary/60"
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Next Appointment
                  </span>
                  <div className="text-lg font-bold text-slate-800 mt-1">
                    {new Date(apt.dateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    {new Date(apt.dateTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="mb-8 flex flex-col sm:row items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by patient name..."
              className="pl-12 h-14 bg-white border-slate-200/60 rounded-2xl shadow-sm focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Patients Table Container */}
        <div className="premium-card overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[140px] font-bold text-slate-500 px-6 py-5">
                  REFERENCE
                </TableHead>
                <TableHead className="font-bold text-slate-500">
                  PATIENT NAME
                </TableHead>
                <TableHead className="text-right font-bold text-slate-500 px-6">
                  MANAGEMENT
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 rounded-full bg-slate-50">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-medium italic">
                        No matches found for your search.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="group border-slate-100/60 transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell className="px-6 py-5">
                      <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        ID-{patient.id?.substring(0, 6)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </div>
                        <span className="font-bold text-slate-700 text-[15px]">
                          {patient.firstName} {patient.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 font-bold bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all px-4"
                          onClick={() =>
                            navigate(`/patients/${patient.id}/record`)
                          }
                        >
                          View Records
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                          onClick={() => handleEdit(patient)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => handleDelete(patient.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
