"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";
import { coverLetterSchema } from "@/app/lib/schema";
import { useRouter } from "next/navigation";

export default function CoverLetterGenerator() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(coverLetterSchema),
  });

  const {
    loading: generating,
    fn: generateLetterFn,
    data: generatedLetter,
  } = useFetch(generateCoverLetter);

  const onSubmit = async (data: any) => {
    try {
      const res = await generateLetterFn(data);
      if (res) {
        toast.success("Cover letter generated successfully!");
        router.push(`/ai-cover-letter/${res.id}`);
        reset();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate cover letter");
    }
  };

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
      {/* Header Section */}
      <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/[0.02] to-transparent">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary to-primary/40 shadow-[0_0_15px_rgba(124,58,237,0.5)]" /> 
            Generator <span className="text-primary/80">Settings</span>
          </h2>
          <p className="text-sm text-white/40 mt-1 ml-5 font-medium">
            Generate professional cover letters instantly
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. John Doe"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 font-bold ml-1">{errors.fullName.message as string}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="role" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Target Role</Label>
            <Input
              id="role"
              placeholder="e.g. Frontend Developer"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all"
              {...register("role")}
            />
            {errors.role && (
              <p className="text-xs text-red-500 font-bold ml-1">{errors.role.message as string}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="companyName" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Company Name</Label>
            <Input
              id="companyName"
              placeholder="e.g. Google"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all"
              {...register("companyName")}
            />
            {errors.companyName && (
              <p className="text-xs text-red-500 font-bold ml-1">{errors.companyName.message as string}</p>
            )}
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="experience" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Years of Experience</Label>
            <Input
              id="experience"
              type="number"
              placeholder="e.g. 5"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all"
              {...register("experience")}
            />
            {errors.experience && (
              <p className="text-xs text-red-500 font-bold ml-1">{errors.experience.message as string}</p>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="skills" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Key Skills (comma separated)</Label>
          <Input
            id="skills"
            placeholder="React, Next.js, TypeScript, Tailwind CSS"
            className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary/50 transition-all"
            {...register("skills")}
          />
          {errors.skills && (
            <p className="text-xs text-red-500 font-bold ml-1">{errors.skills.message as string}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="jobDescription" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">Job Description</Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the job description here..."
            className="h-40 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 transition-all resize-none p-4"
            {...register("jobDescription")}
          />
          {errors.jobDescription && (
            <p className="text-xs text-red-500 font-bold ml-1">{errors.jobDescription.message as string}</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={generating}
            className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 hover:opacity-90 text-white font-black shadow-[0_0_30px_-5px_var(--color-primary)] h-14 px-10 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border-t border-white/20">
            {generating ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                FORGING COVER LETTER...
              </>
            ) : (
              <>
                <Sparkles className="mr-3 h-5 w-5" />
                GENERATE COVER LETTER
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}