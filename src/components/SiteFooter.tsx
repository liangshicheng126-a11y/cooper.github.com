"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import WeChatIcon from "@/components/icons/WeChatIcon";
import MetallicPaint from "@/components/ui/MetallicPaint";
import { useTranslation } from "@/locales/LanguageProvider";

export default function SiteFooter() {
  const { t } = useTranslation();

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
