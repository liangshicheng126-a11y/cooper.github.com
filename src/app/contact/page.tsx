"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const { t, mounted } = useTranslation();

  if (!mounted) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
  };

  return (
    <div className={cn("max-w-4xl pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.header variants={item} className="mb-12">
          <p className="text-indigo-500 text-sm uppercase tracking-[0.2em] font-bold mb-4">
            {t.contact.getInTouch}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.contact.pageTitle}
          </h1>
          <p className="text-lg sm:text-xl text-foreground/60 leading-relaxed max-w-3xl">
            {t.contact.pageSubtitle}
          </p>
        </motion.header>

        <motion.section variants={item} className="glass rounded-[36px] border-white/15 p-6 sm:p-8 lg:p-10">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                  {t.contact.formName}
                </span>
                <input
                  type="text"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/15 px-4 outline-none focus:border-indigo-400/50 transition-colors"
                  placeholder={t.contact.formName}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                  {t.contact.formEmail}
                </span>
                <input
                  type="email"
                  className="w-full h-12 rounded-xl bg-white/5 border border-white/15 px-4 outline-none focus:border-indigo-400/50 transition-colors"
                  placeholder={t.contact.formEmail}
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                {t.contact.formWebsite}
              </span>
              <input
                type="text"
                className="w-full h-12 rounded-xl bg-white/5 border border-white/15 px-4 outline-none focus:border-indigo-400/50 transition-colors"
                placeholder={t.contact.formWebsite}
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                {t.contact.formTopic}
              </span>
              <select className="w-full h-12 rounded-xl bg-white/5 border border-white/15 px-4 outline-none focus:border-indigo-400/50 transition-colors">
                <option>{t.contact.topics.collaboration}</option>
                <option>{t.contact.topics.uiux}</option>
                <option>{t.contact.topics.visual}</option>
                <option>{t.contact.topics.photography}</option>
                <option>{t.contact.topics.video}</option>
                <option>{t.contact.topics.other}</option>
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                {t.contact.formMessage}
              </span>
              <textarea
                rows={6}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-4 outline-none focus:border-indigo-400/50 transition-colors resize-y min-h-[150px]"
                placeholder={t.contact.formMessage}
              />
            </label>

            <label className="flex items-start gap-3 text-sm text-foreground/70">
              <input type="checkbox" className="mt-0.5 accent-indigo-500" />
              <span>{t.contact.formConsent}</span>
            </label>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>{t.contact.formSubmit}</span>
              </button>
              <a
                href="mailto:liangshicheng303@126.com"
                className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>liangshicheng303@126.com</span>
              </a>
            </div>
          </form>
        </motion.section>
      </motion.div>
    </div>
  );
}
