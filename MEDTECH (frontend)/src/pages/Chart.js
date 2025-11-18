// Chart Data (already in your code)
const appointmentStatusData = {
  labels: Object.keys(appointmentsOverview.by_status),
  datasets: [
    {
      label: "Appointments",
      data: Object.values(appointmentsOverview.by_status),
      backgroundColor: ["#4caf50", "#ff9800", "#2196f3", "#f44336"],
      borderColor: '#ffffff', // subtle border for clarity
      borderWidth: 1,
      hoverOffset: 10,
    },
  ],
};

const appointmentTypeData = {
  labels: Object.keys(appointmentsOverview.by_type),
  datasets: [
    {
      label: "Appointment Type",
      data: Object.values(appointmentsOverview.by_type),
      backgroundColor: ["#3f51b5", "#e91e63"],
      borderColor: '#ffffff',
      borderWidth: 1,
      hoverOffset: 8,
    },
  ],
};

// Chart Options for Bar (Status)
const appointmentStatusOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#ffffff', // white legend text
        font: { size: 14, weight: '600' },
      },
    },
    title: {
      display: true,
      text: 'Appointments by Status',
      color: '#ffffff',
      font: { size: 18, weight: '700' },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#1e293b', // dark tooltip
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#4caf50',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: '#ffffff', font: { size: 12, weight: '500' } },
      grid: { color: 'rgba(255,255,255,0.15)' },
    },
    y: {
      ticks: { color: '#ffffff', font: { size: 12, weight: '500' } },
      grid: { color: 'rgba(255,255,255,0.15)' },
    },
  },
};

// Chart Options for Pie (Type)
const appointmentTypeOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#ffffff',
        font: { size: 14, weight: '600' },
      },
    },
    title: {
      display: true,
      text: 'Appointments by Type',
      color: '#ffffff',
      font: { size: 18, weight: '700' },
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#1e293b',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#3f51b5',
      borderWidth: 1,
    },
  },
};
