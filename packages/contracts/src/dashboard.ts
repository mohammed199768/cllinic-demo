export interface DashboardSummary {
  counts: {
    todayBookings: number;
    newBookings: number;
    arrivedBookings: number;
    openVisits: number;
    completedVisitsToday: number;
    activePatients: number;
  };
  recentBookings: Array<{
    id: string;
    publicReference: string;
    fullName: string;
    phone: string;
    requestedService: string;
    requestedDate: string;
    requestedTime: string | null;
    status: string;
  }>;
  recentVisits: Array<{
    id: string;
    visitNumber: string;
    patientName: string;
    visitDate: string;
    status: string;
  }>;
  serviceDistribution: Array<{ service: string; count: number }>;
  bookingFlow: Array<{ status: string; count: number }>;
  upcomingFollowUps: Array<{ visitId: string; patientId: string; patientName: string; visitNumber: string; followUpAt: string }>;
}
