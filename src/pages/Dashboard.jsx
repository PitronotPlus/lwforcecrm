import { useState, useEffect } from "react";
import { Task } from "@/entities/Task";
import { Case } from "@/entities/Case";
import { Appointment } from "@/entities/Appointment";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import StatsCards from "../components/dashboard/StatsCards";
import AppointmentsSection from "../components/dashboard/AppointmentsSection";

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [cases, setCases] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, casesData, appointmentsData] = await Promise.all([
                Task.list(),
                Case.list(),
                Appointment.list('-date') // Get upcoming appointments first
            ]);
            setTasks(tasksData);
            setCases(casesData);
            setAppointments(appointmentsData);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
             <div className="min-h-screen p-8 flex justify-center items-center" style={{ background: '#F5F5F5' }}>
                <p>טוען נתונים...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8" style={{ background: '#F5F5F5' }}>
            <div className="max-w-[1315px] mx-auto">
                <WelcomeHeader onTaskCreated={loadData} />
                <StatsCards tasks={tasks} cases={cases} onTaskUpdate={loadData} />
                <AppointmentsSection appointments={appointments} />
            </div>
        </div>
    );
}