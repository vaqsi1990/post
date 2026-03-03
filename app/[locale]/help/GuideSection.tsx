"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
  title: string;
  text: string;
  isKa: boolean;
};

export default function GuideSection({ title, text, isKa }: Props) {
  const lines = text.split(". ").filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.h1
        className="text-center text-black md:text-[32px] text-[22px] font-extrabold mb-6 md:mb-8"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {title}
      </motion.h1>

      <motion.div
        className="relative overflow-hidden rounded-3xl border border-pink-200/60 bg-gradient-to-br from-white via-pink-50 to-indigo-50 shadow-xl p-5 md:p-8"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-400/20 blur-2xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 grid gap-6 md:gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] items-center">
          <motion.div
            className="relative overflow-hidden rounded-2xl "
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Image
              src="/a187e6c6-0730-4685-ab6c-aa7fdf8b0965.png"
              alt={isKa ? "ონლაინ გიდი" : "Online guide"}
              width={640}
              height={640}
              className="h-full w-full object-cover"
            />
          </motion.div>

          <div className="space-y-4 md:space-y-5 text-black md:text-[16px] text-[14px] leading-relaxed">
            {lines.map((line, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? 12 : -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: 0.08 * index, ease: "easeOut" }}
              >
                {line.trim()}
                {index !== lines.length - 1 ? "." : ""}
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

