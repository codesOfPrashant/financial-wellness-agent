"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ChecklistItem } from "@/types";
import { Loader2, ClipboardList } from "lucide-react";

export function ChecklistPanel() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checklist")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setItems(data.checklist ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statusVariant = (status: ChecklistItem["status"]) => {
    switch (status) {
      case "submitted":
        return "default" as const;
      case "pending":
        return "secondary" as const;
      default:
        return "destructive" as const;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ClipboardList className="h-5 w-5 text-emerald-600" />
        <CardTitle className="text-base">Proof & Declaration Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading checklist…
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  {item.dueDate && (
                    <p className="mt-1 text-xs text-amber-700">
                      Due: {item.dueDate}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariant(item.status)}>
                  {item.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
