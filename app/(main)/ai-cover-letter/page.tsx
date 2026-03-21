import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
      <div className="container mx-auto py-10 px-4 md:px-8 relative z-10 max-w-7xl space-y-10 min-h-[50vh]">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_-3px_var(--color-primary)] text-primary uppercase tracking-[0.2em] text-[10px] font-black">
              <FileText className="w-3 h-3" /> Cover Letters
            </div>
            <h1 className="font-black text-4xl md:text-5xl tracking-tight text-white">
              My <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/40">Cover Letters</span>
            </h1>
          </div>
          <Link href="/ai-cover-letter/new">
            <Button className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 hover:opacity-90 text-white font-black shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] h-12 px-8 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 border-t border-white/20">
              <Plus className="h-4 w-4 mr-2" /> Create New
            </Button>
          </Link>
        </div>

        <CoverLetterList coverLetters={coverLetters} />
      </div>
  );
}