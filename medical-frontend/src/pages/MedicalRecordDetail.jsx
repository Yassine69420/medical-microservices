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
  UserCircle,
  Stethoscope,
  Info,
  CalendarPlus,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import AppointmentDialog from "../components/AppointmentDialog";

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
  const [appointmentOpen, setAppointmentOpen] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchPatientAndRecord();
    }
  }, [patientId]);

  const fetchPatientAndRecord = async () => {
    try {
      setLoading(true);
      const patientRes = await api.get(`/patients/${patientId}`);
      if (patientRes.data) {
        setPatient(patientRes.data);
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
        await api.put(`/records/${record.id}`, {
          ...record,
          patient: { id: patientId },
        });
      } else {
        const res = await api.post("/records", {
          ...record,
          patient: { id: patientId },
        });
        setRecord(res.data);
      }
      alert("Medical record updated successfully.");
    } catch (error) {
      console.error("Failed to save record", error);
      alert("Failed to save record. Check connection.");
    }
  };

  const handleAddIntervention = async () => {
    if (!record.id) {
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
      setNewIntervention({ type: "", doctorNotes: "" });
      fetchInterventions(record.id);
    } catch (error) {
      console.error("Failed to add intervention", error);
    }
  };

  const handleDeleteIntervention = async (id) => {
    if (!id) return;
    if (confirm("Delete this intervention permanentely?")) {
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
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest text-xs">
          Retrieving Patient Data
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-10 animate-in">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="h-12 w-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Active File
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    ID: {patientId?.substring(0, 8)}
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-none">
                  {patient?.firstName} {patient?.lastName}
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setAppointmentOpen(true)}
                variant="outline"
                className="h-12 px-6 rounded-xl font-bold gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <CalendarPlus className="h-5 w-5 text-primary" />
                Book Appointment
              </Button>
              <Button
                onClick={handleUpdateRecord}
                className="btn-primary h-12 px-8 rounded-xl font-bold gap-2"
              >
                <Save className="h-5 w-5" />
                Update Patient Record
              </Button>
            </div>
          </div>

          <AppointmentDialog
            open={appointmentOpen}
            onOpenChange={setAppointmentOpen}
            patientId={patientId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Quick Insights */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card border-none overflow-hidden">
                <div className="h-2 bg-primary w-full"></div>
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-primary" />
                    Patient Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Critical Allergies
                    </Label>
                    <Input
                      value={record.allergies}
                      onChange={(e) =>
                        setRecord({ ...record, allergies: e.target.value })
                      }
                      placeholder="No allergies reported"
                      className="input-field h-11 border-red-100/50 focus:ring-red-500/10 placeholder:text-slate-300 italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Current Treatments
                    </Label>
                    <textarea
                      value={record.treatments}
                      onChange={(e) =>
                        setRecord({ ...record, treatments: e.target.value })
                      }
                      placeholder="Specify ongoing medications..."
                      className="input-field w-full min-h-[100px] p-4 text-[15px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-none bg-slate-900 text-white overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Vital Sync
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-3xl font-extrabold">Active</p>
                    <p className="text-slate-500 text-sm font-medium">
                      Last update:{" "}
                      {record.updatedAt
                        ? new Date(record.updatedAt).toLocaleString()
                        : "First entry"}
                    </p>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        Records
                      </p>
                      <p className="text-xl font-bold">
                        {interventions.length}
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        Status
                      </p>
                      <p className="text-xl font-bold text-emerald-400">OK</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Diagnosis & Timeline */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card border-none">
                <CardHeader className="border-b border-slate-50">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Clinical Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">
                      Core Diagnosis
                    </Label>
                    <Input
                      value={record.diagnosis}
                      onChange={(e) =>
                        setRecord({ ...record, diagnosis: e.target.value })
                      }
                      placeholder="Enter primary clinical finding..."
                      className="input-field h-12 text-lg font-semibold text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 ml-1">
                      Clinical Observations & History
                    </Label>
                    <textarea
                      className="input-field w-full min-h-[160px] p-4 text-[15px] leading-relaxed"
                      value={record.notes}
                      onChange={(e) =>
                        setRecord({ ...record, notes: e.target.value })
                      }
                      placeholder="Enter detailed patient history, family history, and general clinical observations..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Interventions Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Medical Interventions
                  </h3>
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                      History
                    </span>
                  </div>
                </div>

                <div className="premium-card overflow-hidden">
                  <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                        Procedure Type
                      </Label>
                      <Input
                        placeholder="e.g. Consultation, Labwork"
                        value={newIntervention.type}
                        onChange={(e) =>
                          setNewIntervention({
                            ...newIntervention,
                            type: e.target.value,
                          })
                        }
                        className="input-field h-11 bg-white"
                      />
                    </div>
                    <div className="flex-[2] space-y-2">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                        Practitioner Notes
                      </Label>
                      <Input
                        placeholder="Observations during procedure..."
                        value={newIntervention.doctorNotes}
                        onChange={(e) =>
                          setNewIntervention({
                            ...newIntervention,
                            doctorNotes: e.target.value,
                          })
                        }
                        className="input-field h-11 bg-white"
                      />
                    </div>
                    <Button
                      onClick={handleAddIntervention}
                      className="sm:mt-auto h-11 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>

                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-[120px] font-bold text-slate-400 text-[11px] uppercase px-6">
                          Date
                        </TableHead>
                        <TableHead className="font-bold text-slate-400 text-[11px] uppercase">
                          Type
                        </TableHead>
                        <TableHead className="font-bold text-slate-400 text-[11px] uppercase">
                          Observation
                        </TableHead>
                        <TableHead className="text-right px-6"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interventions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-40 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                              <Info className="h-8 w-8" />
                              <p className="font-bold uppercase tracking-widest text-[10px]">
                                No History Recorded
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        interventions.map((iv) => (
                          <TableRow
                            key={iv.id}
                            className="group border-slate-100/60 transition-colors hover:bg-slate-50/50"
                          >
                            <TableCell className="px-6 py-5">
                              <span className="font-mono text-[13px] font-bold text-slate-500">
                                {iv.createdAt
                                  ? new Date(iv.createdAt).toLocaleDateString()
                                  : "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[11px] font-extrabold uppercase tracking-tight">
                                {iv.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-[14px] text-slate-600 font-medium">
                              {iv.doctorNotes}
                            </TableCell>
                            <TableCell className="text-right px-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
