import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateRuleForm from "@/app/_components/rules/CreateRuleForm";

export default function NewRulePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/rules">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Rules
          </Button>
        </Link>
      </div>
      <CreateRuleForm />
    </div>
  );
}

