"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Download, RefreshCcw, Loader2 } from "lucide-react";
import { regenerateCoverLetter } from "@/actions/cover-letter";
import { useRouter } from "next/navigation";
import { marked } from "marked";

const CoverLetterPreview = ({ id, content, jobTitle, companyName }: any) => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Cover letter copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await regenerateCoverLetter(id);
      if (res) {
        toast.success("Cover letter regenerated!");
        router.push(`/ai-cover-letter/${res.id}`);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate");
    } finally {
      setIsRegenerating(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      const iframe = document.createElement("iframe");
      // Standard A4-ish width for capture
      iframe.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:800px;";
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe");

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', sans-serif; 
                line-height: 1.5; 
                color: #000; 
                background: #fff; 
                padding: 60px 70px; 
                font-size: 12pt;
                width: 800px;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              #content { width: 100%; max-width: 100%; }
              h1, h2, h3 { color: #000; margin-bottom: 1rem; margin-top: 1.5rem; line-height: 1.2; }
              p { margin-bottom: 1.2rem; text-align: justify; }
              ul, ol { margin-left: 2rem; margin-bottom: 1.2rem; }
              li { margin-bottom: 0.5rem; }
              strong { font-weight: 700; }
            </style>
          </head>
          <body>
            <div id="content"></div>
          </body>
        </html>
      `);
      iframeDoc.close();

      await new Promise((r) => {
        iframe.onload = r;
        if (iframeDoc.readyState === "complete") r(null);
      });

      const html = await marked(content);
      const el = iframeDoc.getElementById("content");
      if (el) el.innerHTML = html as string;

      // Wait a bit longer for fonts to settle
      await new Promise((r) => setTimeout(r, 800));

      const canvas = await html2canvas(iframeDoc.body, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
        scale: 3, // Higher scale for better text quality
        logging: false,
        width: 800,
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF, potentially multi-page if height is large
      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      
      const fileName = companyName 
        ? `${companyName.replace(/\s+/g, "_")}_Cover_Letter.pdf`
        : "Cover_Letter.pdf";
      pdf.save(fileName);
      
      toast.success("Cover letter downloaded!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const htmlContent = content ? marked.parse(content) : "";

  return (
    <div className="flex flex-col h-auto w-full items-center">
      {/* Sticky Action Header */}
      <div className="sticky top-0 z-30 w-full bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl rounded-t-[2.5rem]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 rounded-full bg-gradient-to-b from-primary to-primary/40 shadow-[0_0_20px_rgba(124,58,237,0.6)]" />
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Preview <span className="text-primary/80">Result</span>
              </h3>
              <p className="text-sm text-white/40 font-medium uppercase tracking-widest mt-0.5">Finalize and export your letter</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={copyToClipboard}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl h-12 px-6 transition-all border-t border-white/5"
            >
              <Copy className="mr-2 h-4 w-4 text-primary" />
              Copy Text
            </Button>

            <Button 
              variant="outline" 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl h-12 px-6 transition-all border-t border-white/5"
            >
              {isRegenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4 text-primary" />
              )}
              Regenerate
            </Button>

            <Button 
              onClick={generatePDF} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 hover:opacity-90 text-white font-black rounded-2xl h-12 px-8 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] transition-all hover:scale-[1.03] active:scale-[0.97] border-t border-white/20"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              DOWNLOAD PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Glassmorphism Container */}
      <div className="w-full flex justify-center py-10 md:py-16 px-4">
        <div 
          className="w-full max-w-[900px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5),0_0_50px_-12px_rgba(124,58,237,0.2)] relative flex flex-col overflow-hidden"
          style={{ 
            maxHeight: 'min(850px, 85vh)'
          }}
        >
          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.05] to-transparent pointer-events-none" />

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-14 lg:p-20 custom-scrollbar scroll-smooth">
            <style>{`
              .cl-preview-final {
                position: relative;
                z-index: 10;
                width: 100%;
                color: #e2e8f0;
                max-width: 100%;
              }
              .cl-preview-final h1, .cl-preview-final h2, .cl-preview-final h3, .cl-preview-final h4, .cl-preview-final h5, .cl-preview-final h6 { 
                color: white !important; 
                font-weight: 800;
                margin-bottom: 2rem;
                margin-top: 1rem;
                letter-spacing: -0.02em;
                line-height: 1.2;
              }
              .cl-preview-final h1 { font-size: 2.25rem; border-left: 5px solid var(--color-primary); padding-left: 2rem; }
              .cl-preview-final h2 { font-size: 1.875rem; }
              .cl-preview-final h3 { font-size: 1.5rem; }
              
              .cl-preview-final p, .cl-preview-final li { 
                line-height: 1.8;
                margin-bottom: 2rem;
                font-size: 18px;
                color: #cbd5e1 !important;
                font-family: 'Inter', sans-serif;
                overflow-wrap: break-word;
              }
              .cl-preview-final ul, .cl-preview-final ol {
                margin-bottom: 2rem;
                padding-left: 2rem;
                width: 100%;
              }
              .cl-preview-final ul { list-style-type: disc; }
              .cl-preview-final ol { list-style-type: decimal; }
              .cl-preview-final strong, .cl-preview-final b { font-weight: 700; color: white !important; }
              
              /* Custom Scrollbar */
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-primary); }
            `}</style>
            
            <div className="cl-preview-final">
              {content ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: htmlContent as string }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-white/10 italic">
                  <Loader2 className="h-12 w-12 animate-spin mb-6 text-primary/40" />
                  <p className="text-sm font-black tracking-[0.4em] uppercase opacity-40">Intelligence is forging your letter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual buffer */}
      <div className="h-20" />
    </div>
  );
};

export default CoverLetterPreview;