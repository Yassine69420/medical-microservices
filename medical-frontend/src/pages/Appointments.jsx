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
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-10 animate-in">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <div className="space-y-2">
              <span className="badge-soft bg-primary/10 text-primary border-primary">
                Schedule
              </span>
              <h1 className="text-4xl font-black text-foreground tracking-tighter">
                Appointments
              </h1>
              <p className="text-muted-foreground font-bold text-sm">
                Live monitoring of upcoming clinical encounters
              </p>
            </div>
          </div>

          <Card className="bg-card border-black border-2 rounded-[2rem] overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/10 border-b border-black py-6">
              <CardTitle className="flex items-center gap-3 text-foreground text-xl font-black tracking-tighter">
                <CalendarDays className="h-5 w-5 text-primary" />
                Scheduled Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-black border-b hover:bg-transparent">
                    <TableHead className="px-8 py-5 font-black text-muted-foreground text-[10px] uppercase tracking-widest text-center">
                      Time Slot
                    </TableHead>
                    <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                      Patient
                    </TableHead>
                    <TableHead className="font-black text-muted-foreground text-[10px] uppercase tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-black text-muted-foreground text-[10px] uppercase tracking-widest px-8">
                      Operations
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-48 text-center border-none"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 opacity-40">
                          <Calendar className="h-10 w-10 text-primary" />
                          <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                            No Appointments
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appt) => (
                      <TableRow
                        key={appt.id}
                        className="border-muted/50 hover:bg-muted/10 transition-colors border-b last:border-none"
                      >
                        <TableCell className="px-8 py-6">
                          <div className="flex items-center gap-3 text-foreground">
                            <div className="flex items-center gap-2 font-black text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              {new Date(appt.dateTime).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "2-digit",
                                }
                              )}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
                            <div className="flex items-center gap-2 font-black text-sm text-foreground">
                              <Clock className="h-4 w-4 text-primary" />
                              {new Date(appt.dateTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] font-black text-foreground bg-secondary/10 border border-black px-2.5 py-1.5 rounded-lg shadow-sm">
                              ID-{appt.patientId?.substring(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`badge-soft transition-all ${
                              appt.status === "PLANNED"
                                ? "bg-secondary text-secondary-foreground border-black"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {appt.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right px-8">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(appt.id)}
                            className="h-9 px-4 text-foreground hover:bg-destructive hover:text-white transition-all font-black rounded-full border-black border-2 text-xs"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ABORT
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
