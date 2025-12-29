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
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Schedule Appointment
          </DialogTitle>
          <DialogDescription>
            Book a new consultation for this patient.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="date"
              className="text-right font-semibold text-slate-700"
            >
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3 input-field"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="time"
              className="text-right font-semibold text-slate-700"
            >
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="col-span-3 input-field"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full sm:w-auto font-bold"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
