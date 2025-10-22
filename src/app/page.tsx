import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <h1 className="text-4xl font-bold mb-4">Welcome to Rally!</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Service re-engagement email automation platform
      </p>

      <div className="flex gap-4">
        <Link href="/customers">
          <Button variant="outline">View Customers</Button>
        </Link>
        <Link href="/rules">
          <Button variant="outline">View All Rules</Button>
        </Link>
        <Link href="/rules/new">
          <Button>Create New Rule</Button>
        </Link>
      </div>
    </div>
  );
}
