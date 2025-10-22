import { ServiceType } from "@/server/db";

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.ROUTINE_MAINTENANCE]: "Routine Maintenance",
  [ServiceType.OIL_CHANGE]: "Oil Change",
  [ServiceType.BRAKE_INSPECTION]: "Brake Inspection",
  [ServiceType.TIRE_ROTATION]: "Tire Rotation",
  [ServiceType.BATTERY_CHECK]: "Battery Check",
  [ServiceType.OTHER]: "Other",
};

export const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Phoenix",
  "Pacific/Honolulu",
];
