import { Worker } from "worker_threads";
import path from "path";

export const simulateEmailSending = (runId: string): void => {
  const workerPath = path.join(
    process.cwd(),
    "src/server/workers/email-worker.ts",
  );
  const worker = new Worker(workerPath, {
    workerData: { runId },
    execArgv: ["--require", "tsx/cjs"],
  });

  worker.on("message", (message) => {
    if (message.success) {
      console.log(
        "\x1b[32m%s\x1b[0m",
        "[Main] Worker completed successfully:",
        message.result,
      );
    } else {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "[Main] Worker failed:",
        message.error,
      );
    }
  });

  worker.on("error", (error) => {
    console.error("\x1b[31m%s\x1b[0m", "[Main] Worker error:", error);
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "[Main] Worker stopped with exit code",
        code,
      );
    }
  });

  console.log(
    "\x1b[32m%s\x1b[0m",
    "[Main] Worker spawned, main thread continues immediately",
  );
};
