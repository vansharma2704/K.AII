"use client";

import { motion, Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const revealVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

interface TestimonialItem {
    quote: string;
    author: string;
    role: string;
    image: string;
}

export default function TestimonialSection({ testimonials }: { testimonials: TestimonialItem[] }) {
  return (
    <motion.section 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={revealVariant}
      className="w-full py-20 md:py-32 bg-gradient-to-b from-black via-black to-primary/5 border-y border-primary/20 relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-[550px] h-[550px] bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-primary/30 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Star className="w-4 h-4 fill-primary" />
              <span>Client Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Success <span className="text-primary">Stories</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Discover how professionals like you achieved their career goals with Senpai
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="relative bg-black/40 backdrop-blur-xl border-primary/50 rounded-3xl transition-all duration-500 h-full overflow-hidden group">
                  <div className="absolute -inset-px bg-gradient-to-br from-primary/20 to-transparent opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="pt-8 pb-8 px-8 relative z-10">
                    <div className="flex flex-col h-full">
                      <div className="mb-6">
                        <Quote className="w-10 h-10 text-primary/30" />
                      </div>
                      
                      <p className="text-base text-gray-300 leading-relaxed mb-6 flex-grow italic">
                        "{item.quote}"
                      </p>
                      
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                        <div className="relative">
                          <Image
                            width={48}
                            height={48}
                            src={item.image}
                            alt={item.author}
                            className="relative rounded-full object-cover grayscale-0 transition-all duration-500 ring-2 ring-primary/20"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white text-base tracking-tight">{item.author}</p>
                          <p className="text-xs text-primary font-medium tracking-wide uppercase">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
