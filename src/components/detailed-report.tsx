import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DetailedReport({ report }: { report: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Detailed Report</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40 w-full">
          <p className="text-sm whitespace-pre-wrap">{report}</p>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
