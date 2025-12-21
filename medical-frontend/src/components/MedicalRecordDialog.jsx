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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Medical Record: {patient?.firstName} {patient?.lastName}
          </DialogTitle>
          <DialogDescription>
            Manage health information and medical interventions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/30">
            <div className="col-span-2 space-y-2">
              <Label>Diagnosis</Label>
              <Input
                value={record.diagnosis}
                onChange={(e) =>
                  setRecord({ ...record, diagnosis: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Input
                value={record.allergies}
                onChange={(e) =>
                  setRecord({ ...record, allergies: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Treatments</Label>
              <Input
                value={record.treatments}
                onChange={(e) =>
                  setRecord({ ...record, treatments: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Notes</Label>
              <Input
                value={record.notes}
                onChange={(e) =>
                  setRecord({ ...record, notes: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 flex justify-end text-xs text-muted-foreground">
              Last Updated:{" "}
              {record.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "Never"}
            </div>
            <div className="col-span-2 flex justify-end">
              <Button onClick={handleUpdateRecord} size="sm">
                Save Changes
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Interventions</h3>
            <div className="grid grid-cols-3 gap-2 items-end border p-4 rounded-lg bg-muted/10">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Input
                  placeholder="Surgery, Checkup..."
                  value={newIntervention.type}
                  onChange={(e) =>
                    setNewIntervention({
                      ...newIntervention,
                      type: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-1 space-y-1">
                <Label className="text-xs">Doctor Notes</Label>
                <Input
                  placeholder="Details..."
                  value={newIntervention.doctorNotes}
                  onChange={(e) =>
                    setNewIntervention({
                      ...newIntervention,
                      doctorNotes: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleAddIntervention}>Add Intervention</Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No interventions recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    interventions.map((iv) => (
                      <TableRow key={iv.id}>
                        <TableCell className="text-xs">
                          {iv.createdAt
                            ? new Date(iv.createdAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{iv.type}</TableCell>
                        <TableCell className="text-xs italic">
                          {iv.doctorNotes}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteIntervention(iv.id)}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
