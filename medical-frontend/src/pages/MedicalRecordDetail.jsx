import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Calendar,
  ClipboardList,
  Activity,
} from "lucide-react";
import api from "../api/axios";

export default function MedicalRecordDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [record, setRecord] = useState({
    diagnosis: "",
    allergies: "",
    treatments: "",
    notes: "",
  });
  const [interventions, setInterventions] = useState([]);
  const [newIntervention, setNewIntervention] = useState({
    type: "",
    doctorNotes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchPatientAndRecord();
    }
  }, [patientId]);

  const fetchPatientAndRecord = async () => {
    try {
      setLoading(true);
      // Fetch patient details directly
      const patientRes = await api.get(`/patients/${patientId}`);
      if (patientRes.data) {
        setPatient(patientRes.data);
        // Fetch record
        await fetchRecord(patientId);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecord = async (pid) => {
    try {
      const response = await api.get(`/records/patient/${pid}`);
      if (response.data) {
        setRecord(response.data);
        if (response.data.id) {
          fetchInterventions(response.data.id);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No record found for patient, initial state remains.");
      } else {
        console.error("Failed to fetch record", error);
      }
    }
  };

  const fetchInterventions = async (recordId) => {
    try {
      const response = await api.get(`/interventions/record/${recordId}`);
      setInterventions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch interventions", error);
      setInterventions([]);
    }
  };

  const handleUpdateRecord = async () => {
    try {
      if (record.id) {
        // Update
        await api.put(`/records/${record.id}`, {
          ...record,
          patient: { id: patientId },
        });
      } else {
        // Create
        const res = await api.post("/records", {
          ...record,
          patient: { id: patientId },
        });
        setRecord(res.data);
      }
      alert("Medical record saved successfully.");
    } catch (error) {
      console.error("Failed to save record", error);
      alert(
        "Failed to save record. " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleAddIntervention = async () => {
    if (!record.id) {
      // Must save record first
      try {
        const res = await api.post("/records", {
          ...record,
          patient: { id: patientId },
          diagnosis: record.diagnosis || "Initial Evaluation",
        });
        setRecord(res.data);
        record.id = res.data.id;
      } catch (e) {
        alert("Please save the medical record first.");
        return;
      }
    }

    try {
      await api.post("/interventions", {
        ...newIntervention,
        medicalRecord: { id: record.id },
      });
      setNewIntervention({
        type: "",
        doctorNotes: "",
      });
      fetchInterventions(record.id);
    } catch (error) {
      console.error("Failed to add intervention", error);
      alert(
        "Failed to add intervention. " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDeleteIntervention = async (id) => {
    if (!id) return;
    if (confirm("Delete this intervention?")) {
      try {
        await api.delete(`/interventions/${id}`);
        fetchInterventions(record.id);
      } catch (error) {
        console.error("Failed to delete intervention", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {patient?.firstName} {patient?.lastName}
              </h1>
              <p className="text-muted-foreground">Patient Medical File</p>
            </div>
          </div>
          <Button onClick={handleUpdateRecord} className="shadow-md">
            <Save className="mr-2 h-4 w-4" /> Save Record
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: General Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="shadow-sm border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5 text-blue-500" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Allergies</Label>
                  <Input
                    value={record.allergies}
                    onChange={(e) =>
                      setRecord({ ...record, allergies: e.target.value })
                    }
                    placeholder="None"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Treatments</Label>
                  <Input
                    value={record.treatments}
                    onChange={(e) =>
                      setRecord({ ...record, treatments: e.target.value })
                    }
                    placeholder="Ongoing treatments..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-red-500">
                  <Activity className="mr-2 h-5 w-5" />
                  Latest Update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {record.updatedAt
                    ? new Date(record.updatedAt).toLocaleString()
                    : "Never"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Diagnosis & Interventions */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm border-none">
              <CardHeader>
                <CardTitle>Diagnosis & Notes</CardTitle>
                <CardDescription>Main clinical observations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Diagnosis</Label>
                  <Input
                    value={record.diagnosis}
                    onChange={(e) =>
                      setRecord({ ...record, diagnosis: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={record.notes}
                    onChange={(e) =>
                      setRecord({ ...record, notes: e.target.value })
                    }
                    placeholder="Enter patient history or general observations..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-none overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Interventions History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 bg-blue-50/50 border-b space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Procedure Type</Label>
                      <Input
                        placeholder="e.g. Surgery, X-Ray"
                        value={newIntervention.type}
                        onChange={(e) =>
                          setNewIntervention({
                            ...newIntervention,
                            type: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex-[2] space-y-1">
                      <Label className="text-xs">Clinical Notes</Label>
                      <Input
                        placeholder="Operation details, results..."
                        value={newIntervention.doctorNotes}
                        onChange={(e) =>
                          setNewIntervention({
                            ...newIntervention,
                            doctorNotes: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button className="mt-auto" onClick={handleAddIntervention}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Observation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interventions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No history found for this patient.
                        </TableCell>
                      </TableRow>
                    ) : (
                      interventions.map((iv) => (
                        <TableRow key={iv.id}>
                          <TableCell className="text-xs font-medium">
                            {iv.createdAt
                              ? new Date(iv.createdAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {iv.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm italic text-gray-600">
                            {iv.doctorNotes}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteIntervention(iv.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
