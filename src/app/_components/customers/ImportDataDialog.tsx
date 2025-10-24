"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, CheckCircle, XCircle } from "lucide-react";
import { importCsvData } from "@/app/_actions/import";

interface ImportStats {
  customersCreated: number;
  customersUpdated: number;
  vehiclesCreated: number;
  serviceHistoryCreated: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export function ImportDataDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    stats?: ImportStats;
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const csvContent = await file.text();
      const result = await importCsvData(csvContent);
      setImportResult(result);

      if (result.success) {
        // Refresh the page to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: "Failed to read file",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = () => {
    const link = document.createElement("a");
    link.href = "/sample-import.csv";
    link.download = "sample-import.csv";
    link.click();
  };

  const resetDialog = () => {
    setFile(null);
    setImportResult(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Customer Data</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Need a template?</p>
              <p className="text-xs text-muted-foreground">
                Download a sample CSV file with example data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              type="button"
            >
              <Download className="mr-2 h-4 w-4" />
              Sample CSV
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label
              htmlFor="csv-file"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select CSV File
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {importResult && (
            <div
              className={`p-4 rounded-lg border ${
                importResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p
                    className={`text-sm font-medium ${
                      importResult.success ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {importResult.success
                      ? "Import Successful!"
                      : "Import Failed"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CSV Format Instructions */}
          <div className="text-xs text-muted-foreground space-y-2 border-t pt-4">
            <p className="font-medium text-foreground">CSV Format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Required: customer_email</li>
              <li>
                Optional: customer_first_name, customer_last_name,
                customer_phone
              </li>
              <li>
                Vehicle: vehicle_vin, vehicle_plate, vehicle_make,
                vehicle_model, vehicle_year
              </li>
              <li>
                Service: service_type (OIL_CHANGE, BRAKE_INSPECTION,
                TIRE_ROTATION, ROUTINE_MAINTENANCE, BATTERY_CHECK, OTHER),
                service_performed_at (YYYY-MM-DD), service_notes
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetDialog} disabled={importing}>
            {importResult?.success ? "Close" : "Cancel"}
          </Button>
          {!importResult?.success && (
            <Button onClick={handleImport} disabled={!file || importing}>
              {importing ? "Importing..." : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
