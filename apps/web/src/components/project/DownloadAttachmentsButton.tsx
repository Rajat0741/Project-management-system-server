import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAttachmentsAsZip } from "@/lib/zipUtils";
import { toast } from "sonner";

interface DownloadAttachmentsButtonProps {
  attachments: { url: string; filename?: string }[];
  fileName: string;
}

export function DownloadAttachmentsButton({ attachments, fileName }: DownloadAttachmentsButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!attachments || attachments.length === 0) return;

    try {
      setIsDownloading(true);
      await downloadAttachmentsAsZip(attachments, fileName);
      toast.success("Download started");
    } catch (error) {
      console.error("Failed to download attachments:", error);
      toast.error("Failed to download attachments");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleDownload}
      disabled={isDownloading}
      className="h-6 text-md p-4 gap-1.5 bg-muted text-foreground hover:text-muted-foreground"
    >
      {isDownloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
      Download All
    </Button>
  );
}
