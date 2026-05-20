# -*- coding: utf-8 -*-
"""Build bibliographic corpus from two seed papers + references for VOSviewer."""
import json
import os
import re
import time
import urllib.parse
import urllib.request
from collections import defaultdict

OUT_DIR = r"X:\A\1\vos_data"
SEED_DOIS = ["10.3390/su18073200", "10.1007/s44163-026-00937-6"]
MAILTO = "vos-corpus@local"


def api_get(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": f"mailto:{MAILTO}"}
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read())


def openalex_id_from_doi(doi):
    w = api_get(f"https://api.openalex.org/works/https://doi.org/{doi}")
    return w["id"].split("/")[-1], w


def fetch_works_by_ids(ids):
    works = []
    chunk = 50
    for i in range(0, len(ids), chunk):
        batch = ids[i : i + chunk]
        filt = "|".join(batch)
        url = (
            "https://api.openalex.org/works?"
            + urllib.parse.urlencode(
                {
                    "filter": f"openalex_id:{filt}",
                    "per-page": 50,
                    "select": "id,title,publication_year,authorships,keywords,concepts,doi,primary_location",
                }
            )
        )
        data = api_get(url)
        works.extend(data.get("results", []))
        time.sleep(0.2)
    return works


def work_to_record(w, seed=False):
    title = (w.get("title") or "").strip()
    year = w.get("publication_year") or ""
    doi = w.get("doi") or ""
    if doi.startswith("https://"):
        doi = doi.replace("https://doi.org/", "")

    authors = []
    institutions = []
    countries = []
    for a in w.get("authorships", []):
        name = (a.get("author") or {}).get("display_name", "")
        if name:
            authors.append(name)
        for inst in a.get("institutions") or []:
            iname = inst.get("display_name") or ""
            ccode = inst.get("country_code") or ""
            if iname and iname not in institutions:
                institutions.append(iname)
            if ccode and ccode not in countries:
                countries.append(ccode)

    keywords = []
    for kw in w.get("keywords") or []:
        if isinstance(kw, dict):
            keywords.append(kw.get("display_name", ""))
        else:
            keywords.append(str(kw))
    if not keywords:
        for c in (w.get("concepts") or [])[:6]:
            if c.get("score", 0) >= 0.35:
                keywords.append(c.get("display_name", ""))

    journal = ""
    pl = w.get("primary_location") or {}
    src = pl.get("source") or {}
    journal = src.get("display_name") or ""

    return {
        "id": w.get("id", ""),
        "title": title,
        "year": year,
        "doi": doi,
        "authors": authors,
        "institutions": institutions,
        "countries": countries,
        "keywords": [k for k in keywords if k],
        "journal": journal,
        "seed": seed,
    }


def write_ris(records, path):
    lines = []
    for r in records:
        lines.append("TY  - JOUR")
        for au in r["authors"]:
            parts = au.split(",")
            if len(parts) == 2:
                lines.append(f"AU  - {parts[0].strip()}, {parts[1].strip()}")
            else:
                parts = au.rsplit(" ", 1)
                if len(parts) == 2:
                    lines.append(f"AU  - {parts[1]}, {parts[0]}")
                else:
                    lines.append(f"AU  - {au}")
        lines.append(f"TI  - {r['title']}")
        if r["journal"]:
            lines.append(f"JO  - {r['journal']}")
        if r["year"]:
            lines.append(f"PY  - {r['year']}")
        if r["doi"]:
            lines.append(f"DO  - {r['doi']}")
        for kw in r["keywords"]:
            lines.append(f"KW  - {kw}")
        for inst in r["institutions"]:
            lines.append(f"C1  - {inst}")
        for c in r["countries"]:
            lines.append(f"AD  - Country: {c}")
        lines.append("ER  - ")
        lines.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    all_ids = set()
    seeds = []
    ref_ids = []

    for doi in SEED_DOIS:
        oid, w = openalex_id_from_doi(doi)
        all_ids.add(oid)
        seeds.append(work_to_record(w, seed=True))
        for rid in w.get("referenced_works") or []:
            rid_short = rid.split("/")[-1]
            ref_ids.append(rid_short)
            all_ids.add(rid_short)

    ref_ids_unique = [x for x in ref_ids if x not in {s["id"].split("/")[-1] for s in seeds}]
    print(f"Seed papers: {len(seeds)}, reference IDs: {len(set(ref_ids_unique))}")

    ref_works = fetch_works_by_ids(list(set(ref_ids_unique)))
    records_map = {s["id"]: s for s in seeds}
    for w in ref_works:
        rec = work_to_record(w, seed=False)
        records_map[rec["id"]] = rec

    records = list(records_map.values())
    records = [r for r in records if r["title"]]

    ris_path = os.path.join(OUT_DIR, "corpus.ris")
    json_path = os.path.join(OUT_DIR, "corpus.json")
    write_ris(records, ris_path)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(records)} records -> {ris_path}")
    return records


if __name__ == "__main__":
    main()
