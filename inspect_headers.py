# -*- coding: utf-8 -*-
from docx import Document
from docx.oxml.ns import qn

path = r"X:\A\liangsc_formatted.docx"
out = r"X:\A\1\inspect_headers.txt"
doc = Document(path)
lines = []

for i, sec in enumerate(doc.sections):
    lines.append(f"=== Section {i} ===")
    for kind, part in [("header", sec.header), ("footer", sec.footer)]:
        lines.append(f"  {kind}: linked={part.is_linked_to_previous}")
        for j, p in enumerate(part.paragraphs):
            lines.append(f"    p{j}: {p.text!r}")

with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print("wrote", out)
