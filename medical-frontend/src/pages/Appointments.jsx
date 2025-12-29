import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Clock, User, Trash2, CalendarDays } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      // ideally route: /rendezvous/doctor/{id}
      // for now getting all and filtering or assuming backend handles it
      const res = await api.get("/rendezvous");
      // Simple client-side filter if needed, or if backend returns all
      // For the sake of the demo, we assume the list is correct
      setAppointments(res.data);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Cancel this appointment?")) {
      try {
        await api.delete(`/rendezvous/${id}`);
        fetchAppointments();
      } catch (e) {
        console.error("Failed to cancel", e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-10 animate-in">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Appointments
            </h1>
            <p className="text-slate-500 font-medium">Manage your schedule</p>
          </div>

          <Card className="premium-card border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                All Scheduled Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold">Date & Time</TableHead>
                    <TableHead className="font-bold">
                      Patient Reference
                    </TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-32 text-center text-slate-500 font-medium"
                      >
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appt) => (
                      <TableRow key={appt.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium text-slate-700">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(appt.dateTime).toLocaleDateString()}
                            <div className="w-1 h-1 bg-slate-300 rounded-full mx-2"></div>
                            <Clock className="h-4 w-4 text-slate-400" />
                            {new Date(appt.dateTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                              {appt.patientId?.substring(0, 8)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              appt.status === "PLANNED"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(appt.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-2">Cancel</span>
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
      </main>
    </div>
  );
}
