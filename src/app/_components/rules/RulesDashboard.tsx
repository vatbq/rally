import { getRulesAction } from "@/app/_actions/rules";
import { RuleCard } from "@/app/_components/rules/RuleCard";
import { type Rule } from "@prisma/client";

const RulesDashboard = async () => {
  const rules = await getRulesAction();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
      {rules.map((rule: Rule) => (
        <RuleCard key={rule.id} rule={rule} />
      ))}
    </div>
  );
};

export default RulesDashboard;
