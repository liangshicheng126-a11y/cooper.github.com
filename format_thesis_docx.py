# -*- coding: utf-8 -*-
"""Format liangsc.docx: fonts, line spacing, character spacing, margins."""
from __future__ import annotations

import re
import shutil
from copy import deepcopy
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt

# --- Config (adjust if your department template differs) ---
INPUT = Path(r"X:\A\liangsc.docx")
OUTPUT = Path(r"X:\A\liangsc_formatted.docx")

KOREAN_FONT = "Batang"  # 바탕체
LATIN_FONT = "Times New Roman"

BODY_SIZE = Pt(12)
H1_SIZE = Pt(16)  # chapter: 1. 서론
H2_SIZE = Pt(14)  # section: 1.1
H3_SIZE = Pt(12)  # subsection: 2.1
TITLE_SIZE = Pt(18)
SUBTITLE_SIZE = Pt(14)
AUTHOR_SIZE = Pt(12)

LINE_SPACING_PT = Pt(22)  # MS Word fixed 22pt ≈ HWP 200%
CHAR_SPACING_TWIPS = 0  # 0 = standard; remove condensed spacing

MARGINS = dict(top=Cm(2.5), bottom=Cm(2.5), left=Cm(3.0), right=Cm(2.5))

CHAPTER_RE = re.compile(r"^\d+\.\s*\S")
SECTION_RE = re.compile(r"^\d+\.\d+\s+\S")
SUBSECTION_RE = re.compile(r"^\d+\.\d+\s+\S", re.UNICODE)


def set_run_font(run, *, latin=LATIN_FONT, east=KOREAN_FONT, size=BODY_SIZE, bold=None):
    run.font.name = latin
    if size is not None:
        run.font.size = size
    if bold is not None:
        run.font.bold = bold
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:ascii"), latin)
    rfonts.set(qn("w:hAnsi"), latin)
    rfonts.set(qn("w:cs"), latin)
    rfonts.set(qn("w:eastAsia"), east)
    set_char_spacing(run, CHAR_SPACING_TWIPS)


def set_char_spacing(run, twips: int):
    rpr = run._element.get_or_add_rPr()
    spacing = rpr.find(qn("w:spacing"))
    if twips == 0:
        if spacing is not None:
            rpr.remove(spacing)
        return
    if spacing is None:
        spacing = OxmlElement("w:spacing")
        rpr.append(spacing)
    spacing.set(qn("w:val"), str(twips))


def set_paragraph_spacing(p, *, before=Pt(0), after=Pt(0), line=LINE_SPACING_PT, align=None, indent=None):
    pf = p.paragraph_format
    pf.space_before = before
    pf.space_after = after
    pf.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    pf.line_spacing = line
    if align is not None:
        pf.alignment = align
    if indent is not None:
        pf.first_line_indent = indent


def classify_paragraph(style_name: str, text: str, bold_runs: bool) -> str:
    text = text.strip()
    if style_name in {"Paper Title"}:
        return "title"
    if style_name in {"Paper Subtitle"}:
        return "subtitle"
    if style_name in {"Paper Author"}:
        return "author"
    if style_name in {"Paper Affiliation"}:
        return "affiliation"
    if style_name in {"样式2", "Paper H1"}:
        return "h1"
    if style_name in {"样式1", "Paper H2"}:
        return "h2"
    if style_name in {"Paper H3"}:
        return "h3"
    if style_name == "Normal" and bold_runs and SUBSECTION_RE.match(text):
        return "h3"
    if style_name in {"Paper Ref"} or text.lower().startswith("references") or text.startswith("참고"):
        return "ref"
    return "body"


def format_paragraph(p, kind: str):
    text = p.text.strip()
    if not text and kind not in {"affiliation"}:
        return

    if kind == "title":
        set_paragraph_spacing(p, before=Pt(24), after=Pt(12), line=Pt(26), align=WD_ALIGN_PARAGRAPH.CENTER)
        for run in p.runs:
            set_run_font(run, size=TITLE_SIZE, bold=True)
        return

    if kind == "subtitle":
        set_paragraph_spacing(p, before=Pt(0), after=Pt(18), line=Pt(24), align=WD_ALIGN_PARAGRAPH.CENTER)
        for run in p.runs:
            set_run_font(run, size=SUBTITLE_SIZE, bold=False)
        return

    if kind == "author":
        set_paragraph_spacing(p, before=Pt(0), after=Pt(6), line=Pt(22), align=WD_ALIGN_PARAGRAPH.CENTER)
        for run in p.runs:
            set_run_font(run, size=AUTHOR_SIZE, bold=False)
        return

    if kind == "affiliation":
        set_paragraph_spacing(p, before=Pt(0), after=Pt(36), line=Pt(22), align=WD_ALIGN_PARAGRAPH.CENTER)
        for run in p.runs:
            set_run_font(run, size=AUTHOR_SIZE, bold=False)
        return

    if kind == "h1":
        set_paragraph_spacing(p, before=Pt(18), after=Pt(12), line=LINE_SPACING_PT, align=WD_ALIGN_PARAGRAPH.LEFT)
        for run in p.runs:
            set_run_font(run, size=H1_SIZE, bold=True)
        return

    if kind == "h2":
        set_paragraph_spacing(p, before=Pt(12), after=Pt(6), line=LINE_SPACING_PT, align=WD_ALIGN_PARAGRAPH.LEFT)
        for run in p.runs:
            set_run_font(run, size=H2_SIZE, bold=True)
        return

    if kind == "h3":
        set_paragraph_spacing(p, before=Pt(6), after=Pt(6), line=LINE_SPACING_PT, align=WD_ALIGN_PARAGRAPH.LEFT)
        for run in p.runs:
            set_run_font(run, size=H3_SIZE, bold=True)
        return

    # body / ref
    set_paragraph_spacing(
        p,
        before=Pt(0),
        after=Pt(0),
        line=LINE_SPACING_PT,
        align=WD_ALIGN_PARAGRAPH.JUSTIFY,
        indent=Pt(0),
    )
    for run in p.runs:
        set_run_font(run, size=BODY_SIZE, bold=False)


def update_section_layout(doc: Document):
    for sec in doc.sections:
        sec.page_width = Cm(21.0)
        sec.page_height = Cm(29.7)
        sec.top_margin = MARGINS["top"]
        sec.bottom_margin = MARGINS["bottom"]
        sec.left_margin = MARGINS["left"]
        sec.right_margin = MARGINS["right"]


def update_base_styles(doc: Document):
    normal = doc.styles["Normal"]
    normal.font.name = LATIN_FONT
    normal.font.size = BODY_SIZE
    rpr = normal._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    rfonts.set(qn("w:ascii"), LATIN_FONT)
    rfonts.set(qn("w:hAnsi"), LATIN_FONT)
    rfonts.set(qn("w:eastAsia"), KOREAN_FONT)
    pf = normal.paragraph_format
    pf.line_spacing_rule = WD_LINE_SPACING.EXACTLY
    pf.line_spacing = LINE_SPACING_PT


def main():
    if not INPUT.exists():
        raise FileNotFoundError(INPUT)

    backup = INPUT.with_name(
        INPUT.stem + "_backup_" + datetime.now().strftime("%Y%m%d_%H%M%S") + INPUT.suffix
    )
    shutil.copy2(INPUT, backup)

    doc = Document(str(INPUT))
    update_section_layout(doc)
    update_base_styles(doc)

    for p in doc.paragraphs:
        bold = any(r.bold for r in p.runs if r.text.strip())
        kind = classify_paragraph(p.style.name, p.text, bold)
        format_paragraph(p, kind)

    doc.save(str(OUTPUT))
    print(f"Backup: {backup}")
    print(f"Saved:  {OUTPUT}")
    print(f"Font:   Korean={KOREAN_FONT}, Latin={LATIN_FONT}, body={BODY_SIZE.pt}pt")
    print(f"Line:   fixed {LINE_SPACING_PT.pt}pt")
    print(f"Char spacing: standard (removed condensed -5/-10)")


if __name__ == "__main__":
    main()
