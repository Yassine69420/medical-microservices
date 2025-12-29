import { useState } from "react";
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
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AppointmentDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}) {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time) {
      setError("Please select both date and time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Construct LocalDateTime string: YYYY-MM-DDTHH:MM
      const dateTime = `${date}T${time}`;

      // If user is doctor, use their ID. If not, we might need a doctor selection (skipping for now, assuming current user is doctor)
      const doctorId = user?.id;

      await api.post("/rendezvous", {
        dateTime: dateTime,
        patientId: patientId,
        doctorId: doctorId, // Assuming the logged-in user is creating the appointment as the doctor
        status: "PLANNED",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
      alert("Appointment scheduled successfully!");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError(
          "This time slot is already booked. Please choose another time."
        );
      } else {
        setError(
          "Failed to schedule appointment. " +
            (err.response?.data?.message || err.message)
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] bg-card border-black border-2 p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-foreground tracking-tighter">
            New Appointment
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-bold text-sm">
            Schedule a new visit for this patient.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          {error && (
            <div className="bg-destructive/10 border-2 border-black p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-destructive animate-in slide-in-from-top-2">
              Error: {error}
            </div>
          )}
          <div className="space-y-2">
            <Label
              htmlFor="date"
              className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1"
            >
              Session Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field h-12"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="time"
              className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1"
            >
              Select Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input-field h-12"
            />
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full h-12 rounded-full shadow-sm text-xs"
          >
            {loading ? "Transmitting..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
