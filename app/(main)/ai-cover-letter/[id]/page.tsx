import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default async function EditCoverLetterPage({ params }: any) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

  return (
    <div className="relative min-h-screen overflow-hidden w-full text-white">
      <div className="absolute inset-0 bg-[#020202] -z-20" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none -z-10 blur-3xl" />

      <div className="container mx-auto py-10 px-4 md:px-8 relative z-10 max-w-6xl space-y-8">
        <Link href="/ai-cover-letter">
          <Button variant="ghost" className="gap-2 pl-0 text-white/50 hover:text-primary hover:bg-transparent font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Cover Letters
          </Button>
        </Link>

        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md shadow-[0_0_15px_-3px_var(--color-primary)] text-primary uppercase tracking-[0.2em] text-[10px] font-black">
            <Briefcase className="w-3 h-3" /> Cover Letter
          </div>
          <h1 className="font-black text-3xl md:text-5xl tracking-tight text-white leading-tight">
            {coverLetter?.jobTitle} <span className="text-white/40 font-medium text-2xl">at</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/40">{coverLetter?.companyName}</span>
          </h1>
        </div>

        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-visible min-h-fit">
          <CoverLetterPreview 
            id={id}
            content={coverLetter?.content} 
            jobTitle={coverLetter?.jobTitle}
            companyName={coverLetter?.companyName}
          />
        </div>
      </div>
    </div>
  );
}