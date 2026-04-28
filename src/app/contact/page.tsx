"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/locales/LanguageProvider";
import { Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { FormEvent } from "react";

export default function ContactPage() {
  const { t, mounted } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    topic: "",
    message: "",
    consent: false,
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [startedAt, setStartedAt] = useState(() => Date.now());

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

  const submitByMail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim() || !formData.consent) return;
    setIsSubmitting(true);
    setSubmitState("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          website: formData.website,
          topic: formData.topic,
          message: formData.message,
          company: formData.company,
          startedAt,
        }),
      });

      if (!response.ok) throw new Error("submit_failed");
      setSubmitState("success");
      setFormData({
        name: "",
        email: "",
        website: "",
        topic: "",
        message: "",
        consent: false,
        company: "",
      });
      setStartedAt(Date.now());
    } catch {
      setSubmitState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("max-w-4xl pb-8", !mounted && "opacity-0")}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.header variants={item} className="mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.contact.pageTitle}
          </h1>
          <p className="text-lg sm:text-xl text-foreground/60 leading-relaxed max-w-3xl">
            {t.contact.pageSubtitle}
          </p>
        </motion.header>

        <motion.section variants={item} className="glass rounded-[36px] border-white/15 p-6 sm:p-8 lg:p-10">
          <form className="space-y-6" onSubmit={submitByMail}>
            <input
              type="text"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              value={formData.company}
              onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                  {t.contact.formName}
                </span>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
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
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/15 px-4 outline-none focus:border-indigo-400/50 transition-colors"
                placeholder={t.contact.formWebsite}
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-[0.18em] text-foreground/45 font-bold">
                {t.contact.formTopic}
              </span>
              <select
                value={formData.topic}
                onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
                className="w-full h-12 rounded-xl bg-white/5 border border-white/15 px-4 outline-none focus:border-indigo-400/50 transition-colors"
              >
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
                required
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full rounded-xl bg-white/5 border border-white/15 p-4 outline-none focus:border-indigo-400/50 transition-colors resize-y min-h-[150px]"
                placeholder={t.contact.formMessage}
              />
            </label>

            <label className="flex items-start gap-3 text-sm text-foreground/70">
              <input
                type="checkbox"
                required
                checked={formData.consent}
                onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
                className="mt-0.5 accent-indigo-500"
              />
              <span>{t.contact.formConsent}</span>
            </label>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? t.contact.formSending : t.contact.formSubmit}</span>
              </button>
              <a
                href="mailto:liangshicheng303@126.com"
                className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>liangshicheng303@126.com</span>
              </a>
            </div>
            {submitState === "success" && (
              <p className="text-sm text-emerald-500 font-medium">{t.contact.formSuccess}</p>
            )}
            {submitState === "error" && (
              <p className="text-sm text-rose-500 font-medium">{t.contact.formError}</p>
            )}
          </form>
        </motion.section>
      </motion.div>
    </div>
  );
}
