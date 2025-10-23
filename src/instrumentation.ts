export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only run the scheduler in Node.js runtime (not Edge)
    const { startCampaignScheduler } = await import(
      "./server/services/campaign-scheduler"
    );
    startCampaignScheduler();
  }
}
