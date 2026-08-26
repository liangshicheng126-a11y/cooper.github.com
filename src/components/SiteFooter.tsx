"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Mail, MapPin, Phone } from "lucide-react";

import WeChatIcon from "@/components/icons/WeChatIcon";
import MetallicPaint from "@/components/ui/MetallicPaint";
import { useTranslation } from "@/locales/LanguageProvider";

export default function SiteFooter() {
  const { language, t } = useTranslation();
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const copyToClipboard = async (value: string) => {
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.readOnly = true;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand("copy");
      textarea.remove();
    }

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({
      id: Date.now(),
      message: copied
        ? language === "zh" ? "已复制" : "Copied"
        : language === "zh" ? "复制失败，请重试" : "Copy failed. Please try again.",
    });
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
  };

  const contacts: Array<{
    key: string;
    value: string;
    label: string;
    icon: ReactNode;
  }> = [
    {
      key: "email",
      value: "liangshicheng303@126.com",
      label: "liangshicheng303@126.com",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      key: "phone",
      value: "13867681608",
      label: "13867681608",
      icon: <Phone className="h-4 w-4" />,
    },
    {
      key: "wechat",
      value: "llqsc1122",
      label: "llqsc1122",
      icon: <WeChatIcon className="h-4 w-4" />,
    },
    {
      key: "location",
      value: t.contact.location,
      label: t.contact.location,
      icon: <MapPin className="h-4 w-4" />,
    },
  ];

  return (
    <footer className="site-footer">
      <div>
        <MetallicPaint
          imageSrc="/cooper-wordmark-mask.svg"
          fallbackText="COOPER."
          className="site-footer__brand site-footer__brand-effect"
          seed={42}
          scale={3.5}
          patternSharpness={1}
          noiseScale={0.45}
          speed={0.18}
          liquid={0.48}
          brightness={1.65}
          contrast={0.72}
          refraction={0.012}
          blur={0.012}
          chromaticSpread={1.5}
          fresnel={1}
          angle={0}
          waveAmplitude={0.7}
          distortion={0.58}
          contour={0.2}
          tintColor="#a5b4fc"
        />
        <p className="site-footer__note">{t.hero.subtitle}</p>
      </div>
      <div className="site-footer__contacts">
        {contacts.map((contact) => (
          <button
            key={contact.key}
            type="button"
            className="site-footer__contact"
            onClick={() => copyToClipboard(contact.value)}
            aria-label={`${language === "zh" ? "复制" : "Copy"} ${contact.label}`}
            title={language === "zh" ? "点击复制" : "Click to copy"}
          >
            {contact.icon}
            <span>{contact.label}</span>
          </button>
        ))}
      </div>
      {toast && (
        <div key={toast.id} className="site-footer__toast" role="status" aria-live="polite">
          <Check className="h-4 w-4" aria-hidden />
          <span>{toast.message}</span>
        </div>
      )}
    </footer>
  );
}
