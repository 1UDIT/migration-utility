export type RunningInstance = {
  instanceName: string;
  ip: string | null;
  driveNB: string | null;
  tlID: string | null;

  lastupdatedDate: string; // ISO string from backend

  startedDumpingObjectName: string | null;
  startedDumpingObjectSize: number | null;

  previousObjectThroughput: string | null;

  currentTape: string | null;
  startTimeCurrentTape: string | null;
  startTimeCurrentTapeMS: number | null;
  sizeTransferCurrentTape: number | null;
  durationCurrentTapeMS: number | null;
  currentTapeThroughput: number | null; // DECIMAL(10,2)

  previousTape: string | null;
  startTimePreviousTape: string | null;
  startTimePreviousTapeMS: number | null;
  durationPreviousTapeMS: number | null;
  sizeTransferPreviousTape: number | null;
  previousTapeThroughput: number | null; // DECIMAL(10,2)
  totalFiles:number;

  driveRemainingSize: number | null; // New field for drive remaining size
  driveTotalSize: string | null; // New field for total space
  driveLetter: string | null; // New field for drive letter
  storageStatus: "Healthy" | "Warning" | "Critical" | "Unknown"; // New field for storage status (e.g., "Healthy", "Warning", "Critical")
  driveFreePercent: number | null; // New field for free space percentage
  driveUsedPercent: number | null; // New field for used space percentage
  driveUsedSize: number | null; // New field for used space in bytes
};