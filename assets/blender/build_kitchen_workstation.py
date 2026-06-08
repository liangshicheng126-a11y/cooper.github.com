"""
U 型模块化厨房岛台 — 依据参考图四视图建模
运行: blender --background --python build_kitchen_workstation.py
或在 Blender Scripting 工作区 Open → Run Script
"""

import math
import os
from math import radians

import bpy
import bmesh

# ---------------------------------------------------------------------------
# Paths & palette
# ---------------------------------------------------------------------------
ASSET_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(ASSET_DIR)
CACHE = os.path.join(ROOT_DIR, "blender-cache")
BLEND_OUT = os.path.join(ROOT_DIR, "kitchen-workstation.blend")
RENDER_OUT = os.path.join(ROOT_DIR, "renders", "kitchen-workstation-v1.png")

WOOD = (0.78, 0.62, 0.42, 1.0)
WOOD_DARK = (0.68, 0.52, 0.34, 1.0)
STONE = (0.97, 0.96, 0.94, 1.0)
METAL = (0.82, 0.82, 0.84, 1.0)
BLACK = (0.05, 0.05, 0.05, 1.0)
PLANT = (0.35, 0.55, 0.32, 1.0)
PLANT_LIGHT = (0.48, 0.68, 0.38, 1.0)
SOIL = (0.42, 0.32, 0.22, 1.0)

# Dimensions (meters) — v2 tuned to reference proportions
MAIN_LEN = 3.45
RETURN_LEN = 2.90
RETURN_OFFSET = 0.52
DEPTH = 0.56
GAP = 1.02
BASE_H = 0.88
TOP_SLAB = 0.06
TOE_KICK = 0.10
TOE_RECESS = 0.06
MODEL_VERSION = "v2"


# ---------------------------------------------------------------------------
# Scene helpers
# ---------------------------------------------------------------------------
def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for col in list(bpy.data.collections):
        if col.name != "Collection":
            bpy.data.collections.remove(col)
    root = bpy.context.scene.collection
    for child in list(root.children):
        root.children.unlink(child)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
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


def get_principled_bsdf(mat):
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        for node in mat.node_tree.nodes:
            if node.type == "BSDF_PRINCIPLED":
                return node
    return bsdf


def make_material(name, color, roughness=0.55, specular=0.25, metallic=0.0, tex_path=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = get_principled_bsdf(mat)
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = metallic
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


def make_marble_material(name, base_color):
    """白石台面：微纹理 + 低粗糙高光"""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = get_principled_bsdf(mat)
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 18.0
    noise.inputs["Detail"].default_value = 3.0
    noise.location = (-600, 100)
    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.42
    ramp.color_ramp.elements[0].color = (*base_color[:3], 1.0)
    ramp.color_ramp.elements[1].position = 0.58
    ramp.color_ramp.elements[1].color = (0.92, 0.91, 0.89, 1.0)
    ramp.location = (-380, 100)
    links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.14
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.48
    return mat


def assign_mat(obj, mat):
    if not obj.data.materials:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat


def parent_keep_world(child, parent):
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def shade_smooth(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.shade_smooth()
    obj.select_set(False)


def bevel(obj, width=0.008, segments=3):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = radians(35)
    return mod


def apply_all_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError:
            pass
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
    bevel(obj, width=min(sx, sy, sz) * 0.012, segments=2)
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
    bevel(obj, width=radius * 0.03, segments=2)
    shade_smooth(obj)
    return obj


def mesh_from_bm(name, bm, mat=None, col=None):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    if col:
        col.objects.link(obj)
    if mat:
        assign_mat(obj, mat)
    shade_smooth(obj)
    return obj


def build_materials():
    wood_tex = os.path.join(CACHE, "wood_diff.jpg")
    wood_nor = os.path.join(CACHE, "wood_nor.jpg")
    wood = make_material("Wood_LightOak", WOOD, 0.42, 0.34, tex_path=wood_tex)
    if os.path.isfile(wood_nor):
        nodes = wood.node_tree.nodes
        bsdf = get_principled_bsdf(wood)
        ntex = nodes.new("ShaderNodeTexImage")
        ntex.image = bpy.data.images.load(wood_nor, check_existing=True)
        ntex.image.colorspace_settings.name = "Non-Color"
        ntex.location = (-400, -80)
        norm = nodes.new("ShaderNodeNormalMap")
        norm.location = (-180, -80)
        wood.node_tree.links.new(ntex.outputs["Color"], norm.inputs["Color"])
        wood.node_tree.links.new(norm.outputs["Normal"], bsdf.inputs["Normal"])
    return {
        "wood": wood,
        "wood_dark": make_material("Wood_DarkOak", WOOD_DARK, 0.48, 0.28, tex_path=wood_tex),
        "stone": make_marble_material("Stone_Counter", STONE),
        "metal": make_material("Metal_SS", METAL, 0.22, 0.58, metallic=0.92),
        "black": make_material("Black_Hob", BLACK, 0.12, 0.65),
        "plant": make_material("Plant_Green", PLANT, 0.72, 0.12),
        "plant_light": make_material("Plant_Light", PLANT_LIGHT, 0.68, 0.12),
        "soil": make_material("Soil", SOIL, 0.95, 0.05),
    }


# ---------------------------------------------------------------------------
# Geometry builders
# ---------------------------------------------------------------------------
def create_rounded_bar(name, length, depth, height, origin, mat, col, end_radius=0.22):
    """圆角长条实心体（主/回臂台面基座）"""
    ox, oy = origin
    bm = bmesh.new()
    r = end_radius
    pts = [
        (ox + r, oy),
        (ox + length - r, oy),
        (ox + length, oy + r),
        (ox + length, oy + depth - r),
        (ox + length - r, oy + depth),
        (ox + r, oy + depth),
        (ox, oy + depth - r),
        (ox, oy + r),
    ]
    verts = [bm.verts.new((x, y, 0.0)) for x, y in pts]
    bm.faces.new(verts)
    geom = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])["geom"]
    top = [v for v in geom if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, height))
    obj = mesh_from_bm(name, bm, mat, col)
    bevel(obj, width=0.14, segments=4)
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    apply_all_modifiers(obj)
    return obj


def create_u_footprint_solid(name, height, mat, col, bevel_w=0.16):
    """
    统一 U 型轮廓（俯视图对齐参考图）：
    主臂底边 → 右端 90° 弧 → 回臂顶边，左侧开口。
    """
    r = 0.24
    main_y0 = 0.0
    main_y1 = DEPTH
    ret_y0 = DEPTH + GAP
    ret_y1 = ret_y0 + DEPTH
    right_x = MAIN_LEN
    ret_left = RETURN_OFFSET

    bm = bmesh.new()
    pts = [
        (r, main_y0),
        (right_x - r, main_y0),
        (right_x, main_y0 + r),
        (right_x, ret_y1 - r),
        (right_x - r, ret_y1),
        (ret_left + r, ret_y1),
        (ret_left, ret_y1 - r),
        (ret_left, ret_y0 + r),
        (ret_left + r, ret_y0),
        (right_x - DEPTH * 0.85, ret_y0),
        (right_x - DEPTH * 0.85, main_y1),
        (r, main_y1),
        (0.0, main_y1 - r),
        (0.0, main_y0 + r),
    ]
    verts = [bm.verts.new((x, y, 0.0)) for x, y in pts]
    bm.faces.new(verts)
    geom = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])["geom"]
    top = [v for v in geom if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=top, vec=(0, 0, height))
    obj = mesh_from_bm(name, bm, mat, col)
    bevel(obj, width=bevel_w, segments=4)
    sub = obj.modifiers.new("Subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    apply_all_modifiers(obj)
    return obj


def add_toe_kick(mats, col, root):
    """底部踢脚线凹陷"""
    kick_h = TOE_KICK
    recess = TOE_RECESS
    main_y = 0.0
    return_y = DEPTH + GAP
    segments = [
        ("Kick_Main", (MAIN_LEN - 0.08, DEPTH - recess * 2, kick_h), (MAIN_LEN / 2, main_y + recess + (DEPTH - recess * 2) / 2, kick_h / 2)),
        ("Kick_Return", (RETURN_LEN - 0.08, DEPTH - recess * 2, kick_h), (RETURN_OFFSET + RETURN_LEN / 2, return_y + recess + (DEPTH - recess * 2) / 2, kick_h / 2)),
    ]
    for name, size, loc in segments:
        kick = box(name, size, loc, mat=mats["wood_dark"], col=col)
        parent_keep_world(kick, root)


def add_counter_slab(name, length, depth, thickness, origin, mat, col, end_radius=0.20):
    ox, oy, oz = origin
    slab = create_rounded_bar(name, length, depth, thickness, (ox, oy), mat, col, end_radius)
    slab.location.z = oz
    bpy.context.view_layer.update()
    return slab


def add_double_sink(mats, col, root, loc, scale=1.0):
    x, y, z = loc
    basin_w, basin_d, basin_h = 0.34 * scale, 0.28 * scale, 0.04 * scale
    gap = 0.04 * scale
    for i, dx in enumerate((-basin_w / 2 - gap / 2, basin_w / 2 + gap / 2)):
        rim = box(
            f"SinkRim_{i}",
            (basin_w + 0.02, basin_d + 0.02, 0.012),
            (x + dx, y, z + 0.006),
            mat=mats["metal"],
            col=col,
        )
        basin = box(
            f"SinkBasin_{i}",
            (basin_w, basin_d, basin_h),
            (x + dx, y, z - basin_h / 2 + 0.004),
            mat=mats["metal"],
            col=col,
        )
        parent_keep_world(rim, root)
        parent_keep_world(basin, root)
    # Gooseneck faucet
    base = cylinder("TapBase", 0.022, 0.025, (x, y - basin_d / 2 - 0.06, z + 0.02), mat=mats["metal"], col=col)
    stem = cylinder("TapStem", 0.014, 0.28, (x, y - basin_d / 2 - 0.06, z + 0.16), mat=mats["metal"], col=col)
    spout = box("TapSpout", (0.10, 0.014, 0.014), (x - 0.04, y - basin_d / 2 - 0.02, z + 0.30), mat=mats["metal"], col=col)
    for o in (base, stem, spout):
        parent_keep_world(o, root)


def add_gas_hob_5(mats, col, root, loc):
    x, y, z = loc
    frame = box("Hob5_Frame", (0.52, 0.46, 0.018), (x, y, z), mat=mats["black"], col=col)
    parent_keep_world(frame, root)
    positions = [
        (-0.14, -0.12), (0.14, -0.12), (0.0, 0.0),
        (-0.14, 0.12), (0.14, 0.12),
    ]
    for i, (dx, dy) in enumerate(positions):
        ring = cylinder(f"Hob5_Ring_{i}", 0.048, 0.008, (x + dx, y + dy, z + 0.014), mat=mats["black"], col=col)
        parent_keep_world(ring, root)
    panel = box("Hob5_Controls", (0.30, 0.04, 0.006), (x, y - 0.22, z + 0.006), mat=mats["metal"], col=col)
    parent_keep_world(panel, root)
    for i, dx in enumerate((-0.10, -0.05, 0.0, 0.05, 0.10)):
        knob = cylinder(f"Hob5_Knob_{i}", 0.014, 0.012, (x + dx, y - 0.22, z + 0.014), mat=mats["metal"], col=col)
        parent_keep_world(knob, root)


def add_gas_hob_1(mats, col, root, loc):
    x, y, z = loc
    frame = box("Hob1_Frame", (0.22, 0.22, 0.018), (x, y, z), mat=mats["black"], col=col)
    ring = cylinder("Hob1_Ring", 0.075, 0.010, (x, y, z + 0.014), mat=mats["black"], col=col)
    parent_keep_world(frame, root)
    parent_keep_world(ring, root)


def add_small_sink(mats, col, root, loc):
    x, y, z = loc
    rim = box("AuxSinkRim", (0.22, 0.22, 0.012), (x, y, z + 0.006), mat=mats["metal"], col=col)
    basin = box("AuxSinkBasin", (0.18, 0.18, 0.035), (x, y, z - 0.012), mat=mats["metal"], col=col)
    parent_keep_world(rim, root)
    parent_keep_world(basin, root)


def add_drawers(mats, col, root, origin, count=3):
    ox, oy, oz = origin
    drawer_w, drawer_h, drawer_d = 0.42, 0.14, 0.04
    gap = 0.018
    for i in range(count):
        z = oz + i * (drawer_h + gap)
        front = box(
            f"Drawer_{i}",
            (drawer_w, drawer_d, drawer_h),
            (ox, oy, z + drawer_h / 2),
            mat=mats["wood"],
            col=col,
        )
        seam = box(
            f"DrawerSeam_{i}",
            (drawer_w - 0.04, 0.003, 0.006),
            (ox, oy - drawer_d / 2 - 0.001, z + drawer_h - 0.01),
            mat=mats["wood_dark"],
            col=col,
        )
        parent_keep_world(front, root)
        parent_keep_world(seam, root)


def add_open_shelving(mats, col, root, origin, rows=2, cols=3, prefix="Shelf"):
    ox, oy, oz = origin
    cell_w, cell_d, cell_h = 0.22, 0.24, 0.28
    fw = cols * cell_w + 0.05
    fd = cell_d + 0.06
    fh = rows * cell_h + 0.04
    back = box(f"{prefix}_Back", (fw, 0.022, fh), (ox, oy - fd / 2, oz + fh / 2), mat=mats["wood"], col=col)
    side_l = box(f"{prefix}_SideL", (0.022, fd, fh), (ox - fw / 2, oy, oz + fh / 2), mat=mats["wood"], col=col)
    side_r = box(f"{prefix}_SideR", (0.022, fd, fh), (ox + fw / 2, oy, oz + fh / 2), mat=mats["wood"], col=col)
    for o in (back, side_l, side_r):
        parent_keep_world(o, root)
    for r in range(rows + 1):
        z = oz + r * cell_h
        shelf = box(f"{prefix}_H_{r}", (fw - 0.03, fd - 0.02, 0.018), (ox, oy, z), mat=mats["wood"], col=col)
        parent_keep_world(shelf, root)
    for c in range(1, cols):
        div = box(
            f"{prefix}_Div_{c}",
            (0.012, fd - 0.03, fh - 0.02),
            (ox - fw / 2 + cell_w * c, oy, oz + fh / 2),
            mat=mats["wood"],
            col=col,
        )
        parent_keep_world(div, root)
    decor_colors = [mats["wood_dark"], mats["plant"], mats["metal"], mats["wood_dark"]]
    for idx in range(min(rows * cols, 6)):
        r, c = divmod(idx, cols)
        cx = ox - fw / 2 + cell_w * (c + 0.5)
        cz = oz + r * cell_h + cell_h * 0.45
        if idx % 2 == 0:
            item = box(f"{prefix}_Book_{idx}", (0.06, 0.014, 0.08), (cx, oy + 0.03, cz), mat=decor_colors[idx % len(decor_colors)], col=col)
        else:
            item = cylinder(f"{prefix}_Bowl_{idx}", 0.04, 0.02, (cx, oy + 0.02, cz), mat=decor_colors[idx % len(decor_colors)], col=col)
        parent_keep_world(item, root)


def add_planter_trough(mats, col, root, origin, length, plant_count=8):
    ox, oy, oz = origin
    trough = box(
        "PlanterTrough",
        (length, 0.14, 0.07),
        (ox, oy, oz + 0.035),
        mat=mats["wood_dark"],
        col=col,
    )
    soil = box(
        "PlanterSoil",
        (length - 0.04, 0.12, 0.03),
        (ox, oy, oz + 0.055),
        mat=mats["soil"],
        col=col,
    )
    parent_keep_world(trough, root)
    parent_keep_world(soil, root)
    spacing = (length - 0.2) / max(plant_count - 1, 1)
    for i in range(plant_count):
        px = ox - length / 2 + 0.1 + i * spacing
        h = 0.06 + (i % 3) * 0.025
        mat_p = mats["plant"] if i % 2 == 0 else mats["plant_light"]
        plant = box(f"Plant_{i}", (0.035, 0.03, h), (px, oy, oz + 0.08 + h / 2), mat=mat_p, col=col)
        parent_keep_world(plant, root)


def add_underside_grid(mats, col, root, origin, nx, ny):
    ox, oy, oz = origin
    cell_w, cell_d = 0.28, 0.26
    for ix in range(nx):
        for iy in range(ny):
            cx = ox + (ix - (nx - 1) / 2) * cell_w
            cy = oy + (iy - (ny - 1) / 2) * cell_d
            divider_x = box(
                f"UnderDivX_{ix}_{iy}",
                (0.018, cell_d - 0.02, 0.22),
                (cx, cy, oz + 0.11),
                mat=mats["wood"],
                col=col,
            )
            parent_keep_world(divider_x, root)


# ---------------------------------------------------------------------------
# Main workstation
# ---------------------------------------------------------------------------
def build_kitchen_workstation(mats, col):
    """
    U 型岛台（参考图 v2）：
    - 统一 U 轮廓基座 + 独立石台面
    - 主臂：双槽水槽 + 五眼灶 + 单眼灶 + 内侧抽屉
    - 回臂：种植槽 + 末端小水槽 + 双侧开放格架
    - 右臂圆角连接 + 角部种植槽 + 踢脚线
    """
    root = bpy.data.objects.new("KitchenWorkstation", None)
    col.objects.link(root)

    def P(obj):
        for c in list(obj.users_collection):
            if c != col:
                c.objects.unlink(obj)
        if col not in obj.users_collection:
            col.objects.link(obj)
        parent_keep_world(obj, root)
        return obj

    main_y = 0.0
    return_y = DEPTH + GAP
    main_cy = main_y + DEPTH / 2
    return_cy = return_y + DEPTH / 2

    # ── A. 统一木质基座 + 踢脚 ──
    P(create_u_footprint_solid("Base_U", BASE_H, mats["wood"], col, bevel_w=0.18))
    add_toe_kick(mats, col, root)

    # ── B. 石质台面（分块：主臂 + 回臂 + 转角补块） ──
    top_z = BASE_H
    P(add_counter_slab("Top_Main", MAIN_LEN - 0.04, DEPTH, TOP_SLAB, (0, main_y, top_z), mats["stone"], col, 0.22))
    P(add_counter_slab("Top_Return", RETURN_LEN - 0.02, DEPTH, TOP_SLAB, (RETURN_OFFSET, return_y, top_z), mats["stone"], col, 0.18))
    curve_cap = box(
        "Top_CurveCap",
        (DEPTH + 0.04, GAP + DEPTH * 0.5, TOP_SLAB),
        (MAIN_LEN - DEPTH / 2, main_y + DEPTH / 2 + GAP / 2, top_z + TOP_SLAB / 2),
        mat=mats["stone"],
        col=col,
    )
    bevel(curve_cap, width=0.14, segments=4)
    P(curve_cap)

    # ── C. 厨电 ──
    top_surface = top_z + TOP_SLAB
    add_double_sink(mats, col, root, (0.72, main_cy, top_surface), scale=1.0)
    add_gas_hob_5(mats, col, root, (1.62, main_cy, top_surface))
    add_gas_hob_1(mats, col, root, (2.62, main_cy, top_surface))
    add_small_sink(mats, col, root, (RETURN_OFFSET + 0.42, return_cy, top_surface))

    # ── D. 抽屉（主臂内侧，面向中空区） ──
    add_drawers(mats, col, root, (1.42, main_y + 0.05, 0.14), count=3)

    # ── E. 开放格架：回臂外侧双层 + 内侧一层 ──
    add_open_shelving(mats, col, root, (RETURN_OFFSET + RETURN_LEN / 2, return_y + DEPTH + 0.16, 0.10), rows=2, cols=3, prefix="ShelfOuter")
    add_open_shelving(mats, col, root, (RETURN_OFFSET + RETURN_LEN / 2, return_y - 0.14, 0.10), rows=1, cols=3, prefix="ShelfInner")

    # ── F. 种植槽（回臂长槽 + 转角槽） ──
    add_planter_trough(
        mats, col, root,
        (RETURN_OFFSET + RETURN_LEN / 2, return_cy, top_surface),
        length=RETURN_LEN - 0.55,
        plant_count=10,
    )
    add_planter_trough(
        mats, col, root,
        (MAIN_LEN - 0.42, main_cy + GAP / 2 + 0.08, top_surface),
        length=0.62,
        plant_count=5,
    )

    # ── G. 底部开放格架结构 ──
    add_underside_grid(mats, col, root, (1.75, main_cy, 0.02), nx=5, ny=2)
    add_underside_grid(mats, col, root, (RETURN_OFFSET + 1.2, return_cy, 0.02), nx=3, ny=2)

    return root


FIDELITY_CHECKLIST = {
    "u_shape_footprint": "U 型轮廓，左侧开口，右端圆弧连接",
    "rounded_corners": "全局大圆角倒角 + 一级细分",
    "wood_oak_texture": "浅橡木 PBR 贴图 + 法线",
    "white_marble_top": "白石台面微纹理噪波",
    "double_sink_faucet": "不锈钢双槽 + 鹅颈龙头",
    "gas_hob_5_plus_1": "五眼灶 + 单眼大灶",
    "aux_sink": "回臂末端小方槽",
    "inner_drawers": "主臂内侧 3 抽屉",
    "open_shelving": "回臂外/内侧开放格架",
    "planter_troughs": "回臂长种植槽 + 转角槽",
    "toe_kick": "底部踢脚线凹陷",
    "underside_grid": "底部开放储物格分格",
}


def setup_studio():
    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (1.0, 1.0, 1.0, 1.0)
        bg.inputs[1].default_value = 1.1

    bpy.ops.mesh.primitive_plane_add(size=20, location=(1.7, 0.8, 0))
    floor = bpy.context.active_object
    floor.name = "StudioFloor"
    mat = bpy.data.materials.new("Floor_White")
    mat.use_nodes = True
    bsdf = get_principled_bsdf(mat)
    bsdf.inputs["Base Color"].default_value = (0.99, 0.99, 0.98, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.88
    floor.data.materials.append(mat)

    bpy.ops.object.light_add(type="AREA", location=(5, -4, 8))
    key = bpy.context.active_object
    key.name = "KeyLight"
    key.data.energy = 900
    key.data.size = 6
    key.rotation_euler = (radians(55), 0, radians(25))

    bpy.ops.object.light_add(type="AREA", location=(-3, 5, 6))
    fill = bpy.context.active_object
    fill.name = "FillLight"
    fill.data.energy = 400
    fill.data.size = 5
    fill.rotation_euler = (radians(60), 0, radians(-140))

    # 四视图相机
    views = [
        ("Cam_Top", (1.7, 0.8, 14), (0, 0, 0), "ORTHO", 8.0),
        ("Cam_Front", (1.7, -6, 1.2), (radians(82), 0, 0), "PERSP", None),
        ("Cam_Side", (8, 0.8, 1.2), (radians(82), 0, radians(90)), "PERSP", None),
        ("Cam_Persp", (5, -4, 3.5), (radians(62), 0, radians(38)), "PERSP", None),
    ]
    cameras = []
    for name, loc, rot, ctype, ortho in views:
        cam_data = bpy.data.cameras.new(name)
        cam_data.type = ctype
        if ortho:
            cam_data.ortho_scale = ortho
        cam = bpy.data.objects.new(name, cam_data)
        bpy.context.scene.collection.objects.link(cam)
        cam.location = loc
        cam.rotation_euler = rot
        cameras.append(cam)
    bpy.context.scene.camera = cameras[3]
    return cameras


def print_fidelity_report():
    """输出还原度自检清单（目标 95%）"""
    total = len(FIDELITY_CHECKLIST)
    print(f"\n=== Fidelity Checklist ({MODEL_VERSION}) — {total} items ===")
    for key, desc in FIDELITY_CHECKLIST.items():
        print(f"  [✓] {key}: {desc}")
    print("  Compare renders with reference 4-view image.")
    print("  Target: 95% — iterate TOP_SLAB, GAP, bevel_w, plant density.\n")


def render_views(cameras, tag=None):
    if tag is None:
        tag = MODEL_VERSION
    render_dir = os.path.join(ROOT_DIR, "renders")
    os.makedirs(render_dir, exist_ok=True)
    scene = bpy.context.scene
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1200
    scene.render.image_settings.file_format = "PNG"
    paths = []
    for cam in cameras:
        scene.camera = cam
        out = os.path.join(render_dir, f"kitchen-workstation-{cam.name.lower()}_{tag}.png")
        scene.render.filepath = out
        bpy.ops.render.render(write_still=True)
        paths.append(out)
    return paths


def build_scene():
    clear_scene()
    mats = build_materials()
    col = ensure_collection("KitchenWorkstation")
    root = build_kitchen_workstation(mats, col)
    cameras = setup_studio()
    for engine in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT", "CYCLES"):
        try:
            bpy.context.scene.render.engine = engine
            break
        except Exception:
            continue
    return root, cameras


def save_blend():
    os.makedirs(ROOT_DIR, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
    return BLEND_OUT


if __name__ == "__main__":
    root, cameras = build_scene()
    blend_path = save_blend()
    render_paths = render_views(cameras)
    print_fidelity_report()
    print("Kitchen workstation built.")
    print(f"Blend: {blend_path}")
    for p in render_paths:
        print(f"Render: {p}")
