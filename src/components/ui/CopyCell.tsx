import { useState } from "react";
import { toast } from "sonner";

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // avoid scrolling to bottom
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const ok = document.execCommand("copy");
  document.body.removeChild(textArea);
  return ok;
}

async function copyText(text: string) {
  // Try modern clipboard first (needs HTTPS/localhost)
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  // Fallback works on HTTP too
  return fallbackCopyTextToClipboard(text);
}

export default function CopyCell({
  value,
  className = "",
}: {
  value: any;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => { 
    // prevents row click / expand click issues
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    // (Optional) only copy on left-click
    if (e.button !== 0) return;

    const text = value === null || value === undefined ? "" : String(value);
    if (!text) return;

    try {
      const ok = await copyText(text);
      if (!ok) throw new Error("copy failed");

      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 800);
    } catch (err) {
      toast.error("Copy not allowed in this browser/page");
      console.error(err);
    }
  };

  return (
    <span
      onClick={handleCopy}
      title={`Click to copy:: ${value}`}
      className={`cursor-pointer ${className}`} 
    >
      {value} 
    </span>
  );
}