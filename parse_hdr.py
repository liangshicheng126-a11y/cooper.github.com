# -*- coding: utf-8 -*-
import re
import zipfile
from pathlib import Path

z = zipfile.ZipFile(r"X:\A\liangsc.docx")
h = z.read("word/header1.xml").decode("utf-8")
lines = []
lines.append("texts: " + str(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", h)))
for m in re.finditer(r'<w:jc w:val="([^"]+)"', h):
    lines.append("jc " + m.group(1))
for m in re.finditer(r'<w:color w:val="([^"]+)"', h):
    lines.append("color " + m.group(1))
for m in re.finditer(r'<w:sz w:val="([^"]+)"', h):
    lines.append("sz " + m.group(1))
Path(r"X:\A\1\hdr_orig.txt").write_text("\n".join(lines), encoding="utf-8")
