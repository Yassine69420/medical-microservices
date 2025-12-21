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
import api from "../api/axios";
import MedicalRecordDialog from "../components/MedicalRecordDialog";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedPatientForRecord, setSelectedPatientForRecord] =
    useState(null);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const resetForm = () => {
    setNewPatient({ firstName: "", lastName: "", email: "" });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(false);
  };

  const handleSavePatient = async () => {
    try {
      if (isEditing) {
        // Update existing patient
        await api.put(`/patients/${currentId}`, {
          firstName: newPatient.firstName,
          lastName: newPatient.lastName,
        });
        alert("Patient updated successfully.");
      } else {
        // Create new patient (and user)
        // 1. Create User in Auth Service
        const authResponse = await api.post("/auth/register", {
          email: newPatient.email,
          passwordHash: "", // Will trigger default password in backend
          role: "PATIENT",
        });

        const userId = authResponse.data.id;
        alert("User account created! Linking patient profile...");

        // 2. Create Patient Record linked to user
        await api.post("/patients", {
          firstName: newPatient.firstName,
          lastName: newPatient.lastName,
          userId: userId,
        });

        alert("Patient profile created and linked successfully!");
      }

      resetForm();
      fetchPatients();
    } catch (error) {
      console.error("Failed to save patient", error);
      alert("Failed to save patient. Check console for details.");
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
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error("Failed to delete patient", error);
        alert("Failed to delete patient");
      }
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 items-center border-b px-6 bg-card">
        <h1 className="text-xl font-bold text-primary">Medical App</h1>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm font-medium">Welcome, {user?.email}</span>
          <Button onClick={handleLogout} variant="destructive" size="sm">
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-8 container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Patient Management
          </h2>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) resetForm();
              setIsOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>Add Patient</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Patient" : "Add New Patient"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update details."
                    : "Create a new patient account. Credentials will be generated."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
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
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, lastName: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                {!isEditing && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, email: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleSavePatient}>
                  {isEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID (Short)</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium text-xs">
                      {patient.id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          navigate(`/patients/${patient.id}/record`)
                        }
                      >
                        Manage Record
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(patient)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(patient.id)}
                      >
                        Delete
                      </Button>
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
