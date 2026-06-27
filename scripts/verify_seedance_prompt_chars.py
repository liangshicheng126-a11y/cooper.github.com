# -*- coding: utf-8 -*-
"""Print character counts for Seedance prompts in docs/seedance-wukuchu-15s-prompt.md."""
from pathlib import Path

DOC = Path(__file__).resolve().parent.parent / "docs" / "seedance-wukuchu-15s-prompt.md"
LIMIT = 5000

PROMPTS = {
    "中文版主提示词": """【影片类型】15秒 cinematic mountaineering short film opening，四川贡嘎南延·乌库楚雪山（5526m），纪录片质感，电影级调色，无对白，无口型。

【整体风格】IMAX 级高山风光 + 人文攀登预告片开场；真实户外摄影感，非动画非游戏；镜头运动流畅、转场自然；色彩：前段暖金日出 → 中段冷雾蓝灰 → 末段蓝调营地 + 暖色头灯点光；轻微胶片颗粒，高动态范围，浅景深长焦压缩感。

【严格时间轴 · 15秒单条连续镜头序列】

0:00–0:02｜镜1-1
广角固定机位，四川高海拔 alpine meadow 3700–4000m，前景浅绿草甸与野花，一名穿冲锋衣的登山者从画面左侧走入又走出；焦点 rack focus：先清晰人物背影，再平滑转焦到远处乌库楚 sharp 金字塔主峰；晨间薄雾，虫鸣鸟叫般的宁静氛围（画面无字幕）。

0:02–0:04｜镜1-2
切至或叠化：无人机 cinematic orbit 环绕乌库楚主峰，清晨 golden hour 金色侧光打在雪脊，脚下 sea of clouds 翻涌；从超远景 slow push-in，山峰体量巨大，人影不可见；风力感、庄严史诗感。

0:04–0:07｜镜1-3
长焦 telephoto 70–200mm 压缩感：BC 大本营 4300m 晨雾中，贡嘎群峰与乌库楚同框，强调接近性与尺度对比；帐篷与经幡若隐若现；鼓点渐起的紧张期待（仅视觉节奏，无音频）。

0:07–0:10｜镜1-4
日出时分长焦山峰特写：金色天光擦过雪坡，画面中若隐若现的攀登路线；画面底部或中央浮现简洁白色字幕（中文）：「乌库楚 5526m · 贡嘎南延」，字体无衬线、半透明、纪录片风格，2秒后淡出。

0:10–0:13｜镜2-1
黎明 blue hour，C1 营地 5000m：多顶登山帐篷在微光中，远处雪山轮廓初现；整体暖色白平衡约 5200K，长曝光般的柔和噪点与营地灯点；字幕：「C1 海拔 5000m」，同样简洁纪录片字幕。

0:13–0:15｜镜2-2
第一人称 POV 手持近摄：双手穿 crampons 冰爪、金属 carabiner 锁扣碰撞、拉紧冲锋衣拉链，头灯 warm beam 照亮 Gore-Tex 面料与冰镐金属；浅景深 macro 质感，为后续攀登段落做铺垫；结束于锁扣「咔哒」瞬间的定格感。

【镜头语言】rack focus、drone orbit、telephoto compression、POV macro；转场用 light leak / 雾化叠化，禁止硬切闪白；人物面部尽量不正面特写（本段以环境与人影/POV手为主）。

【禁止】卡通、3D渲染、城市建筑、错误雪山造型、多余文字水印、logo、血腥、极限运动广告风夸张慢动作、人物对话口型。

【画幅】16:9 横屏，720p，全程 15 秒，一镜到底式 montage 节奏，每段 2–3 秒。""",
    "带@image参考图版": """以 @image 1 中的乌库楚山峰形态、雪线走向与晨光色调为准；若有 @image 2，末段 C1 营地与装备 POV 向其色调与构图靠拢。

【影片类型】15秒 cinematic mountaineering short film opening，四川贡嘎南延·乌库楚雪山（5526m），纪录片质感，电影级调色，无对白，无口型。

【整体风格】IMAX 级高山风光 + 人文攀登预告片开场；真实户外摄影感，非动画非游戏；镜头运动流畅、转场自然；色彩：前段暖金日出 → 中段冷雾蓝灰 → 末段蓝调营地 + 暖色头灯点光；轻微胶片颗粒，高动态范围，浅景深长焦压缩感。

【严格时间轴 · 15秒单条连续镜头序列】

0:00–0:02｜镜1-1
广角固定机位，四川高海拔 alpine meadow 3700–4000m，前景浅绿草甸与野花，一名穿冲锋衣的登山者从画面左侧走入又走出；焦点 rack focus：先清晰人物背影，再平滑转焦到远处与 @image 1 一致的乌库楚金字塔主峰；晨间薄雾，宁静氛围（画面无字幕）。

0:02–0:04｜镜1-2
切至或叠化：无人机 cinematic orbit 环绕 @image 1 同款主峰，清晨 golden hour 金色侧光打在雪脊，脚下 sea of clouds 翻涌；从超远景 slow push-in，山峰体量巨大；庄严史诗感。

0:04–0:07｜镜1-3
长焦 telephoto 压缩感：BC 大本营 4300m 晨雾中，贡嘎群峰与乌库楚同框，帐篷与经幡若隐若现；强调接近性与尺度对比。

0:07–0:10｜镜1-4
日出时分长焦山峰特写：金色天光擦过雪坡，若隐若现攀登路线；简洁白色字幕：「乌库楚 5526m · 贡嘎南延」，2秒后淡出。

0:10–0:13｜镜2-1
黎明 blue hour，C1 营地 5000m：多顶登山帐篷微光，远处雪山轮廓；暖色白平衡 5200K；字幕：「C1 海拔 5000m」。

0:13–0:15｜镜2-2
POV 手持近摄：穿冰爪、扣锁扣、头灯照装备；浅景深 macro；结束于锁扣定格。若有 @image 2，末 2 秒向该图构图过渡。

【镜头语言】rack focus、drone orbit、telephoto compression、POV macro；雾化叠化转场；无硬切闪白。

【禁止】卡通、3D渲染、城市建筑、错误雪山造型、水印、logo、对话口型。

【画幅】16:9，720p，15 秒。""",
    "英文精简版": """15-second cinematic opening, Wukuchu peak 5526m, southern extension of Gongga range, Sichuan alpine mountaineering documentary. Photorealistic, IMAX mountain scale, film grain, no dialogue, no lip sync, 16:9.

Beat 1 (0-2s): Wide static shot, alpine meadow 3700m, climber walks through frame; rack focus from hiker to distant sharp pyramidal snow peak.

Beat 2 (2-4s): Drone slow orbit + push-in, golden sunrise sidelight on ridge, sea of clouds below, epic scale.

Beat 3 (4-7s): Long telephoto compression, base camp morning mist, Gongga massif and Wukuchu in same frame, tents and prayer flags, sense of proximity.

Beat 4 (7-10s): Sunrise telephoto peak, golden light on snow route; clean documentary subtitle: "乌库楚 5526m · 贡嘎南延".

Beat 5 (10-13s): Blue hour C1 camp 5000m, tents in dim light, mountain silhouettes; subtitle: "C1 5000m".

Beat 6 (13-15s): POV macro, hands fixing crampons, locking carabiners, headlamp on gear, metal click freeze.

Smooth fog dissolves between beats. Warm gold to cool blue to warm headlamp accent. No cartoon, no CGI game look, no extra logos.""",
    "A段0-8s": """8秒 cinematic opening，乌库楚雪山 5526m，贡嘎南延，纪录片质感，16:9，无对白。

0-2s：高山草甸广角，登山者走过，rack focus 从人转到远处金字塔雪峰。
2-4s：无人机环绕主峰，金色侧光，脚下云海，slow push-in。
4-8s：长焦压缩，BC 晨雾中贡嘎群峰与乌库楚同框，帐篷经幡，强调巨大尺度。

暖金色调，雾化叠化转场，真实摄影感，禁止卡通与 3D。""",
    "B段7-15s": """8秒 cinematic mountaineering，乌库楚攀登预告，16:9，无对白。

0-3s：日出长焦山峰，金色天光，若隐若现路线；字幕「乌库楚 5526m · 贡嘎南延」。
3-6s：blue hour C1 营地 5000m，帐篷微光，雪山轮廓；字幕「C1 海拔 5000m」。
6-8s：POV 特写穿冰爪、扣锁扣，头灯照装备，金属质感定格。

暖金转蓝调再点头灯暖光，纪录片调色，禁止 logo 与口型。""",
    "三镜精简版": """15秒乌库楚攀登开场 montage，16:9 纪录片质感。三镜：①无人机环绕主峰金色侧光云海 5s；②长焦日出雪峰特写金色天光 5s；③POV 头灯照冰爪锁扣特写 5s。雾化叠化，暖金到冷蓝，无对白，真实户外摄影，禁止卡通。""",
}


def main():
    print(f"Doc: {DOC}")
    print(f"Limit: {LIMIT} characters\n")
    all_ok = True
    for name, text in PROMPTS.items():
        n = len(text)
        ok = n <= LIMIT
        all_ok = all_ok and ok
        status = "OK" if ok else "OVER LIMIT"
        print(f"  {name}: {n} chars [{status}]")
    print()
    print("All within limit." if all_ok else "Some prompts exceed limit!")
    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
