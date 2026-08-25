"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import WeChatIcon from "@/components/icons/WeChatIcon";
import { useTranslation } from "@/locales/LanguageProvider";

export default function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <div>
        <p className="site-footer__brand">COOPER.</p>
        <p className="site-footer__note">{t.hero.subtitle}</p>
      </div>
      <div className="site-footer__contacts">
        <a href="mailto:liangshicheng303@126.com">
          <Mail className="h-4 w-4" />
          <span>liangshicheng303@126.com</span>
        </a>
        <a href="tel:13867681608">
          <Phone className="h-4 w-4" />
          <span>13867681608</span>
        </a>
        <span>
          <WeChatIcon className="h-4 w-4" />
          <span>llqsc1122</span>
        </span>
        <span>
          <MapPin className="h-4 w-4" />
          <span>{t.contact.location}</span>
        </span>
      </div>
    </footer>
  );
}
