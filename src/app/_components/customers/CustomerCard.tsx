import { type Customer } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

interface CustomerCardProps {
  customer: Customer & {
    _count?: {
      vehicles: number;
    };
  };
}

const CustomerCard = ({ customer }: CustomerCardProps) => {
  const fullName =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    "No name";

  const initials =
    [customer.firstName?.[0], customer.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  return (
    <Link href={`/customers/${customer.id}`}>
      <Card className="hover:shadow-lg transition-all hover:scale-[1.02] h-full cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {customer._count?.vehicles
                  ? `${customer._count.vehicles} ${customer._count.vehicles === 1 ? "vehicle" : "vehicles"}`
                  : "No vehicles"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>

          {customer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Customer since
            </span>
            <p className="text-sm font-medium">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CustomerCard;
