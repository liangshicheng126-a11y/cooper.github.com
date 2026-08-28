import type { Language } from "@/locales/config";
import type { CannedReplyId } from "./cannedReplies";

type ReplyCopy = { keys: string[]; answer: string };

/** Faithful translations of the canonical Chinese replies; no model request is needed. */
export const translatedCannedReplies: Record<Exclude<Language, "zh">, Record<CannedReplyId, ReplyCopy>> = {
  en: {
    intro: {
      keys: ["Introduce yourself in one minute", "Introduce yourself"],
      answer: `Hi, I'm Cooper, an interdisciplinary designer with a master's degree in design from Korea.
I can take a project all the way from product photography and visual analysis to graphic design, video editing, and building a brand website. My work goes beyond retouching images: I start with a product's selling points and examine what the market needs, why customers pause, why they buy, and why platforms recommend content, then use those insights to improve the project's entire visual system.
I'm a hands-on designer who values execution and practicality. I want design to do more than look good: it should be seen and understood, support product conversion, and become a memorable point of recognition. I design for inspiration that can be put into practice.`,
    },
    skills: {
      keys: ["What are your core skills and tools?", "Core skills", "Common tools"],
      answer: `My core strength is delivering brand and product visuals from end to end: product photography, visual analysis, graphic design, video editing, brand websites, and e-commerce conversion visuals, including Amazon product detail pages.

Tools I use regularly:
- Design and post-production: Photoshop / Illustrator / Figma / PR / CapCut / PS AI
- AI workflows: ChatGPT / Claude / Codex / Cursor, Midjourney, Nano Banana

I focus on more than making things look good: communicating selling points, holding attention, supporting conversion, and understanding why platforms recommend content.`,
    },
    workflow: {
      keys: ["How do you usually work?", "How do you work?", "AI workflow"],
      answer: `Stage 1: Inspiration and planning — improving efficiency
Tools: ChatGPT / Claude / Codex / Cursor
At the start of a project, I use ChatGPT and Codex for competitor analysis and visual-style research. I quickly clarify the brand's character and develop several visual directions within minutes, helping the team align without the lengthy process of collecting and collaging references.

Stage 2: Generating materials and building assets — optimizing costs
Tools: Midjourney (V6.1) / Nano Banana
For scenes that are difficult to create in a product shoot, such as complex or expensive sets, I use Midjourney to generate high-quality backgrounds. I then combine the product with the AI-generated environment in Photoshop and refine the overall direction. This reduces location-shooting costs while maintaining visual quality.

Stage 3: Retouching and adaptation — quality control
Tools: PS AI
During post-production, I use Cursor's image skill and MCP in Photoshop and Illustrator to extend images and correct imperfections quickly. Work that once took hours can be reduced to minutes, giving me more time for brand strategy and the visual logic behind the work.

My AI workflow is not about replacing design, but freeing it up. I use AI to shift time away from repetitive tasks such as masking, retouching, and searching for materials, and toward brand visual logic and understanding user psychology. This lets me produce visually compelling commercial work faster and at a lower cost.`,
    },
    plans: {
      keys: ["What are your future plans?", "Future plans"],
      answer: `I want to be not just someone who makes designs, but someone who solves problems.
In the short term, I'll continue building experience in visual design and production, improving execution efficiency and output quality. In the medium and long term, I want a more systematic approach to brand visuals, commercial conversion, and user communication, and to grow into a designer who can lead a team toward project results.
I want my design skills to support brand growth and communicate product value, not stop at surface-level presentation. By deeply integrating AI tools into product photography, graphic production, and video editing, I aim to improve efficiency and creative quality and make the design process more standardized and effective. I want design to become a meaningful part of a company's competitive strength.`,
    },
    departure: {
      keys: ["Why did you leave your last company?", "Reason for leaving"],
      answer: `After gaining solid experience in delivering visuals from end to end at my previous company, I realized that design requires more than execution: it also needs a strong aesthetic foundation and a global perspective. To move beyond my professional plateau, I chose to pursue a master's degree in design in Korea. That experience strengthened my understanding of design theory and aesthetics, and taught me to approach brands and markets from an international perspective. It gave me a stronger theoretical foundation for practical work after returning to China.`,
    },
    location: {
      keys: ["Where are you now?", "Where are you based?"],
      answer: `Cooper is from Zhejiang, but he enjoys exploring the world and may be out in the mountains. XiaoCoo recommends getting in touch with him directly.
Email: liangshicheng303@126.com
WeChat: llqsc1122`,
    },
    "ellen-valve": {
      keys: ["Ellen Valve", "What did you do at your last company?"],
      answer: `Core role: Product Visual Designer
I was responsible for the brand's end-to-end visual output, using visual strategy to improve the products' competitiveness in the market.
Visual marketing and conversion: I designed Amazon product detail pages, explored product selling points in depth, and optimized the visual path to conversion to improve click-through and conversion rates.
Brand visual system: I coordinated product photography, poster design, and exhibition materials, keeping the brand's presentation consistent across online commerce and offline exhibitions.
Multimedia content: I planned, filmed, and edited factory promotional videos, using moving images to strengthen the brand's credibility and build user trust.`,
    },
    education: {
      keys: ["Education", "Educational background", "Where did you study?"],
      answer: `I have studied design throughout my education. I first completed a three-year college program in Xiamen, then continued my bachelor's studies in Korea. With a GPA of 4.5/5.0, I received the opportunity to pursue a master's degree in the same subject at the same university. Throughout my studies, I developed my professional skills and gained experience studying and adapting in a cross-cultural environment. I have now graduated and returned to China, and I am looking for a design-related role where I can put what I've learned into practice.
In Korea, I studied Convergence Design at Daegu Catholic University. My master's GPA was 4.5/5.0.`,
    },
  },
  ja: {
    intro: {
      keys: ["1分で自己紹介してください", "自己紹介", "一分で自己紹介"],
      answer: `こんにちは、Cooperです。韓国でデザインの修士号を取得した、領域を横断するデザイナーです。
商品撮影からビジュアル分析、グラフィックデザイン、動画編集、ブランドサイトの構築まで、一貫して形にすることができます。単に画像を加工するのではなく、商品の強みを起点に、市場が何を求めているのか、なぜ顧客が目を留めるのか、なぜ購入するのか、なぜプラットフォームで推薦されるのかを考え、プロジェクト全体のビジュアル体系を改善します。
私は実行力と実用性を重視する、実践型のデザイナーです。デザインを「見た目が良い」だけで終わらせず、ユーザーに見てもらい、理解してもらい、購入につながり、記憶に残るものにしたいと考えています。実現できるひらめきのためにデザインします。`,
    },
    skills: {
      keys: ["得意なスキルと、よく使うツールは何ですか？", "得意なスキル", "よく使うツール"],
      answer: `私の強みは、ブランドと商品のビジュアルを一貫して制作できることです。商品撮影、ビジュアル分析、グラフィックデザイン、動画編集、ブランドサイト、そしてAmazonの商品詳細ページを含む、ECの購入につながるビジュアル制作を手がけます。

よく使うツール：
- デザイン・仕上げ：Photoshop / Illustrator / Figma / PR / CapCut / PS AI
- AIワークフロー：ChatGPT / Claude / Codex / Cursor、Midjourney、Nano Banana

「見た目の良さ」だけでなく、商品の強みの伝達、関心の維持、購入へのつながり、プラットフォームで推薦される理由を重視しています。`,
    },
    workflow: {
      keys: ["普段はどのように仕事を進めていますか？", "仕事の進め方", "AIワークフロー"],
      answer: `第1段階：発想と企画 ― 効率を高める
ツール：ChatGPT / Claude / Codex / Cursor
プロジェクトの初期には、ChatGPTやCodexで競合分析とビジュアルスタイルの調査を行います。ブランドの方向性を素早く整理し、数分で複数の案をつくることで、参考画像の収集やコラージュにかかる手間を減らし、チームで早い段階から方向性を共有します。

第2段階：素材の生成とアセットの構築 ― コストを最適化する
ツール：Midjourney（V6.1）/ Nano Banana
複雑で費用のかかるセットなど、商品撮影では実現しにくい場面に対して、Midjourneyで高品質な背景を生成します。その後、Photoshopで商品とAI生成の環境を自然に組み合わせ、全体の方向性をさらに調整します。これにより、画面の質感を保ちながらロケ撮影のコストを大きく抑えられます。

第3段階：レタッチと展開 ― 品質を管理する
ツール：PS AI
仕上げの工程では、Cursorの画像スキルとMCPをPhotoshopやIllustratorで活用し、画像の拡張や細かな不具合の修正を迅速に行います。数時間かかっていた修正を数分に短縮し、その分の時間をブランド戦略とビジュアルの論理に振り向けます。

私にとってAIワークフローは、デザインを置き換えるものではなく、デザインの可能性を広げるものです。切り抜き、レタッチ、素材探しといった反復作業から、ブランドのビジュアル体系の構築とユーザー心理の理解へ時間を移すことで、より低いコストと速いスピードで、商業的な競争力のあるビジュアルを制作できます。`,
    },
    plans: {
      keys: ["今後の目標を教えてください", "今後の目標", "将来の計画"],
      answer: `私は単に「デザインをする人」ではなく、「課題を解決する人」でありたいと考えています。
短期的には、ビジュアルデザインと制作の実務経験を積み、実行の効率と成果物の品質を高めていきます。中長期的には、ブランドのビジュアル、購入へのつながり、ユーザーとのコミュニケーションをより体系的に捉え、チームを率いてプロジェクトの成果を生み出せるデザイナーへ成長したいです。
デザインの力を表面的な表現にとどめず、ブランドの成長と商品の価値の伝達に役立てたいと思っています。AIツールを商品撮影、グラフィック制作、動画編集などの工程に深く組み込み、効率と創造的な成果の質を高め、制作の流れを標準化・効率化していきます。デザインを企業の競争力の重要な一部にしたいと考えています。`,
    },
    departure: {
      keys: ["前の会社を辞めた理由は何ですか？", "前の会社を辞めた理由", "退職理由"],
      answer: `前の会社で、ビジュアルを一貫して制作する確かな実務経験を積む中で、デザインには実行力だけでなく、深い美的な蓄積とグローバルな視点が必要だと気づきました。キャリアの停滞を乗り越えるため、韓国でデザインの修士課程に進むことを選びました。この経験を通じて、デザイン理論と美的な判断力を体系的に磨くだけでなく、ブランドや市場を国際的な視点で捉えることを学びました。帰国後の実務に向けて、より確かな理論的基盤を築くことができました。`,
    },
    location: {
      keys: ["現在はどこにいますか？", "今どこにいますか", "活動拠点"],
      answer: `Cooperの故郷は浙江省ですが、世界を探索することが好きなので、今は山や自然の中にいるかもしれません。小cooからは、本人に直接連絡することをおすすめします。
メール：liangshicheng303@126.com
WeChat：llqsc1122`,
    },
    "ellen-valve": {
      keys: ["愛倫バルブ", "前の会社での仕事内容"],
      answer: `主な役割：プロダクト・ビジュアルデザイナー
ブランド全体のビジュアル制作を担当し、ビジュアル戦略を通じて商品の市場競争力を高めました。
ビジュアルマーケティングと購入への導線：Amazonの商品詳細ページを制作。商品の強みを深く掘り下げ、購入につながる視覚的な流れを改善することで、クリック率と購入率の向上を目指しました。
ブランドのビジュアル体系：商品撮影、ポスター、展示会用の制作物を統括し、オンラインECとオフライン展示会の両方でブランドの見え方を統一しました。
マルチメディア制作：工場のプロモーション動画の企画・撮影・編集を担当。映像によってブランドの信頼性を伝え、ユーザーの安心感を高めました。`,
    },
    education: {
      keys: ["学歴", "教育背景", "どこで学びましたか"],
      answer: `私は一貫してデザインを学んできました。まず厦門で3年間の専科課程を修了し、その後、韓国で学士課程の学びを続けました。GPA 4.5/5.0の成績により、同じ大学の同じ専攻で修士課程に進む機会を得ました。学びを通じて専門性を深めるとともに、異文化の環境で学び、適応する経験を積みました。現在は卒業して中国に帰国し、学んだことを実務に活かせるデザイン関連の仕事を探しています。
韓国では大邱カトリック大学で融合デザインを学びました。修士課程のGPAは4.5/5.0です。`,
    },
  },
  ko: {
    intro: {
      keys: ["1분 안에 자기소개를 해 주세요", "자기소개", "1분 자기소개"],
      answer: `안녕하세요, Cooper입니다. 한국에서 디자인 석사 학위를 취득한 융합형 디자이너입니다.
제품 촬영부터 비주얼 분석, 그래픽 디자인, 영상 편집, 브랜드 웹사이트 구축까지 전 과정을 실제 결과물로 완성할 수 있습니다. 단순한 이미지 보정에 그치지 않고 제품의 강점에서 출발해 시장이 무엇을 필요로 하는지, 고객이 왜 관심을 보이고 구매하는지, 플랫폼이 왜 콘텐츠를 추천하는지를 분석하며 프로젝트 전체의 비주얼 체계를 개선합니다.
저는 실행력과 실용성을 중시하는 실무형 디자이너입니다. 디자인이 보기 좋은 수준에 머무르지 않고, 사용자에게 실제로 보이고 이해되며, 제품의 구매 전환에 기여하고 기억에 남는 기준점이 되기를 바랍니다. 실현할 수 있는 영감을 위해 디자인합니다.`,
    },
    skills: {
      keys: ["주요 역량과 자주 사용하는 도구는 무엇인가요?", "주요 역량", "자주 사용하는 도구"],
      answer: `핵심 역량은 브랜드와 제품의 비주얼을 전 과정에 걸쳐 구현하는 것입니다. 제품 촬영, 비주얼 분석, 그래픽 디자인, 영상 편집, 브랜드 웹사이트, Amazon 상세 페이지를 포함한 전자상거래 구매 전환용 비주얼을 제작합니다.

자주 사용하는 도구:
- 디자인 및 후반 작업: Photoshop / Illustrator / Figma / PR / CapCut / PS AI
- AI 워크플로: ChatGPT / Claude / Codex / Cursor, Midjourney, Nano Banana

단순히 보기 좋게 만드는 것을 넘어, 제품의 강점 전달, 관심 유지와 구매 전환, 플랫폼이 콘텐츠를 추천하는 이유를 중요하게 생각합니다.`,
    },
    workflow: {
      keys: ["평소에는 어떻게 일하나요?", "일하는 방식", "AI 워크플로"],
      answer: `1단계: 영감 탐색과 기획 — 효율 향상
도구: ChatGPT / Claude / Codex / Cursor
프로젝트 초기에 ChatGPT와 Codex로 경쟁사 분석과 비주얼 스타일 조사를 진행합니다. 브랜드의 방향성을 빠르게 정리하고 몇 분 안에 여러 스타일의 아이디어를 만들어, 자료를 찾고 콜라주를 만드는 번거로운 과정을 줄이며 팀과 비주얼 방향을 신속하게 맞춥니다.

2단계: 소재 생성과 에셋 구축 — 비용 최적화
도구: Midjourney (V6.1) / Nano Banana
복잡하거나 비용이 많이 드는 세트처럼 제품 촬영으로 구현하기 어려운 장면에는 Midjourney로 고품질 배경을 생성합니다. 이후 Photoshop에서 제품과 AI로 생성한 환경을 자연스럽게 결합하고 전체 방향을 다시 다듬습니다. 이를 통해 비주얼의 질감을 유지하면서 외부 촬영 비용을 크게 줄일 수 있습니다.

3단계: 정밀 보정과 확장 — 품질 관리
도구: PS AI
후반 작업에서는 Cursor의 이미지 스킬과 MCP를 Photoshop과 Illustrator에서 활용해 이미지를 빠르게 확장하고 결점을 수정합니다. 몇 시간 걸리던 보정 작업을 몇 분으로 줄여, 브랜드 전략과 비주얼 논리에 더 많은 시간을 쓸 수 있습니다.

제 AI 워크플로는 디자인을 대체하기 위한 것이 아니라 디자인의 가능성을 넓히기 위한 것입니다. 누끼 작업, 보정, 소재 검색처럼 반복적인 실행에 쓰던 시간을 브랜드 비주얼 논리의 구축과 사용자 심리의 이해로 옮깁니다. 이를 통해 더 낮은 비용과 더 빠른 속도로 상업적 경쟁력을 갖춘 비주얼 콘텐츠를 제작할 수 있습니다.`,
    },
    plans: {
      keys: ["앞으로의 계획은 무엇인가요?", "앞으로의 계획", "미래 계획"],
      answer: `저는 단순히 디자인을 만드는 사람이 아니라 문제를 해결하는 사람이 되고 싶습니다.
단기적으로는 비주얼 디자인과 실제 제작 경험을 쌓으며 프로젝트 실행 효율과 결과물의 품질을 높이겠습니다. 중장기적으로는 브랜드 비주얼, 구매 전환, 사용자 커뮤니케이션을 더 체계적으로 다루는 방법론을 만들고, 팀을 이끌어 프로젝트 성과를 낼 수 있는 디자이너로 성장하고 싶습니다.
제 디자인 역량이 표현에만 머무르지 않고 브랜드 성장과 제품 가치 전달에 실질적으로 기여하기를 바랍니다. AI 도구를 제품 촬영, 그래픽 제작, 영상 편집 등의 워크플로에 깊이 통합해 효율과 창의적 결과물의 품질을 높이고, 디자인 과정을 표준화하고 효율화하려고 합니다. 디자인이 기업의 핵심 경쟁력에서 중요한 부분이 되도록 하고 싶습니다.`,
    },
    departure: {
      keys: ["이전 회사를 떠난 이유는 무엇인가요?", "이전 회사를 떠난 이유", "퇴사 이유"],
      answer: `이전 회사에서 전 과정의 비주얼 제작을 완수하는 탄탄한 경험을 쌓은 뒤, 디자인에는 실행력뿐 아니라 깊이 있는 미적 소양과 글로벌 시각이 필요하다는 것을 깨달았습니다. 당시의 커리어 한계를 넘기 위해 한국에서 디자인 석사 과정을 공부하기로 했습니다. 이 경험을 통해 디자인 이론과 심미적 판단력을 체계적으로 높였고, 국제적인 관점에서 브랜드와 시장을 바라보는 법도 배웠습니다. 중국으로 돌아온 후 실무를 이어 갈 수 있도록 더 단단한 이론적 기반을 마련했습니다.`,
    },
    location: {
      keys: ["현재 어디에 있나요?", "지금 어디에 있나요", "현재 위치"],
      answer: `Cooper의 고향은 저장성이지만, 세상을 탐험하기를 좋아해 지금은 산과 자연 속에 있을 수도 있습니다. XiaoCoo는 본인에게 직접 연락해 보시기를 권합니다.
이메일: liangshicheng303@126.com
WeChat: llqsc1122`,
    },
    "ellen-valve": {
      keys: ["엘렌 밸브", "이전 회사에서 한 일"],
      answer: `주요 역할: 제품 비주얼 디자이너
브랜드의 전 과정에 걸친 비주얼 제작을 담당하며, 비주얼 전략으로 제품의 시장 경쟁력을 높였습니다.
비주얼 마케팅과 구매 전환: Amazon 상세 페이지를 제작했습니다. 제품의 강점을 깊이 파악하고 구매로 이어지는 시각적 경로를 개선해 클릭률과 구매 전환율을 높이고자 했습니다.
브랜드 비주얼 체계: 제품 촬영, 포스터 디자인, 전시회 자료 제작을 총괄해 온라인 커머스와 오프라인 전시회에서 일관된 브랜드 이미지를 유지했습니다.
멀티미디어 콘텐츠: 공장 홍보 영상의 기획, 촬영, 편집을 맡았습니다. 영상 언어로 브랜드의 신뢰성을 뒷받침하고 사용자의 신뢰를 높였습니다.`,
    },
    education: {
      keys: ["학력", "교육 배경", "어디에서 공부했나요"],
      answer: `저는 줄곧 디자인을 전공했습니다. 먼저 샤먼에서 3년제 전문대 과정을 마친 뒤 한국에서 학사 과정을 이어 갔습니다. GPA 4.5/5.0의 성적으로 같은 대학의 같은 전공에서 석사 과정을 계속할 기회를 얻었습니다. 학업 과정에서 전문 역량을 심화하는 동시에 다양한 문화 속에서 공부하고 적응하는 경험을 쌓았습니다. 현재는 졸업 후 중국으로 돌아와 배운 것을 실무에 활용할 수 있는 디자인 관련 직무를 찾고 있습니다.
한국에서는 대구가톨릭대학교에서 융합디자인을 공부했습니다. 석사 GPA는 4.5/5.0입니다.`,
    },
  },
};
