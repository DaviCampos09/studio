import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export function DetailedReport({ report }: { report: string }) {
  return (
    <div>
        <div className="flex items-center mb-2">
            <FileText className="mr-2 h-5 w-5" />
            <h3 className="font-headline text-lg">Detailed Report</h3>
        </div>
        <ScrollArea className="h-56 w-full rounded-lg border p-3">
          <p className="text-sm whitespace-pre-wrap">{report}</p>
        </ScrollArea>
    </div>
  );
}
