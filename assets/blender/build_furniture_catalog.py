"""
Soft Shelter 家具目录 — 依据参考图等距布局建模
在 Blender 中运行: Scripting 工作区 → Open → Run Script
或: blender --background --python build_furniture_catalog.py
重复物件只建一份，通过 collection 实例化复用。
"""

import math
import os
from math import radians

import bpy
import bmesh
from mathutils import Vector

# ---------------------------------------------------------------------------
# Paths & palette
# ---------------------------------------------------------------------------
ASSET_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(ASSET_DIR)
CACHE = os.path.join(ROOT_DIR, "blender-cache")
BLEND_OUT = os.path.join(ROOT_DIR, "furniture-catalog.blend")

WOOD = (0.82, 0.67, 0.46, 1.0)
WOOD_DARK = (0.72, 0.56, 0.38, 1.0)
FABRIC = (0.90, 0.84, 0.76, 1.0)
FABRIC_DARK = (0.68, 0.60, 0.52, 1.0)
FABRIC_GREY = (0.74, 0.72, 0.68, 1.0)
METAL = (0.78, 0.76, 0.72, 1.0)
STONE = (0.96, 0.94, 0.90, 1.0)
PLANT = (0.38, 0.58, 0.36, 1.0)
RUG = (0.80, 0.72, 0.58, 1.0)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col)
    root = bpy.context.scene.collection
    for child in list(root.children):
        root.children.unlink(child)
    for block in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def ensure_collection(name, parent=None):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        if parent is None:
            bpy.context.scene.collection.children.link(col)
        else:
            parent.children.link(col)
    return col


def link_obj(obj, collection):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    collection.objects.link(obj)


def bevel(obj, width=0.008, segments=2):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = radians(35)
    return mod


def shade_smooth(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)


def box(name, size, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, col=None):
    sx, sy, sz = size
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (sx / 2, sy / 2, sz / 2)
    obj.rotation_euler = rot
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    if mat:
        assign_mat(obj, mat)
    if col:
        link_obj(obj, col)
    bevel(obj, width=min(sx, sy, sz) * 0.015)
    shade_smooth(obj)
    return obj


def cylinder(name, radius, depth, loc=(0, 0, 0), rot=(0, 0, 0), mat=None, col=None, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=depth, vertices=verts, location=loc
    )
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    if mat:
        assign_mat(obj, mat)
    if col:
        link_obj(obj, col)
    bevel(obj, width=radius * 0.04)
    shade_smooth(obj)
    return obj


def get_principled_bsdf(mat):
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        for node in mat.node_tree.nodes:
            if node.type == "BSDF_PRINCIPLED":
                return node
    return bsdf


def make_material(name, color, roughness=0.55, specular=0.25, tex_path=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = get_principled_bsdf(mat)
    if bsdf is None:
        raise RuntimeError("Principled BSDF node not found")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = specular
    elif "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = specular
    if tex_path and os.path.isfile(tex_path):
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(tex_path, check_existing=True)
        tex.location = (-400, 200)
        mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        if tex.image and hasattr(tex.image, "colorspace_settings"):
            tex.image.colorspace_settings.name = "sRGB"
    return mat


def assign_mat(obj, mat):
    if not obj.data.materials:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat


def parent_keep_world(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def build_materials():
    wood_tex = os.path.join(CACHE, "wood_diff.jpg")
    mats = {
        "wood": make_material("Wood_LightOak", WOOD, 0.48, 0.3, wood_tex),
        "wood_dark": make_material("Wood_MediumOak", WOOD_DARK, 0.52, 0.28, wood_tex),
        "fabric": make_material("Fabric_Beige", FABRIC, 0.92, 0.12),
        "fabric_dark": make_material("Fabric_Taupe", FABRIC_DARK, 0.9, 0.1),
        "fabric_grey": make_material("Fabric_Grey", FABRIC_GREY, 0.88, 0.12),
        "metal": make_material("Metal_Light", METAL, 0.35, 0.45),
        "stone": make_material("Stone_Counter", STONE, 0.25, 0.4),
        "plant": make_material("Plant_Green", PLANT, 0.75, 0.15),
        "rug": make_material("Rug_Beige", RUG, 0.95, 0.05),
    }
    for m in mats.values():
        m.blend_method = "OPAQUE"
    return mats


# ---------------------------------------------------------------------------
# Furniture builders — each returns root empty
# ---------------------------------------------------------------------------
def build_conference_desk(mats, col):
    root = bpy.data.objects.new("ConferenceDesk", None)
    col.objects.link(root)
    top = box("DeskTop", (3.6, 1.05, 0.055), (0, 0, 0.74), mat=mats["wood"], col=col)
    divider = box("Divider", (3.4, 0.022, 0.22), (0, 0, 0.855), mat=mats["wood"], col=col)
    for i, x in enumerate((-1.65, 0.0, 1.65)):
        leg = box(f"Leg{i}", (0.06, 1.0, 0.72), (x, 0, 0.36), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    for i, x in enumerate((-0.55, 0.55)):
        cut = box(f"Cutout{i}", (0.12, 0.03, 0.08), (x, 0, 0.88), mat=mats["wood_dark"], col=col)
        parent_keep_world(cut, root)
    parent_keep_world(top, root)
    parent_keep_world(divider, root)
    return root


def build_office_desk(mats, col, with_drawers=False):
    name = "OfficeDesk_Drawers" if with_drawers else "OfficeDesk"
    root = bpy.data.objects.new(name, None)
    col.objects.link(root)
    top = box("Top", (1.4, 0.7, 0.04), (0, 0, 0.74), mat=mats["wood"], col=col)
    side_l = box("SideL", (0.04, 0.66, 0.72), (-0.66, 0, 0.36), mat=mats["wood"], col=col)
    side_r = box("SideR", (0.04, 0.66, 0.72), (0.66, 0, 0.36), mat=mats["wood"], col=col)
    parent_keep_world(top, root)
    parent_keep_world(side_l, root)
    parent_keep_world(side_r, root)
    if with_drawers:
        unit = box("DrawerUnit", (0.42, 0.58, 0.58), (0.46, 0, 0.29), mat=mats["wood"], col=col)
        for i, z in enumerate((0.52, 0.34, 0.16)):
            front = box(f"Drawer{i+1}", (0.38, 0.02, 0.14), (0.46, -0.28, z), mat=mats["wood_dark"], col=col)
            handle = cylinder(f"Handle{i+1}", 0.008, 0.08, (0.46, -0.295, z), rot=(radians(90), 0, 0), mat=mats["metal"], col=col)
            parent_keep_world(front, root)
            parent_keep_world(handle, root)
        parent_keep_world(unit, root)
    return root


def build_office_chair(mats, col):
    root = bpy.data.objects.new("OfficeChair", None)
    col.objects.link(root)
    seat = box("Seat", (0.44, 0.42, 0.07), (0, 0, 0.46), mat=mats["fabric"], col=col)
    back = box("Back", (0.44, 0.05, 0.48), (0, -0.18, 0.74), mat=mats["fabric"], col=col)
    for row, z in enumerate((0.58, 0.72, 0.86)):
        for col_i, x in enumerate((-0.12, 0.0, 0.12)):
            mesh_patch = box(
                f"Mesh_{row}_{col_i}",
                (0.1, 0.02, 0.1),
                (x, -0.205, z),
                mat=mats["fabric_grey"],
                col=col,
            )
            parent_keep_world(mesh_patch, root)
    for side, x in (("L", -0.22), ("R", 0.22)):
        arm = box(f"Arm{side}", (0.04, 0.26, 0.05), (x, -0.02, 0.58), mat=mats["metal"], col=col)
        pad = box(f"ArmPad{side}", (0.05, 0.18, 0.025), (x, 0.02, 0.62), mat=mats["fabric"], col=col)
        parent_keep_world(arm, root)
        parent_keep_world(pad, root)
    stem = cylinder("Stem", 0.035, 0.16, (0, 0, 0.28), mat=mats["metal"], col=col)
    hub = cylinder("Hub", 0.055, 0.04, (0, 0, 0.16), mat=mats["metal"], col=col)
    for i in range(5):
        ang = i * (2 * math.pi / 5) + math.pi / 10
        caster = box(
            f"Leg{i}",
            (0.03, 0.22, 0.03),
            (math.sin(ang) * 0.24, math.cos(ang) * 0.24, 0.1),
            rot=(0, ang, 0),
            mat=mats["metal"],
            col=col,
        )
        wheel = cylinder(
            f"Wheel{i}",
            0.022,
            0.018,
            (math.sin(ang) * 0.34, math.cos(ang) * 0.34, 0.03),
            rot=(radians(90), 0, 0),
            mat=mats["metal"],
            col=col,
        )
        parent_keep_world(caster, root)
        parent_keep_world(wheel, root)
    parent_keep_world(seat, root)
    parent_keep_world(back, root)
    parent_keep_world(stem, root)
    parent_keep_world(hub, root)
    return root


def build_curved_sofa(mats, col):
    root = bpy.data.objects.new("CurvedSofa", None)
    col.objects.link(root)
    arc_segments = 18
    inner_r, depth, height = 1.2, 0.52, 0.34
    for i in range(arc_segments):
        t0 = i / arc_segments
        t1 = (i + 1) / arc_segments
        a0 = math.pi * 0.52 + t0 * math.pi * 0.82
        a1 = math.pi * 0.52 + t1 * math.pi * 0.82
        mid_a = (a0 + a1) / 2
        cx = math.cos(mid_a) * (inner_r + depth * 0.5)
        cy = math.sin(mid_a) * (inner_r + depth * 0.5)
        seg_len = inner_r * (a1 - a0) * 1.08
        seg = box(
            f"Seg{i}",
            (seg_len, depth + 0.02, height),
            (cx, cy, 0.36),
            rot=(0, 0, mid_a + math.pi / 2),
            mat=mats["fabric"],
            col=col,
        )
        parent_keep_world(seg, root)
    for i, (x, y, s, dark) in enumerate(
        [
            (-0.15, 1.35, 0.22, False),
            (0.45, 1.55, 0.2, True),
            (0.95, 1.05, 0.18, False),
            (-0.35, 0.65, 0.16, True),
        ]
    ):
        pillow = box(
            f"Pillow{i}",
            (s, s, 0.07),
            (x, y, 0.58),
            mat=mats["fabric_dark"] if dark else mats["fabric"],
            col=col,
        )
        parent_keep_world(pillow, root)
    return root


def build_straight_sofa(mats, col):
    root = bpy.data.objects.new("StraightSofa", None)
    col.objects.link(root)
    frame = box("Frame", (1.6, 0.78, 0.14), (0, 0, 0.12), mat=mats["wood"], col=col)
    seat = box("Seat", (1.45, 0.62, 0.16), (0, 0.02, 0.28), mat=mats["fabric"], col=col)
    back = box("Back", (1.45, 0.14, 0.38), (0, -0.28, 0.48), mat=mats["fabric"], col=col)
    for i, x in enumerate((-0.35, 0.35)):
        cushion = box(f"Cushion{i}", (0.62, 0.58, 0.12), (x, 0.02, 0.34), mat=mats["fabric"], col=col)
        parent_keep_world(cushion, root)
    for i, x in enumerate((-0.35, 0.35)):
        lumbar = box(f"Lumbar{i}", (0.42, 0.22, 0.1), (x, -0.22, 0.52), mat=mats["fabric_grey"], col=col)
        parent_keep_world(lumbar, root)
    parent_keep_world(frame, root)
    parent_keep_world(seat, root)
    parent_keep_world(back, root)
    return root


def build_armchair(mats, col):
    root = bpy.data.objects.new("Armchair", None)
    col.objects.link(root)
    # 环抱式木框 — 三段弧板 + 四脚
    for i, (x, y, rot, size) in enumerate(
        [
            (0, 0.28, 0, (0.48, 0.06, 0.38)),
            (-0.24, 0.0, radians(90), (0.42, 0.06, 0.38)),
            (0.24, 0.0, radians(90), (0.42, 0.06, 0.38)),
        ]
    ):
        rail = box(f"Rail{i}", size, (x, y, 0.38), rot=(0, 0, rot), mat=mats["wood"], col=col)
        parent_keep_world(rail, root)
    for x, y in ((0.18, 0.18), (-0.18, 0.18), (0.18, -0.18), (-0.18, -0.18)):
        leg = cylinder("Leg", 0.025, 0.18, (x, y, 0.09), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    seat = box("SeatCushion", (0.38, 0.38, 0.1), (0, 0.02, 0.24), mat=mats["fabric"], col=col)
    back = box("BackCushion", (0.36, 0.1, 0.32), (0, -0.2, 0.46), mat=mats["fabric"], col=col)
    parent_keep_world(seat, root)
    parent_keep_world(back, root)
    return root


def build_bar_stool(mats, col):
    root = bpy.data.objects.new("BarStool", None)
    col.objects.link(root)
    seat = cylinder("Seat", 0.16, 0.05, (0, 0, 0.76), mat=mats["wood"], col=col)
    for i in range(4):
        ang = i * (math.pi / 2) + math.pi / 4
        leg = cylinder(f"Leg{i}", 0.025, 0.72, (math.sin(ang) * 0.11, math.cos(ang) * 0.11, 0.38), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    footrest = cylinder("Footrest", 0.14, 0.025, (0, 0, 0.22), mat=mats["wood"], col=col)
    parent_keep_world(seat, root)
    parent_keep_world(footrest, root)
    return root


def build_low_stool(mats, col, legs=4):
    root = bpy.data.objects.new(f"LowStool_{legs}L", None)
    col.objects.link(root)
    seat = cylinder("Seat", 0.14, 0.04, (0, 0, 0.44), mat=mats["wood"], col=col)
    for i in range(legs):
        ang = i * (2 * math.pi / legs)
        leg = cylinder(f"Leg{i}", 0.028, 0.42, (math.sin(ang) * 0.08, math.cos(ang) * 0.08, 0.21), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    parent_keep_world(seat, root)
    return root


def build_pouf(mats, col):
    root = bpy.data.objects.new("Pouf", None)
    col.objects.link(root)
    body = cylinder("Body", 0.22, 0.28, (0, 0, 0.16), mat=mats["fabric"], col=col)
    strap = cylinder("Strap", 0.23, 0.02, (0, 0, 0.28), mat=mats["fabric_dark"], col=col)
    parent_keep_world(body, root)
    parent_keep_world(strap, root)
    return root


def build_coffee_table_pedestal(mats, col):
    root = bpy.data.objects.new("CoffeeTable_Pedestal", None)
    col.objects.link(root)
    top = cylinder("Top", 0.55, 0.06, (0, 0, 0.38), mat=mats["wood"], col=col)
    base = cylinder("Base", 0.28, 0.32, (0, 0, 0.16), mat=mats["wood"], col=col)
    parent_keep_world(top, root)
    parent_keep_world(base, root)
    return root


def build_coffee_table_tripod(mats, col):
    root = bpy.data.objects.new("CoffeeTable_Tripod", None)
    col.objects.link(root)
    top = cylinder("Top", 0.42, 0.05, (0, 0, 0.36), mat=mats["wood"], col=col)
    for i in range(3):
        ang = i * (2 * math.pi / 3)
        leg = cylinder(f"Leg{i}", 0.055, 0.34, (math.sin(ang) * 0.22, math.cos(ang) * 0.22, 0.17), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    parent_keep_world(top, root)
    return root


def build_side_table_metal(mats, col):
    root = bpy.data.objects.new("SideTable_Metal", None)
    col.objects.link(root)
    top = cylinder("Top", 0.22, 0.025, (0, 0, 0.52), mat=mats["stone"], col=col)
    stem = cylinder("Stem", 0.015, 0.48, (0, 0, 0.26), mat=mats["metal"], col=col)
    base = cylinder("Base", 0.18, 0.015, (0, 0, 0.015), mat=mats["metal"], col=col)
    parent_keep_world(top, root)
    parent_keep_world(stem, root)
    parent_keep_world(base, root)
    return root


def build_side_table_wood(mats, col):
    root = bpy.data.objects.new("SideTable_Wood", None)
    col.objects.link(root)
    top = cylinder("Top", 0.18, 0.03, (0, 0, 0.48), mat=mats["wood"], col=col)
    for i in range(3):
        ang = i * (2 * math.pi / 3)
        leg = cylinder(f"Leg{i}", 0.018, 0.46, (math.sin(ang) * 0.1, math.cos(ang) * 0.1, 0.23), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    parent_keep_world(top, root)
    return root


def build_bookshelf(mats, col, cols, rows):
    root = bpy.data.objects.new(f"Bookshelf_{cols}x{rows}", None)
    col.objects.link(root)
    w, h, d = cols * 0.34 + 0.06, rows * 0.32 + 0.06, 0.32
    frame = box("Frame", (w, d, h), (0, 0, h / 2), mat=mats["wood"], col=col)
    parent_keep_world(frame, root)
    for c in range(cols + 1):
        x = -w / 2 + c * (w - 0.06) / cols
        panel = box(f"VDiv{c}", (0.025, d - 0.02, h - 0.04), (x, 0, h / 2), mat=mats["wood"], col=col)
        parent_keep_world(panel, root)
    for r in range(rows + 1):
        z = 0.03 + r * (h - 0.06) / rows
        shelf = box(f"HShelf{r}", (w - 0.04, d - 0.02, 0.025), (0, 0, z), mat=mats["wood"], col=col)
        parent_keep_world(shelf, root)
    return root


def build_kitchen_island(mats, col):
    """L 形厨房岛台 + 后侧直吧台 + 4 高脚凳 — 对齐参考图中心构件"""
    root = bpy.data.objects.new("KitchenIsland", None)
    col.objects.link(root)

    def add(name, size, loc, rot=(0, 0, 0), mat=None):
        obj = box(name, size, loc, rot=rot, mat=mat or mats["wood"], col=col)
        parent_keep_world(obj, root)
        return obj

    # --- 尺寸基准 ---
    bar_z = 1.05
    kit_z = 0.88
    long_x = 3.0
    short_y = 2.1
    shell = 0.56

    # === 1. 外侧 L 形木壳体（高吧台围合） ===
    add("ShellLong", (long_x, shell, bar_z), (0.15, 0.92, bar_z / 2))
    add("ShellShort", (shell, short_y, bar_z), (-1.35, -0.15, bar_z / 2))

    # === 2. L 形吧台台面（顶面） ===
    add("BarTopLong", (long_x, shell, 0.06), (0.15, 0.92, bar_z))
    add("BarTopShort", (shell, short_y, 0.06), (-1.35, -0.15, bar_z))

    # 外侧种植槽（沿长边）
    trough = add("PlanterTrough", (long_x - 0.25, 0.14, 0.09), (0.15, 1.18, bar_z + 0.06))
    assign_mat(trough, mats["fabric_dark"])
    for i in range(int(long_x / 0.18)):
        x = -1.25 + i * 0.18
        leaf = box(
            f"TroughPlant{i}",
            (0.06, 0.05, 0.1),
            (x, 1.18, bar_z + 0.14),
            mat=mats["plant"],
            col=col,
        )
        parent_keep_world(leaf, root)

    # === 3. 内侧 L 形操作台（白石英台面） ===
    kit_long = box(
        "KitTopLong",
        (long_x - shell - 0.15, 0.68, 0.045),
        (0.35, 0.08, kit_z),
        mat=mats["stone"],
        col=col,
    )
    kit_short = box(
        "KitTopShort",
        (0.68, short_y - shell - 0.12, 0.045),
        (-0.95, -0.35, kit_z),
        mat=mats["stone"],
        col=col,
    )
    parent_keep_world(kit_long, root)
    parent_keep_world(kit_short, root)

    # 转角圆角过渡
    corner = cylinder(
        "KitCorner",
        0.38,
        0.045,
        (-0.62, -0.02, kit_z),
        mat=mats["stone"],
        col=col,
    )
    parent_keep_world(corner, root)

    # 下方木柜体
    add("CabLong", (long_x - shell - 0.15, 0.68, 0.78), (0.35, 0.08, 0.39))
    add("CabShort", (0.68, short_y - shell - 0.12, 0.78), (-0.95, -0.35, 0.39))

    # === 4. 灶台 / 水槽 / 龙头 ===
    hob4 = box("Hob4", (0.42, 0.42, 0.018), (-0.15, 0.08, kit_z + 0.025), mat=mats["metal"], col=col)
    parent_keep_world(hob4, root)
    for i in range(4):
        bx = -0.28 + (i % 2) * 0.22
        by = -0.02 + (i // 2) * 0.22
        b = cylinder(f"Burner4_{i}", 0.042, 0.012, (bx, by, kit_z + 0.035), mat=mats["metal"], col=col)
        parent_keep_world(b, root)

    hob2 = box("Hob2", (0.28, 0.42, 0.018), (0.55, 0.08, kit_z + 0.025), mat=mats["metal"], col=col)
    parent_keep_world(hob2, root)
    for i in range(2):
        b = cylinder(f"Burner2_{i}", 0.038, 0.012, (0.48 + i * 0.14, 0.08, kit_z + 0.035), mat=mats["metal"], col=col)
        parent_keep_world(b, root)

    sink = cylinder("Sink", 0.17, 0.03, (0.95, -0.05, kit_z + 0.01), mat=mats["metal"], col=col)
    faucet = box("Faucet", (0.02, 0.02, 0.16), (0.95, -0.22, kit_z + 0.1), mat=mats["metal"], col=col)
    parent_keep_world(sink, root)
    parent_keep_world(faucet, root)

    # 抽屉面板
    for i, x in enumerate((0.55, 0.85)):
        drawer = box(f"Drawer{i}", (0.28, 0.02, 0.13), (x, -0.28, 0.32 + i * 0.22), mat=mats["wood_dark"], col=col)
        parent_keep_world(drawer, root)

    # === 5. 短臂外端开放层架 ===
    for r, z in enumerate((0.22, 0.52, 0.82)):
        shelf = box(f"OpenShelf{r}", (0.48, 0.28, 0.025), (-1.62, -0.15 - r * 0.05, z), mat=mats["wood"], col=col)
        parent_keep_world(shelf, root)
    add("ShelfPanelL", (0.025, 0.28, 0.78), (-1.86, -0.15, 0.39))
    add("ShelfPanelR", (0.025, 0.28, 0.78), (-1.38, -0.15, 0.39))
    add("ShelfBack", (0.48, 0.025, 0.78), (-1.62, -0.28, 0.39))

    # === 6. 后侧直条吧台（带种植槽，参考图长边后方） ===
    back_y = 1.55
    add("BackBarTop", (long_x + 0.35, 0.5, 0.06), (0.15, back_y, bar_z))
    add("BackBarFace", (long_x + 0.35, 0.08, 0.72), (0.15, back_y - 0.21, 0.36))
    back_trough = add("BackTrough", (long_x, 0.12, 0.08), (0.15, back_y + 0.22, bar_z + 0.06))
    assign_mat(back_trough, mats["fabric_dark"])
    for i in range(8):
        leaf = box(
            f"BackPlant{i}",
            (0.05, 0.04, 0.08),
            (-1.2 + i * 0.32, back_y + 0.22, bar_z + 0.14),
            mat=mats["plant"],
            col=col,
        )
        parent_keep_world(leaf, root)

    # === 7. 四把高脚凳（吧台下方） ===
    for i, x in enumerate((-0.9, -0.15, 0.6, 1.35)):
        stool_root = build_bar_stool(mats, col)
        stool_root.location = (x, back_y - 0.55, 0)
        stool_root.rotation_euler = (0, 0, 0)
        parent_keep_world(stool_root, root)

    # 结构支撑腿
    for x, y in [(-1.35, 0.92), (1.55, 0.92), (-1.35, -1.2), (0.2, -1.2)]:
        leg = add("SupportLeg", (0.07, 0.07, bar_z - 0.05), (x, y, (bar_z - 0.05) / 2))

    return root


def build_cat_tree(mats, col):
    root = bpy.data.objects.new("CatTree", None)
    col.objects.link(root)
    base = cylinder("Base", 0.38, 0.06, (0, 0, 0.03), mat=mats["fabric"], col=col)
    post = cylinder("Post", 0.06, 1.35, (0, 0, 0.72), mat=mats["fabric_dark"], col=col)
    for z, r in ((0.28, 0.22), (0.62, 0.24), (0.98, 0.2)):
        plat = cylinder(f"Platform_{z}", r, 0.04, (0.12 if z > 0.5 else -0.08, 0.08 if z < 0.5 else -0.05, z), mat=mats["fabric"], col=col)
        parent_keep_world(plat, root)
    basket = cylinder("Basket", 0.18, 0.14, (0, 0, 1.42), mat=mats["fabric"], col=col)
    scratch = cylinder("Scratch", 0.09, 0.35, (-0.18, 0, 0.35), mat=mats["fabric_dark"], col=col)
    parent_keep_world(base, root)
    parent_keep_world(post, root)
    parent_keep_world(basket, root)
    parent_keep_world(scratch, root)
    return root


def build_plant(mats, col, large=False):
    name = "Plant_Large" if large else "Plant_Small"
    root = bpy.data.objects.new(name, None)
    col.objects.link(root)
    pot_r = 0.18 if large else 0.09
    pot_h = 0.22 if large else 0.12
    pot = cylinder("Pot", pot_r, pot_h, (0, 0, pot_h / 2), mat=mats["fabric_dark"], col=col)
    soil = cylinder("Soil", pot_r * 0.85, 0.02, (0, 0, pot_h - 0.01), mat=mats["fabric_dark"], col=col)
    parent_keep_world(pot, root)
    parent_keep_world(soil, root)
    if large:
        trunk = cylinder("Trunk", 0.025, 0.55, (0, 0, pot_h + 0.28), mat=mats["wood_dark"], col=col)
        for i, (x, z, s) in enumerate([(0.12, 0.75, 0.22), (-0.15, 0.95, 0.18), (0.05, 1.15, 0.24), (-0.08, 0.55, 0.16)]):
            leaf = bpy.ops.mesh.primitive_uv_sphere_add(radius=s, location=(x, 0, pot_h + z))
            leaf_obj = bpy.context.active_object
            leaf_obj.name = f"Leaf{i}"
            leaf_obj.scale = (1.0, 0.55, 0.75)
            bpy.ops.object.transform_apply(scale=True)
            assign_mat(leaf_obj, mats["plant"])
            link_obj(leaf_obj, col)
            parent_keep_world(leaf_obj, root)
        parent_keep_world(trunk, root)
    else:
        for i in range(6):
            ang = i * (math.pi / 3)
            blade = box(f"Blade{i}", (0.025, 0.06, 0.14), (math.sin(ang) * 0.04, math.cos(ang) * 0.04, pot_h + 0.08), rot=(0, ang, radians(18)), mat=mats["plant"], col=col)
            parent_keep_world(blade, root)
    return root


def build_rug(mats, col, size=(1.8, 1.2)):
    root = bpy.data.objects.new("Rug", None)
    col.objects.link(root)
    sx, sy = size
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.005))
    rug = bpy.context.active_object
    rug.name = "RugPlane"
    rug.scale = (sx / 2, sy / 2, 1)
    bpy.ops.object.transform_apply(scale=True)
    assign_mat(rug, mats["rug"])
    parent_keep_world(rug, root)
    return root


# ---------------------------------------------------------------------------
# Layout — mirrors reference catalog spread
# ---------------------------------------------------------------------------
CATALOG_LAYOUT = [
    ("ConferenceDesk", (-6.2, 5.0, 0), 0),
    ("OfficeDesk", (-2.8, 5.2, 0), 0),
    ("OfficeDesk_Drawers", (0.2, 5.2, 0), 0),
    ("OfficeChair", (3.2, 4.8, 0), radians(18)),
    ("CurvedSofa", (-5.8, 1.2, 0), radians(8)),
    ("StraightSofa", (-1.2, 1.0, 0), 0),
    ("Armchair", (2.4, 1.4, 0), radians(-15)),
    ("BarStool", (6.2, 4.8, 0), 0),
    ("LowStool_4L", (6.8, 3.2, 0), 0),
    ("LowStool_3L", (7.2, 1.8, 0), 0),
    ("Pouf", (5.4, 0.6, 0), 0),
    ("CoffeeTable_Pedestal", (-5.2, -1.8, 0), 0),
    ("CoffeeTable_Tripod", (-2.0, -2.2, 0), 0),
    ("SideTable_Metal", (0.8, -1.8, 0), 0),
    ("SideTable_Wood", (3.5, -2.2, 0), 0),
    ("KitchenIsland", (0.5, -0.4, 0), 0),
    ("Bookshelf_3x3", (-6.5, -4.5, 0), 0),
    ("Bookshelf_4x2", (-2.8, -4.8, 0), 0),
    ("CatTree", (0.8, -4.2, 0), 0),
    ("Plant_Large", (-0.5, -4.0, 0), 0),
    ("Plant_Small", (3.0, -4.2, 0), 0),
    ("Rug", (-2.2, 0.5, 0), radians(3)),
]


BUILDERS = {
    "ConferenceDesk": lambda m, c: build_conference_desk(m, c),
    "OfficeDesk": lambda m, c: build_office_desk(m, c, False),
    "OfficeDesk_Drawers": lambda m, c: build_office_desk(m, c, True),
    "OfficeChair": lambda m, c: build_office_chair(m, c),
    "CurvedSofa": lambda m, c: build_curved_sofa(m, c),
    "StraightSofa": lambda m, c: build_straight_sofa(m, c),
    "Armchair": lambda m, c: build_armchair(m, c),
    "BarStool": lambda m, c: build_bar_stool(m, c),
    "LowStool_4L": lambda m, c: build_low_stool(m, c, 4),
    "LowStool_3L": lambda m, c: build_low_stool(m, c, 3),
    "Pouf": lambda m, c: build_pouf(m, c),
    "CoffeeTable_Pedestal": lambda m, c: build_coffee_table_pedestal(m, c),
    "CoffeeTable_Tripod": lambda m, c: build_coffee_table_tripod(m, c),
    "SideTable_Metal": lambda m, c: build_side_table_metal(m, c),
    "SideTable_Wood": lambda m, c: build_side_table_wood(m, c),
    "KitchenIsland": lambda m, c: build_kitchen_island(m, c),
    "Bookshelf_3x3": lambda m, c: build_bookshelf(m, c, 3, 3),
    "Bookshelf_4x2": lambda m, c: build_bookshelf(m, c, 4, 2),
    "CatTree": lambda m, c: build_cat_tree(m, c),
    "Plant_Large": lambda m, c: build_plant(m, c, True),
    "Plant_Small": lambda m, c: build_plant(m, c, False),
    "Rug": lambda m, c: build_rug(m, c),
}


def setup_studio():
    world = bpy.context.scene.world
    world.use_nodes = True
    bg = None
    for node in world.node_tree.nodes:
        if node.type == "BACKGROUND":
            bg = node
            break
    if bg is None:
        bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (1.0, 1.0, 1.0, 1.0)
        bg.inputs[1].default_value = 1.2

    # 纯白地面接收柔和阴影
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
    floor = bpy.context.active_object
    floor.name = "StudioFloor"
    mat = bpy.data.materials.new("Floor_White")
    mat.use_nodes = True
    bsdf = get_principled_bsdf(mat)
    bsdf.inputs["Base Color"].default_value = (0.99, 0.99, 0.98, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.85
    floor.data.materials.append(mat)

    bpy.ops.object.light_add(type="AREA", location=(8, -8, 12))
    key = bpy.context.active_object
    key.name = "KeyLight"
    key.data.energy = 1200
    key.data.size = 8
    key.data.color = (1.0, 0.98, 0.95)
    key.rotation_euler = (radians(52), 0, radians(32))

    bpy.ops.object.light_add(type="AREA", location=(-7, 6, 8))
    fill = bpy.context.active_object
    fill.name = "FillLight"
    fill.data.energy = 500
    fill.data.size = 7
    fill.data.color = (0.95, 0.97, 1.0)
    fill.rotation_euler = (radians(58), 0, radians(-145))

    bpy.ops.object.light_add(type="AREA", location=(0, 10, 6))
    rim = bpy.context.active_object
    rim.name = "RimLight"
    rim.data.energy = 280
    rim.data.size = 6
    rim.rotation_euler = (radians(65), 0, radians(180))

    cam_data = bpy.data.cameras.new("CatalogCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = 20
    cam = bpy.data.objects.new("CatalogCam", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = (0, -18, 12)
    cam.rotation_euler = (radians(52), 0, 0)
    bpy.context.scene.camera = cam


def duplicate_hierarchy(root, col):
    mapping = {}

    def clone(obj, new_parent=None):
        new_obj = obj.copy()
        if obj.data:
            new_obj.data = obj.data.copy()
        col.objects.link(new_obj)
        mapping[obj] = new_obj
        if new_parent:
            new_obj.parent = new_parent
            new_obj.matrix_parent_inverse = new_parent.matrix_world.inverted()
        for child in obj.children:
            clone(child, new_obj)
        return new_obj

    return clone(root)


def build_catalog():
    clear_scene()
    mats = build_materials()
    src_col = ensure_collection("Catalog_Source")
    layout_col = ensure_collection("Catalog_Layout")

    prototypes = {}
    for key, builder in BUILDERS.items():
        root = builder(mats, src_col)
        prototypes[key] = root
        root.hide_set(True)
        root.hide_render = True

    placed = 0
    for key, loc, rot_z in CATALOG_LAYOUT:
        inst = duplicate_hierarchy(prototypes[key], layout_col)
        inst.location = loc
        inst.rotation_euler = (0, 0, rot_z)
        inst.hide_set(False)
        inst.hide_render = False
        placed += 1

    setup_studio()
    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT", "CYCLES"):
        try:
            bpy.context.scene.render.engine = engine
            break
        except Exception:
            continue
    eevee = getattr(bpy.context.scene, "eevee", None)
    if eevee and hasattr(eevee, "taa_render_samples"):
        eevee.taa_render_samples = 64
    return placed


def save_blend():
    os.makedirs(ROOT_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    return BLEND_OUT


def render_catalog(output_name="furniture-catalog-v1.png"):
    render_dir = os.path.join(ROOT_DIR, "renders")
    os.makedirs(render_dir, exist_ok=True)
    out = os.path.join(render_dir, output_name)
    scene = bpy.context.scene
    scene.render.filepath = out
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.image_settings.file_format = "PNG"
    bpy.ops.render.render(write_still=True)
    return out


if __name__ == "__main__":
    count = build_catalog()
    path = save_blend()
    render_path = render_catalog()
    print(f"Built {count} catalog items")
    print(f"Blend: {path}")
    print(f"Render: {render_path}")
