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
CAB_GREY = (0.86, 0.84, 0.80, 1.0)
BLACK = (0.06, 0.06, 0.06, 1.0)
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
        "stone": make_material("Stone_Counter", STONE, 0.22, 0.35),
        "cab_grey": make_material("Cab_Grey", CAB_GREY, 0.65, 0.15),
        "black": make_material("Black_Glass", BLACK, 0.12, 0.55),
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


def island_bar_stool(mats, col, root, x, y, idx=0):
    """参考图：圆木凳面 + 四锥腿 + 脚踏环"""
    seat = cylinder(f"StoolSeat_{idx}", 0.155, 0.045, (x, y, 0.74), mat=mats["wood"], col=col)
    parent_keep_world(seat, root)
    for i in range(4):
        ang = i * (math.pi / 2) + math.pi / 4
        lx = x + math.sin(ang) * 0.1
        ly = y + math.cos(ang) * 0.1
        leg = cylinder(f"StoolLeg_{idx}_{i}", 0.018, 0.68, (lx, ly, 0.36), mat=mats["wood"], col=col)
        parent_keep_world(leg, root)
    foot = cylinder(f"StoolFoot_{idx}", 0.13, 0.022, (x, y, 0.22), mat=mats["wood"], col=col)
    parent_keep_world(foot, root)


def mesh_object(name, bm, mat, col):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    col.objects.link(obj)
    if mat:
        assign_mat(obj, mat)
    shade_smooth(obj)
    return obj


def apply_all_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=mod.name)
        except RuntimeError:
            pass
    obj.select_set(False)


def bool_op(target, cutter, operation="DIFFERENCE"):
    mod = target.modifiers.new("Bool", "BOOLEAN")
    mod.operation = operation
    mod.object = cutter
    mod.solver = "EXACT"
    apply_all_modifiers(target)
    bpy.data.objects.remove(cutter, do_unlink=True)


def create_l_solid(name, long, short, thick, height, origin, mat, col, bevel_w=0.22, subsurf=1):
    """L 形实心体：bmesh 轮廓 + 倒角 + 一级细分"""
    ox, oy = origin
    bm = bmesh.new()
    pts = [
        (ox - thick, oy - short),
        (ox - thick, oy + thick),
        (ox + long, oy + thick),
        (ox + long, oy),
        (ox, oy),
        (ox, oy - short),
    ]
    verts = [bm.verts.new((x, y, 0.0)) for x, y in pts]
    bm.faces.new(verts)
    geom = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])["geom"]
    verts_top = [v for v in geom if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=verts_top, vec=(0, 0, height))
    obj = mesh_object(name, bm, mat, col)
    bevel(obj, width=bevel_w, segments=4)
    if subsurf:
        sub = obj.modifiers.new("Subsurf", "SUBSURF")
        sub.levels = subsurf
        sub.render_levels = subsurf
    apply_all_modifiers(obj)
    return obj


def create_l_bar_walls(name, long, short, thick, height, origin, mat, col):
    """L 形吧台围合：双墙 + 圆角角块 + 端部倒角（无布尔，结构稳定）"""
    ox, oy = origin
    parts = []
    long_wall = box(
        f"{name}_Long",
        (long, thick, height),
        (ox + long / 2, oy + thick / 2, height / 2),
        mat=mat,
        col=col,
    )
    short_wall = box(
        f"{name}_Short",
        (thick, short - thick * 0.5, height),
        (ox - thick / 2, oy - (short - thick * 0.5) / 2, height / 2),
        mat=mat,
        col=col,
    )
    corner = box(
        f"{name}_Corner",
        (thick * 1.02, thick * 1.02, height),
        (ox - thick / 2 + 0.01, oy + thick / 2 - 0.01, height / 2),
        mat=mat,
        col=col,
    )
    bevel(corner, width=0.20, segments=4)
    end_cap = box(
        f"{name}_End",
        (thick, 0.50, height),
        (ox - thick / 2, oy - short + 0.25, height / 2),
        mat=mat,
        col=col,
    )
    bevel(end_cap, width=0.16, segments=4)
    parts.extend([long_wall, short_wall, corner, end_cap])
    return parts


def create_l_counter_top(name, long, short, thick, slab, origin, mat, col):
    """L 形台面：薄板 + 倒角"""
    ox, oy = origin
    parts = []
    parts.append(
        box(f"{name}_Long", (long, thick, slab), (ox + long / 2, oy + thick / 2, 0), mat=mat, col=col)
    )
    parts.append(
        box(
            f"{name}_Short",
            (thick, short - thick * 0.5, slab),
            (ox - thick / 2, oy - (short - thick * 0.5) / 2, 0),
            mat=mat,
            col=col,
        )
    )
    corner = box(
        f"{name}_Corner",
        (thick * 1.02, thick * 1.02, slab),
        (ox - thick / 2 + 0.01, oy + thick / 2 - 0.01, 0),
        mat=mat,
        col=col,
    )
    bevel(corner, width=0.16, segments=3)
    parts.append(corner)
    return parts


def build_shelf_cubbies(mats, col, root, origin, rows=2, cols=2):
    """逐格开放层架 + 书本/器皿装饰"""
    ox, oy, oz_base = origin
    cell_w, cell_d, cell_h = 0.20, 0.22, 0.26
    frame_w = cols * cell_w + 0.06
    frame_d = cell_d + 0.08
    frame_h = rows * cell_h + 0.05

    back = box("ShelfBackPanel", (frame_w, 0.022, frame_h), (ox, oy - frame_d / 2, oz_base + frame_h / 2), mat=mats["wood"], col=col)
    parent_keep_world(back, root)
    side_l = box("ShelfSideL", (0.022, frame_d, frame_h), (ox - frame_w / 2, oy, oz_base + frame_h / 2), mat=mats["wood"], col=col)
    side_r = box("ShelfSideR", (0.022, frame_d, frame_h), (ox + frame_w / 2, oy, oz_base + frame_h / 2), mat=mats["wood"], col=col)
    parent_keep_world(side_l, root)
    parent_keep_world(side_r, root)
    round_col = box("ShelfRoundOuter", (0.26, 0.26, frame_h), (ox - frame_w / 2 - 0.12, oy - frame_d / 2 - 0.10, oz_base + frame_h / 2), mat=mats["wood"], col=col)
    bevel(round_col, width=0.12, segments=4)
    parent_keep_world(round_col, root)

    decor = [
        (0.06, 0.08, 0.05, 0.07, mats["fabric_dark"]),
        (-0.04, 0.06, 0.04, 0.09, mats["fabric"]),
        (0.10, -0.02, 0.055, 0.06, mats["fabric_dark"]),
        (-0.08, -0.04, 0.045, 0.05, mats["fabric_grey"]),
    ]
    for r in range(rows + 1):
        z = oz_base + r * cell_h
        shelf = box(f"CubbyShelf_{r}", (frame_w - 0.03, frame_d - 0.02, 0.018), (ox, oy, z), mat=mats["wood"], col=col)
        parent_keep_world(shelf, root)
    for r in range(rows):
        for c in range(cols):
            cx = ox - frame_w / 2 + cell_w * (c + 0.5)
            cz = oz_base + r * cell_h + cell_h * 0.45
            if c < cols - 1:
                divider = box(
                    f"CubbyDiv_{r}_{c}",
                    (0.012, cell_d - 0.03, cell_h - 0.02),
                    (ox - frame_w / 2 + cell_w * (c + 1), oy, cz),
                    mat=mats["wood"],
                    col=col,
                )
                parent_keep_world(divider, root)
            idx = r * cols + c
            if idx < len(decor):
                dx, dy, bw, bh, m = decor[idx]
                book = box(f"CubbyItem_{r}_{c}", (bw, 0.016, bh), (cx + dx, oy + dy, cz), mat=m, col=col)
                parent_keep_world(book, root)
    vase = cylinder("CubbyVase", 0.035, 0.08, (ox + frame_w / 2 - 0.08, oy + 0.02, oz_base + cell_h + 0.08), mat=mats["fabric_grey"], col=col)
    parent_keep_world(vase, root)
    bowl = cylinder("CubbyBowl", 0.045, 0.025, (ox - frame_w / 2 + 0.12, oy + 0.04, oz_base + cell_h * 2 + 0.04), mat=mats["metal"], col=col)
    parent_keep_world(bowl, root)


def build_kitchen_island(mats, col):
    """
    三步精修岛台：
    1) L 壳体 bmesh + 倒角 + 细分
    2) 内外 L 布尔差集（木吧台围合 / 内腔）
    3) 内圈石台面布尔贴合 + 逐格格架
    """
    root = bpy.data.objects.new("KitchenIsland", None)
    col.objects.link(root)

    def link_child(obj):
        for c in list(obj.users_collection):
            if c != col:
                c.objects.unlink(obj)
        if col not in obj.users_collection:
            col.objects.link(obj)
        parent_keep_world(obj, root)
        return obj

    BAR = 1.03
    KIT = 0.875
    ox, oy = -0.94, -1.05
    LONG, SHORT, THICK = 3.35, 2.25, 0.58

    # ── Step 1: L 吧台木围合（圆角墙拼装） ──
    for p in create_l_bar_walls("BarShell", LONG, SHORT, THICK, BAR, (ox, oy), mats["wood"], col):
        link_child(p)

    for p in create_l_counter_top("BarTop", LONG, SHORT, THICK, 0.055, (ox, oy), mats["wood"], col):
        p.location.z = BAR
        bpy.context.view_layer.update()
        link_child(p)

    # 种植槽 + 挡板
    trough = box("PlanterTrough", (2.85, 0.14, 0.07), (0.55, 0.30, BAR + 0.10), mat=mats["fabric_dark"], col=col)
    link_child(trough)
    for i in range(12):
        leaf = box(f"Herb{i}", (0.04, 0.03, 0.08), (-0.85 + i * 0.24, 0.30, BAR + 0.16), mat=mats["plant"], col=col)
        link_child(leaf)
    splash = box("BarSplash", (2.9, 0.05, 0.20), (0.55, 0.42, BAR + 0.08), mat=mats["wood"], col=col)
    link_child(splash)

    # ── Step 2: 内圈石台面（L bmesh + 倒角 + 细分，嵌入木围合内腔） ──
    kit_top = create_l_solid(
        "KitCounter",
        2.45,
        1.52,
        0.44,
        0.042,
        (ox + 0.08, oy + 0.08),
        mats["stone"],
        col,
        bevel_w=0.16,
        subsurf=1,
    )
    kit_top.location.z = KIT
    bpy.context.view_layer.update()
    link_child(kit_top)

    # 石台与木吧台高差立面条（强化层次）
    reveal = box("CounterReveal", (2.40, 0.012, 0.155), (0.55, 0.17, KIT + 0.04), mat=mats["wood"], col=col)
    link_child(reveal)

    cab_l = box("CabLong", (2.45, 0.66, 0.78), (0.55, 0.0, 0.39), mat=mats["cab_grey"], col=col)
    cab_s = box("CabShort", (0.66, 1.55, 0.78), (-0.68, -0.55, 0.39), mat=mats["cab_grey"], col=col)
    link_child(cab_l)
    link_child(cab_s)
    for i, z in enumerate((0.18, 0.40, 0.62)):
        seam = box(f"DrawerSeam{i}", (0.52, 0.008, 0.012), (0.85, -0.31, z), mat=mats["black"], col=col)
        link_child(seam)

    # 灶台 / 水槽 / 道具
    hob = box("HobGlass", (0.50, 0.46, 0.016), (0.35, 0.0, KIT + 0.024), mat=mats["black"], col=col)
    link_child(hob)
    for i in range(4):
        bx = 0.18 + (i % 2) * 0.20
        by = -0.10 + (i // 2) * 0.20
        b = cylinder(f"Burner{i}", 0.046, 0.012, (bx, by, KIT + 0.034), mat=mats["black"], col=col)
        link_child(b)
    hood = box("VentStrip", (0.52, 0.07, 0.022), (0.35, 0.28, KIT + 0.05), mat=mats["metal"], col=col)
    link_child(hood)
    sink = cylinder("Sink", 0.15, 0.028, (1.25, -0.05, KIT + 0.005), mat=mats["metal"], col=col)
    link_child(sink)
    tap = box("TapNeck", (0.014, 0.014, 0.13), (1.25, -0.20, KIT + 0.09), mat=mats["metal"], col=col)
    spout = box("TapSpout", (0.09, 0.014, 0.014), (1.20, -0.13, KIT + 0.055), mat=mats["metal"], col=col)
    link_child(tap)
    link_child(spout)
    kettle = cylinder("Kettle", 0.065, 0.11, (1.05, 0.20, KIT + 0.06), mat=mats["metal"], col=col)
    link_child(kettle)
    for i, x in enumerate((1.55, 1.70)):
        jar = cylinder(f"Jar{i}", 0.032, 0.075, (x, 0.16, KIT + 0.04), mat=mats["fabric_grey"], col=col)
        link_child(jar)
    board = box("CuttingBoard", (0.20, 0.13, 0.012), (0.75, 0.22, KIT + 0.008), mat=mats["wood_dark"], col=col)
    link_child(board)

    # ── Step 3: 逐格开放层架 ──
    build_shelf_cubbies(mats, col, root, (-1.02, -0.95, 0.18), rows=2, cols=2)

    # 高脚凳 ×5 + 脚踏杆
    for i, x in enumerate((0.25, 0.85, 1.45, 2.05, 2.65)):
        island_bar_stool(mats, col, root, x, -0.38, i)
    rail = box("FootRail", (2.30, 0.032, 0.032), (1.45, -0.52, 0.14), mat=mats["wood_dark"], col=col)
    link_child(rail)
    for x in (0.25, 2.65):
        rl = box(f"FootRailLeg_{int(x*100)}", (0.032, 0.032, 0.13), (x, -0.52, 0.065), mat=mats["wood_dark"], col=col)
        link_child(rl)
    kick_l = box("KickLong", (2.45, 0.022, 0.075), (0.55, -0.31, 0.038), mat=mats["wood_dark"], col=col)
    kick_s = box("KickShort", (0.022, 1.55, 0.075), (-0.68, -0.55, 0.038), mat=mats["wood_dark"], col=col)
    link_child(kick_l)
    link_child(kick_s)

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
