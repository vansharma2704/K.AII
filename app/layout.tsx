import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Toaster } from "@/components/ui/sonner";
import { checkUser } from "@/lib/checkUser";
import { GlobalWidgets } from "@/components/global-widgets";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "k.ai - Your AI Career Coach",
  description: "Accelerate your career with k.ai. Get personalized AI-powered guidance, master interviews, build standout resumes, and access industry insights to land your dream job.",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log(">>> [DEBUG] Entering RootLayout...");
  try {
    await checkUser();
  } catch (e) {
    console.error(">>> [DEBUG] checkUser failed:", e);
  }
  console.log(">>> [DEBUG] checkUser passed.");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} font-sans`}
      >
        <ClerkProvider appearance={{
          baseTheme: dark
        }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <GlobalWidgets />
            {/* header */}
            <Header />
            <main className="min-h-screen relative overflow-hidden">
              {/* Global deep purple atmosphere glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
              {children}
            </main>
            <Toaster richColors />
            <footer className="relative border-t border-white/5 bg-[#030207] pt-16 pb-8 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                      <span className="text-white font-black text-lg">S</span>
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">
                      k.ai
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/60 font-medium">
                    © {new Date().getFullYear()} k.ai. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>

          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}