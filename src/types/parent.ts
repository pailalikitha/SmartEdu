export type ParentAlertSettings = {
  attendanceAlerts: boolean;
  marksUploadedAlerts: boolean;
  weeklySummaryEmails: boolean;
};

export const DEFAULT_PARENT_ALERT_SETTINGS: ParentAlertSettings = {
  attendanceAlerts: true,
  marksUploadedAlerts: true,
  weeklySummaryEmails: false,
};
