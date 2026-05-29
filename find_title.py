# -*- coding: utf-8 -*-
import zipfile
from pathlib import Path

z = zipfile.ZipFile(r"X:\A\liangsc_formatted.docx")
doc = z.read("word/document.xml").decode("utf-8")
out = Path(r"X:\A\1\doc_snip.txt")
lines = []
lines.append(f"title count: {doc.count('타이포')}")
for pat in ["headerReference", "w:hdr", "wp:anchor", "wps:txbx", "v:textbox", "positionH"]:
    lines.append(f"{pat}: {doc.count(pat)}")
idx = 0
n = 0
while True:
    idx = doc.find("타이포", idx)
    if idx == -1:
        break
    n += 1
    lines.append(f"--- occurrence {n} at {idx} ---")
    lines.append(doc[max(0, idx - 300) : idx + 200])
    idx += 1
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
