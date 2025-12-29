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

  const handleSave = async () => {
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
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-10 animate-in">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="h-12 w-12 rounded-full border-black border-2 hover:bg-secondary hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-soft bg-primary/10 text-primary border-primary">
                    Patient File
                  </span>
                  <span className="badge-soft bg-card text-muted-foreground border-muted">
                    ID: {patientId?.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">
                  {patient?.firstName} {patient?.lastName}
                </h1>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setAppointmentOpen(true)}
                variant="outline"
                className="h-11 px-6 rounded-full font-black border-black border-2 hover:bg-accent transition-all text-xs shadow-sm bg-card"
              >
                <CalendarPlus className="h-4 w-4 mr-2 text-primary" />
                Book Appointment
              </Button>
              <Button
                onClick={handleSave}
                className="btn-primary h-11 px-8 rounded-full shadow-sm text-xs"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <AppointmentDialog
            open={appointmentOpen}
            onOpenChange={setAppointmentOpen}
            patientId={patientId}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Profile Insight */}
            <div className="lg:col-span-4 space-y-8">
              <Card className="premium-card border-black border-2 bg-card relative overflow-hidden">
                <div className="h-2 bg-primary w-full border-b border-black"></div>
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground tracking-tighter">
                    <UserCircle className="h-5 w-5 text-primary" />
                    Patient Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                      Critical Allergies
                    </Label>
                    <Input
                      value={record.allergies}
                      onChange={(e) =>
                        setRecord({ ...record, allergies: e.target.value })
                      }
                      placeholder="None declared"
                      className="input-field h-12 border-destructive/30 focus:border-destructive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                      Active Treatments
                    </Label>
                    <textarea
                      value={record.treatments}
                      onChange={(e) =>
                        setRecord({ ...record, treatments: e.target.value })
                      }
                      placeholder="Specify therapeutic regimens..."
                      className="input-field w-full min-h-[140px] p-4 text-sm font-bold leading-relaxed"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-black border-2 bg-secondary/5 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                    <Activity className="h-4 w-4" />
                    Record Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-foreground tracking-tighter uppercase">
                      File Status
                    </p>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.15em]">
                      Last updated:{" "}
                      <span className="text-foreground">
                        {record.updatedAt
                          ? new Date(record.updatedAt).toLocaleDateString()
                          : "New Record"}
                      </span>
                    </p>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="p-4 bg-card rounded-2xl border-2 border-black">
                      <p className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">
                        Entries
                      </p>
                      <p className="text-2xl font-black text-foreground mt-1">
                        {interventions.length}
                      </p>
                    </div>
                    <div className="p-4 bg-card rounded-2xl border-2 border-black">
                      <p className="font-black text-muted-foreground uppercase tracking-widest text-[9px]">
                        Status
                      </p>
                      <p className="text-2xl font-black text-secondary mt-1">
                        VALID
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Diagnosis & History */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="premium-card border-black border-2 bg-card">
                <CardHeader className="border-b border-black">
                  <CardTitle className="text-xl font-black flex items-center gap-2 text-foreground tracking-tighter">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Clinical Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                      Current Evaluation
                    </Label>
                    <Input
                      value={record.diagnosis}
                      onChange={(e) =>
                        setRecord({ ...record, diagnosis: e.target.value })
                      }
                      placeholder="Establishing baseline..."
                      className="input-field h-14 text-xl font-black text-foreground placeholder:text-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                      Consultation Notes
                    </p>
                    <textarea
                      className="input-field w-full min-h-[220px] p-5 text-sm font-bold leading-relaxed"
                      value={record.notes}
                      onChange={(e) =>
                        setRecord({ ...record, notes: e.target.value })
                      }
                      placeholder="Document primary medical narrative and investigative findings..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Container */}
              <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black text-foreground flex items-center gap-3 tracking-tighter uppercase">
                    Clinical History
                  </h3>
                  <div className="h-0.5 flex-1 bg-black/5 mx-6"></div>
                  <span className="badge-soft bg-card text-muted-foreground border-black/10">
                    Archive
                  </span>
                </div>

                <div className="bg-card border-black border-2 rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="p-8 bg-muted/20 border-b border-black flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <Label className="font-black text-[9px] text-muted-foreground uppercase tracking-widest ml-1">
                        Intervention Type
                      </Label>
                      <Input
                        placeholder="e.g. Lab Analysis"
                        value={newIntervention.type}
                        onChange={(e) =>
                          setNewIntervention({
                            ...newIntervention,
                            type: e.target.value,
                          })
                        }
                        className="input-field h-11 text-xs font-bold"
                      />
                    </div>
                    <div className="flex-[2] space-y-2">
                      <Label className="font-black text-[9px] text-muted-foreground uppercase tracking-widest ml-1">
                        Notes
                      </Label>
                      <Input
                        placeholder="Key findings..."
                        value={newIntervention.doctorNotes}
                        onChange={(e) =>
                          setNewIntervention({
                            ...newIntervention,
                            doctorNotes: e.target.value,
                          })
                        }
                        className="input-field h-11 text-xs font-bold"
                      />
                    </div>
                    <Button
                      onClick={handleAddIntervention}
                      className="lg:mt-auto h-11 px-8 rounded-full btn-primary text-xs"
                    >
                      ADD STEP
                    </Button>
                  </div>

                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-black border-b">
                        <TableHead className="w-[150px] font-black text-muted-foreground text-[9px] uppercase tracking-widest px-8 py-5">
                          Timeline
                        </TableHead>
                        <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest">
                          Procedure
                        </TableHead>
                        <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest">
                          Medical Data
                        </TableHead>
                        <TableHead className="text-right px-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interventions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="h-32 text-center border-none"
                          >
                            <div className="flex flex-col items-center justify-center opacity-30">
                              <p className="font-black uppercase tracking-[0.2em] text-[9px]">
                                Zero History Records
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        interventions.map((iv) => (
                          <TableRow
                            key={iv.id}
                            className="group border-muted/50 transition-all hover:bg-muted/10 border-b last:border-none"
                          >
                            <TableCell className="px-8 py-5">
                              <span className="font-mono text-[11px] font-black text-foreground">
                                {iv.createdAt
                                  ? new Date(iv.createdAt).toLocaleDateString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "2-digit",
                                      }
                                    )
                                  : "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="badge-soft bg-primary/10 text-primary border-primary">
                                {iv.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm font-bold text-foreground">
                              {iv.doctorNotes}
                            </TableCell>
                            <TableCell className="text-right px-8">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive hover:text-white rounded-full transition-all border border-transparent hover:border-black"
                                onClick={() => handleDeleteIntervention(iv.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
