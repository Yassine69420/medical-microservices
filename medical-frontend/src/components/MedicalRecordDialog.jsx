import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Trash2 } from "lucide-react";
import api from "../api/axios";

export default function MedicalRecordDialog({ patient, open, onOpenChange }) {
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

  useEffect(() => {
    if (open && patient) {
      fetchRecord();
    }
  }, [open, patient]);

  const fetchRecord = async () => {
    try {
      const response = await api.get(`/records/patient/${patient.id}`);
      if (response.data) {
        setRecord(response.data);
        if (response.data.id) {
          fetchInterventions(response.data.id);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No record found for patient, creating initial record...");
        try {
          const newRecord = await api.post("/records", {
            patient: { id: patient.id },
            diagnosis: "Initial Patient Evaluation",
            allergies: "None reported",
            treatments: "N/A",
            notes: "",
          });
          setRecord(newRecord.data);
          setInterventions([]);
        } catch (postError) {
          console.error("Failed to create initial record", postError);
        }
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
    if (!record.id) {
      alert(
        "No medical record ID found. Please refresh or create a record first."
      );
      return;
    }
    try {
      await api.put(`/records/${record.id}`, {
        ...record,
        patient: { id: patient.id },
      });
      alert("Medical record updated.");
    } catch (error) {
      console.error("Failed to update record", error);
      alert(
        "Failed to update record. " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleAddIntervention = async () => {
    if (!record.id) {
      alert("Cannot add intervention without a medical record ID.");
      return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-8 bg-card border-black border-2 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-black mb-6">
          <DialogTitle className="text-3xl font-black text-foreground tracking-tighter">
            Patient Record: {patient?.firstName} {patient?.lastName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-bold text-sm">
            View clinical history and manage record details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6 bg-muted/10 p-6 rounded-[1.5rem] border-black border-2">
            <div className="col-span-2 space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                Current Evaluation
              </Label>
              <Input
                value={record.diagnosis}
                onChange={(e) =>
                  setRecord({ ...record, diagnosis: e.target.value })
                }
                className="input-field h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                Allergies
              </Label>
              <Input
                value={record.allergies}
                onChange={(e) =>
                  setRecord({ ...record, allergies: e.target.value })
                }
                className="input-field h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                Active Treatments
              </Label>
              <Input
                value={record.treatments}
                onChange={(e) =>
                  setRecord({ ...record, treatments: e.target.value })
                }
                className="input-field h-12"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground ml-1">
                Practitioner Notes
              </Label>
              <textarea
                value={record.notes}
                onChange={(e) =>
                  setRecord({ ...record, notes: e.target.value })
                }
                className="input-field w-full min-h-[100px] p-4 text-sm font-bold"
              />
            </div>
            <div className="col-span-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Last Sync:{" "}
                {record.updatedAt
                  ? new Date(record.updatedAt).toLocaleDateString()
                  : "New"}
              </span>
              <Button
                onClick={handleUpdateRecord}
                className="btn-primary h-11 px-8 rounded-full text-xs"
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">
              History
            </h3>
            <div className="flex flex-col lg:flex-row gap-4 bg-muted/20 p-6 rounded-[1.5rem] border-black border-2">
              <div className="flex-1 space-y-1">
                <Label className="font-black text-[9px] text-muted-foreground uppercase tracking-widest ml-1">
                  Intervention Type
                </Label>
                <Input
                  placeholder="e.g. Analysis"
                  value={newIntervention.type}
                  onChange={(e) =>
                    setNewIntervention({
                      ...newIntervention,
                      type: e.target.value,
                    })
                  }
                  className="input-field h-11 text-xs"
                />
              </div>
              <div className="flex-[2] space-y-1">
                <Label className="font-black text-[9px] text-muted-foreground uppercase tracking-widest ml-1">
                  Observations
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
                  className="input-field h-11 text-xs"
                />
              </div>
              <Button
                onClick={handleAddIntervention}
                className="lg:mt-auto btn-primary h-11 px-6 rounded-full text-xs"
              >
                ADD ENTRY
              </Button>
            </div>

            <div className="bg-card border-black border-2 rounded-[2rem] overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-black border-b">
                    <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest px-6 py-4">
                      Timeline
                    </TableHead>
                    <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest">
                      Type
                    </TableHead>
                    <TableHead className="font-black text-muted-foreground text-[9px] uppercase tracking-widest">
                      Notes
                    </TableHead>
                    <TableHead className="text-right px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 opacity-30 text-[9px] font-black uppercase tracking-widest"
                      >
                        History Empty
                      </TableCell>
                    </TableRow>
                  ) : (
                    interventions.map((iv) => (
                      <TableRow
                        key={iv.id}
                        className="border-muted/50 border-b last:border-none"
                      >
                        <TableCell className="px-6 py-4 font-mono text-[10px] font-black">
                          {iv.createdAt
                            ? new Date(iv.createdAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <span className="badge-soft bg-primary/10 text-primary border-primary">
                            {iv.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-foreground">
                          {iv.doctorNotes}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteIntervention(iv.id)}
                            className="h-8 w-8 rounded-full border-black border-2 text-foreground hover:bg-destructive hover:text-white p-0"
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
      </DialogContent>
    </Dialog>
  );
}
