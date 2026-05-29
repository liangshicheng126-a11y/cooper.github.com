# -*- coding: utf-8 -*-
from collections import Counter
from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn

path = r"X:\A\liangsc_formatted.docx"
out_path = r"X:\A\1\inspect_output.txt"
doc = Document(path)
lines = []


def log(msg=""):
    lines.append(msg)


def run_info(r):
    rpr = r._element.rPr
    east = None
    spacing = None
    scale = None
    if rpr is not None:
        if rpr.rFonts is not None:
            east = rpr.rFonts.get(qn("w:eastAsia"))
        sp = rpr.find(qn("w:spacing"))
        if sp is not None:
            spacing = sp.get(qn("w:val"))
        ts = rpr.find(qn("w:textScale"))
        if ts is not None:
            scale = ts.get(qn("w:val"))
    return r.font.name, east, r.font.size, r.font.bold, spacing, scale


log("=== SECTIONS ===")
for i, sec in enumerate(doc.sections):
    sect_pr = sec._sectPr
    cols = sect_pr.find(qn("w:cols"))
    col_info = "single"
    if cols is not None and cols.get(qn("w:num")):
        col_info = f"cols={cols.get(qn('w:num'))} space={cols.get(qn('w:space'))}"
    log(
        f"Section {i}: margins L={sec.left_margin.cm:.1f}cm R={sec.right_margin.cm:.1f}cm "
        f"layout={col_info} footer_linked={sec.footer.is_linked_to_previous}"
    )
    if sec.footer.paragraphs:
        log(f"  footer: {sec.footer.paragraphs[0].text!r}")

log("\n=== SAMPLE PARAGRAPHS ===")
samples = [0, 1, 2, 3, 4, 5, 6, 16, 17]
for i in samples:
    if i >= len(doc.paragraphs):
        continue
    p = doc.paragraphs[i]
    pf = p.paragraph_format
    log(f"P{i} [{p.style.name}] line_rule={pf.line_spacing_rule} line={pf.line_spacing} align={pf.alignment}")
    log(f"  text: {p.text[:90]!r}")
    if p.runs:
        fn, east, size, bold, spacing, scale = run_info(p.runs[0])
        log(f"  run0: font={fn} east={east} size={size} bold={bold} spacing={spacing} scale={scale}")

log(f"\nTotal paragraphs: {len(doc.paragraphs)}")

with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("Wrote", out_path)
