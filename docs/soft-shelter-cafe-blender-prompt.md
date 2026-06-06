# Soft Shelter 治愈系咖啡厅 — Blender 3D 场景提示词（修正版）

> 基于平面图精确对齐布局 · 22m × 16m · 入口朝南

---

## 布局对照（与平面图一致）

```
                    [RR×2]    [自习区玻璃房]    [RR×3]
                       ┌─────────────────────────┐
    有机座区           │  3×纵向长桌 + 搁架      │  猫咖封闭房
  (肾形岛台+圆桌)      ├──────────┬──────────────┤
                       │          │  圆形卡座     │
                       │  U型吧台 │  猫爬架       │
                       │ (偏右)   ├──────────────┤
  左下休憩角           │  矮planter│ 右下开放L沙发 │
                       └────入口(南)─────────────┘
```

| 区域 | 平面位置 | 关键元素 |
|------|---------|---------|
| 入口 | 南墙中央 | 双开玻璃门 |
| 咖啡区 | 中心偏右 (x≈2) | 白色U型台 + 南侧木吧台 + 矮planter隔断 |
| 自习区 | 顶部中央 (y:3.2~7.6) | 玻璃围合 · 3张纵向长桌 · 北+西搁架 |
| 有机座区 | 左侧 (x:-9~-4) | 肾形抬升岛 · 内置白卡座 · 5组圆桌 |
| 左下休憩 | 西南角 | 灰长沙发 + 白花形椅 |
| 猫咖区 | 中右封闭 (x:4.8~10.8, y:-0.5~4.8) | 圆形卡座 · 猫爬架 · 玻璃西墙 |
| 右下休憩 | 东南开放 (y:-7.5~-2.5) | L形米+灰沙发 · 有机咖啡桌 |
| 卫生间 | 西北2间 / 东北3间 | 台盆 + 隔间 |

---

## Master Prompt

```
3D interior "Soft Shelter" healing cafe, top-down accurate layout 22m×16m.
Japandi minimalism, biophilic, low-saturation warm palette.
South entrance → customer bar → U-kitchen slightly right of center.
North glass study room with 3 vertical communal tables.
West organic kidney island with built-in seating.
East enclosed cat cafe with circular sofa + cat trees.
Southeast open lounge with L-sofas.
Materials: cream tile floor, light oak, white counters, beige/grey linen, sage planters.
Lighting: warm 3000K recessed grid + floor lamps, side window daylight.
```

---

## 分区提示词

### 咖啡区（偏右中心）
```
White U-shaped service counter (opens south), 2 sinks + 2 hobs on back wall.
South-facing light-oak customer bar (5.5m) with integrated sage planters at ends.
Low wooden planter partition (8m) between entrance and bar zone.
5 bar stools, 2 cream pendant lights.
Position: center x≈2, between entrance (y=-8) and study zone (y=3.2).
```

### 自习区（正北玻璃房）
```
Glass enclosure 10m×4.4m at top-center.
THREE long tables oriented vertically (north-south axis), chairs 4-5 per side.
Oak shelving on north wall + west interior wall.
Large potted plants in four corners.
Keywords: 降噪 · 自然采光 · 舒适感
```

### 有机座区（西侧）
```
Kidney-shaped raised platform (x:-6.5) with white curved built-in benches.
3 circular tree cutouts with indoor plants on island.
5 round dining tables (4 chairs each) scattered around island.
Bottom-left: grey sofa + white pumpkin armchair + side table.
```

### 猫咖区（中右封闭）
```
Walled room with glass west face toward main hall.
Circular modular beige sofa (10 segments) around central planter pillar.
3 floor-to-ceiling cat trees (beige poles + platforms + cat houses).
Small round tables, wooden desk, grey corner sofa.
Sage floor cushions.
```

### 右下开放休憩
```
NOT enclosed — open to main hall below cat room.
L-shaped beige sectional + L-shaped grey sectional at southeast corner.
Organic pebble-shaped low coffee table.
```

---

## 色彩 / 材质

| 名称 | RGB | 用途 |
|------|-----|------|
| 奶油地砖 | (0.93, 0.90, 0.84) | 全场地面 |
| 浅橡木 | (0.72, 0.55, 0.36) | 吧台、桌子、搁架 |
| 白色台面 | (0.98, 0.98, 0.96) | U型服务台 |
| 米灰布艺 | (0.80, 0.74, 0.66) / (0.52, 0.51, 0.50) | 沙发椅 |
| 鼠尾草绿 | (0.52, 0.60, 0.50) | 花盆、地垫 |

---

## Blender 场景

- 文件: `assets/soft-shelter-cafe.blend`
- 对象: ~254 · 材质: 14 · 相机: TopDown + 3D透视
- 集合: `Architecture` / `Furniture` / `Plants` / `Lighting`
