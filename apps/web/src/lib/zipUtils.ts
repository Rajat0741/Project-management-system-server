import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Downloads multiple files as a single zip archive.
 * @param attachments Array of objects containing url and optional filename.
 * @param zipFileName The name of the zip file to download (without extension).
 */
export async function downloadAttachmentsAsZip(attachments: { url: string; filename?: string }[], zipFileName: string) {
  const zip = new JSZip();
  const folder = zip.folder("attachments");

  if (!folder) {
    throw new Error("Failed to create zip folder");
  }

  // Helper to fetch a file as a blob
  const fetchFile = async (url: string) => {
    // Append a query param to avoid potential caching issues or just to be safe with some CDNs
    // Also ensures we get the raw file if the server handles it that way
    const response = await fetch(`${url}?ik-attachment=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    return response.blob();
  };

  const filePromises = attachments.map(async (attachment) => {
    try {
      const blob = await fetchFile(attachment.url);

      // Determine filename
      let filename = attachment.filename;
      if (!filename) {
        try {
          // Try to extract from URL
          filename = decodeURIComponent(new URL(attachment.url).pathname.split("/").pop() || "file");
        } catch {
          filename = "file";
        }
      }

      // Ensure unique filenames if needed, but for now simple overwrite protection might suffice
      // or we can just append a counter if we wanted to be robust.
      // JSZip handles duplicate names by adding them anyway, but extraction might be an issue.
      // Let's count occurrences if we want to be safe, but simple for now:

      folder.file(filename, blob);
    } catch (error) {
      console.error(`Error downloading file ${attachment.url}:`, error);
      // We could throw here or just skip the failed file.
      // Skipping ensures the user gets *something*.
    }
  });

  await Promise.all(filePromises);

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${zipFileName}.zip`);
}
