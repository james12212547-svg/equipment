// Notification utility for appointment reminders

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const permission = await Notification.requestPermission();
  return permission;
};

export const showNotification = (title, body, icon = '/icon.svg') => {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon });
};

// Schedule notifications for a list of appointments
export const scheduleAppointmentReminders = (schedules) => {
  if (Notification.permission !== 'granted') return;

  // Clear previous timers stored in window
  if (window._notifTimers) {
    window._notifTimers.forEach(t => clearTimeout(t));
  }
  window._notifTimers = [];

  const now = Date.now();

  schedules.forEach(schedule => {
    if (schedule.status !== 'pending') return;

    // Parse date + time
    const dateStr = schedule.date;
    const timeStr = schedule.timeStart || '08:00';
    const [hh, mm] = timeStr.split(':').map(Number);

    let appointmentDate;
    // Try parsing various date formats
    const parsed = new Date(dateStr);
    if (!isNaN(parsed)) {
      appointmentDate = new Date(parsed);
    } else {
      // Fallback: try dd/mm/yyyy or dd-mm-yyyy
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        appointmentDate = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
      }
    }

    if (!appointmentDate || isNaN(appointmentDate)) return;

    appointmentDate.setHours(hh, mm, 0, 0);
    const appointmentMs = appointmentDate.getTime();

    const reminderTimes = [
      { offset: 24 * 60 * 60 * 1000, label: '1 วัน' },
      { offset: 60 * 60 * 1000, label: '1 ชั่วโมง' },
    ];

    reminderTimes.forEach(({ offset, label }) => {
      const triggerMs = appointmentMs - offset;
      const delay = triggerMs - now;
      if (delay > 0) {
        const timer = setTimeout(() => {
          showNotification(
            `⏰ แจ้งเตือนนัดหมาย (อีก ${label})`,
            `${schedule.customerName} — ${schedule.equipmentType} เวลา ${schedule.timeStart} น.`
          );
        }, delay);
        window._notifTimers.push(timer);
      }
    });
  });
};
