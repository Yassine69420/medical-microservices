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
  Calendar,
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
  };

  const onPatientSubmit = async () => {
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
      setIsOpen(false);
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
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-10 animate-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary font-black mb-1">
              <span className="badge-soft bg-primary/10">Dashboard</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-foreground mb-2">
              Patient Database
            </h2>
            <p className="text-muted-foreground font-bold text-sm">
              Manage patient records and medical files
            </p>
            <p className="text-muted-foreground font-bold text-sm">
              <span className="text-foreground font-black underline decoration-primary decoration-2 underline-offset-4">
                {patients.length} records
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/appointments")}
              variant="outline"
              className="h-11 px-6 rounded-full font-black border-black border-2 hover:bg-secondary hover:text-white transition-all text-sm shadow-sm"
            >
              Management Schedule
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="btn-primary gap-2 h-11 px-6 rounded-full shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-8 bg-card border-black border-2 shadow-2xl">
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-3xl font-black text-foreground tracking-tighter">
                    {isEditing ? "Edit Patient" : "Add Patient"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground font-bold text-sm">
                    {isEditing
                      ? "Update the patient's record information."
                      : "Register a new patient in the medical system."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Given Name
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
                      placeholder="Jane"
                      className="input-field h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Family Name
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
                      placeholder="Doe"
                      className="input-field h-12"
                    />
                  </div>
                  {!isEditing && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1"
                      >
                        Digital Address
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
                        placeholder="jane.doe@protocol.io"
                        className="input-field h-12"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter className="pt-6">
                  <Button
                    onClick={onPatientSubmit}
                    className="btn-primary h-12 px-8 w-full rounded-full"
                  >
                    {isEditing ? "Save Changes" : "Create Patient"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Upcoming Appointments Summary */}
        {upcomingAppointments.length > 0 && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="premium-card p-6 flex flex-col justify-between border-2 border-black bg-accent/5"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge-soft bg-accent/20 text-accent-foreground border-accent">
                      PENDING SESSION
                    </span>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                  </div>
                  <div className="text-3xl font-black text-foreground tracking-tighter">
                    {new Date(apt.dateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date(apt.dateTime).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="mb-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors" />
          <Input
            placeholder="Search Patients..."
            className="pl-14 h-14 bg-card border-black border-2 rounded-full shadow-sm focus:shadow-md focus:ring-0 text-foreground text-base placeholder:text-muted-foreground transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Patients Table Container */}
        <div className="bg-card border-black border-2 rounded-[2rem] overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-black border-b">
                <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest px-8 py-5">
                  Record ID
                </TableHead>
                <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest">
                  Full Name
                </TableHead>
                <TableHead className="text-right font-black text-muted-foreground px-8 uppercase tracking-widest text-[10px]">
                  Operations
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-64 text-center border-none"
                  >
                    <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                      <Users className="w-12 h-12 text-primary" />
                      <p className="text-foreground font-black uppercase tracking-[0.2em] text-[10px]">
                        No Patients Found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="group border-muted/50 transition-all hover:bg-muted/10 border-b last:border-none"
                  >
                    <TableCell className="px-8 py-6">
                      <span className="font-mono text-[11px] font-bold text-foreground bg-primary/10 border border-black px-2.5 py-1.5 rounded-lg">
                        #{patient.id?.substring(0, 8).toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary border-black border-2 flex items-center justify-center text-white font-black text-sm">
                          {patient.firstName?.charAt(0) || "?"}
                          {patient.lastName?.charAt(0) || "?"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-foreground text-lg tracking-tight">
                            {patient.firstName} {patient.lastName}
                          </span>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Patient File
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 font-black rounded-full border-black border-2 hover:bg-primary hover:text-white transition-all text-xs px-5"
                          onClick={() =>
                            navigate(`/patients/${patient.id}/record`)
                          }
                        >
                          OPEN FILE
                          <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-foreground hover:bg-muted/20 border-black border group-hover:bg-muted/10"
                          onClick={() => handleEdit(patient)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-destructive hover:bg-destructive hover:text-white border-destructive/20 border"
                          onClick={() => handleDelete(patient.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
