# Soft Shelter 治愈系咖啡厅 — Blender 3D 场景提示词

> 基于《以情绪治愈为核心的复合型治愈系咖啡空间》企划方案 + 平面布局图生成

---

## 一、场景总提示词（Master Prompt）

```
Create a 3D interior scene of "Soft Shelter" — an emotional healing composite cafe space.
Style: Japandi / Scandinavian minimalism, biophilic design, low-saturation warm palette.
Dimensions: 28m × 20m rectangular floor plan, ceiling height 3.2m.
Mood: quiet, warm, companionable, slow-paced, immersive relaxation.
Materials: light oak wood, cream white micro-cement walls, linen/cotton upholstery, frosted glass partitions, ceramic planters.
Lighting: warm yellow indirect lighting (2700K–3000K), recessed ceiling spots, pendant lights over bar, floor lamps in lounge corners, large side windows with natural daylight.
Color palette: cream white #F5F0E8, light wood #C4A06A, oatmeal #E8DFD0, caramel #B8896A, sage green #8FA085 accents.
Camera: elevated 45° overview showing all functional zones.
Render: Cycles, soft shadows, ambient occlusion, photorealistic but calm.
```

---

## 二、功能分区提示词

### 1. 咖啡区 Coffee Zone（空间中心，入口首达）

```
Central U-shaped white solid-surface service counter (6m wide) with built-in sinks and prep surfaces.
Front customer bar: long light-oak counter (7.5m) with integrated sage-green planters.
Five minimalist bar stools with beige linen seats and thin black metal legs.
Two cream pendant lights hanging above the bar area.
Warm coffee aroma atmosphere — hand-drip coffee display area on back counter.
Semi-open layout connecting to entrance double glass doors at south wall center.
Keywords: 原木色, 奶油色, 暖黄灯光, 半开放式吧台, 手冲咖啡展示, 治愈系甜品陈列
```

### 2. 自习区 Study Zone（北侧玻璃隔间）

```
Glass-enclosed co-working room (10m × 5m) at top-center of floor plan.
Three long communal light-wood tables (3.5m each) with 4 grey fabric chairs per side.
Built-in oak shelving along north and west interior walls.
Acoustic dampening implied by glass partition thickness.
Natural daylight from side windows, individual reading lamp feel per seat.
Keywords: 单人隔断座位, 降噪, 大面积自然采光, 舒适感而非压迫式学习
```

### 3. 休息区 Healing Lounge（西侧）

```
Large organic kidney-shaped wooden platform (7m × 4.4m) with built-in white cushioned curved seating.
Five round oak dining tables (0.9m diameter) with 4 beige chairs each surrounding the island.
Bottom-left corner: grey L-sofa + white pumpkin armchair + side table.
"Mood Wall" cream panel for emotional check-in.
"Daze Corner" soft seating arrangement.
Keywords: 懒人沙发, 地毯抱枕, 暖光落地灯, 发呆角, 树洞留言墙
```

### 4. 萌宠互动区 Pet Healing Zone（东侧中部）

```
Glass-walled pet-friendly room (7m × 5m) at middle-right.
Circular modular beige sofa (8 segments) at center.
Three multi-level cat trees with platforms and enclosed cat houses.
One transparent glass cat house.
Low-stimulus sage green floor cushions.
Wall-mounted grey sofa along east wall.
Keywords: 猫爬架, 透明猫屋, 低刺激色彩, 宠物休息隔离区, 情绪陪伴
```

### 5.  cozy 休憩角 Cozy Lounge（东南角）

```
L-shaped and straight sofas in beige and grey fabrics.
Organic kidney-shaped low coffee table (scaled wood sphere).
"Tree Hole Message Board" wooden panel on east wall.
Large potted plant in corner.
Keywords: 壁炉投影氛围, 香薰, 暖光落地灯, Residential relaxed feel
```

### 6. 卫生间 Restrooms（西北 & 东北角）

```
Two symmetric restroom blocks, each with 3 stalls and shared vanity counter.
White solid-surface vanities, frosted glass entry doors.
```

---

## 三、材质与色彩系统

| 材质 | 色值 (sRGB) | 用途 |
|------|------------|------|
| 奶油白 Cream | (0.96, 0.94, 0.88) | 墙面、猫屋、吊灯 |
| 浅木色 Light Oak | (0.75, 0.58, 0.38) | 桌子、吧台、猫爬架 |
| 深橡木 Deep Oak | (0.68, 0.52, 0.32) | 搁架、圆凳、咖啡桌 |
| 米色布艺 Beige Fabric | (0.82, 0.76, 0.68) | 沙发、坐垫、吧凳 |
| 灰色布艺 Grey Fabric | (0.55, 0.54, 0.52) | 自习椅、L沙发 |
| 白色布艺 White Fabric | (0.94, 0.93, 0.90) | 岛台卡座、单人椅 |
| 鼠尾草绿 Sage | (0.55, 0.62, 0.52) | 吧台花盆、宠物坐垫 |
| 植物绿 Plant Green | (0.25, 0.45, 0.28) | 14 株室内绿植 |
| 白色台面 White Counter | (0.98, 0.98, 0.96) | U型吧台、卫生间台盆 |
| 磨砂玻璃 Frosted Glass | (0.85, 0.90, 0.88) | 隔断、门窗 |

---

## 四、灯光设计

```
主光源: 暖黄光 Area Light 网格 (4m 间距, 色温 ~3000K, energy=15)
 accent: 3 盏 Point Light 落地灯 (energy=40, 色温 ~2700K)
环境: World Background (0.95, 0.92, 0.88, strength=0.4)
原则: 无主灯间接照明, 避免商业白光压迫感, 支持夜间低亮度模式
```

---

## 五、Blender 场景结构

```
SoftShelter_Cafe/
├── Architecture/     # 地板、外墙、玻璃隔断、门窗、卫生间
├── Furniture/        # 吧台、桌椅、沙发、猫爬架、留言墙
├── Plants/           # 14 组盆栽 (ceramic pot + foliage sphere)
└── Lighting/         # 嵌入式顶灯 + 落地灯
```

**场景统计:** 230 个对象 · 17 种材质 · Cycles 渲染 · 28×20m 空间

---

## 六、动线逻辑（由动到静）

```
入口(南) → 咖啡区(香氛+灯光第一层放松) → 休息区(社交缓冲)
         → 自习区(深处安静) ← 萌宠区(视觉核心, 情绪温度)
```

---

## 七、后续优化建议

1. **资产替换**: 用 Sketchfab/Polyhaven 下载 MUJI/Scandinavian 风格精细家具替换方块占位
2. **贴图**: 从 Polyhaven 下载 `light_wood`, `concrete`, `fabric` 纹理替换纯色材质
3. **HDRI**: 使用 Polyhaven 暖色室内 HDRI 增强环境光
4. **细节**: 添加咖啡机、杯具、便签墙贴、情绪菜单牌等道具
5. **渲染**: 提升 Cycles samples 至 256+，开启 Denoise
