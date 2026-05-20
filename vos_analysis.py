# -*- coding: utf-8 -*-
"""Bibliometric networks (VOSviewer-style) + export stats for Word report."""
import json
import os
from collections import Counter, defaultdict
from itertools import combinations

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import networkx as nx

DATA_DIR = r"X:\A\1\vos_data"
CORPUS = os.path.join(DATA_DIR, "corpus.json")
OUT_DIR = os.path.join(DATA_DIR, "output")
plt.rcParams["font.sans-serif"] = ["Microsoft YaHei", "SimHei", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False


def load_corpus():
    with open(CORPUS, encoding="utf-8") as f:
        return json.load(f)


def keyword_cooccurrence(records, min_count=2):
    """Co-occurrence within same document."""
    pair_counts = Counter()
    kw_doc_freq = Counter()
    for r in records:
        kws = sorted(set(k.lower().strip() for k in r["keywords"] if k))
        for k in kws:
            kw_doc_freq[k] += 1
        for a, b in combinations(kws, 2):
            pair_counts[(a, b)] += 1
    G = nx.Graph()
    for (a, b), w in pair_counts.items():
        if w >= min_count:
            G.add_edge(a, b, weight=w)
    for n in G.nodes():
        G.nodes[n]["size"] = kw_doc_freq.get(n, 1)
    return G, kw_doc_freq, pair_counts


def author_collaboration(records):
    G = nx.Graph()
    for r in records:
        authors = sorted(set(r["authors"]))
        for a, b in combinations(authors, 2):
            if G.has_edge(a, b):
                G[a][b]["weight"] += 1
            else:
                G.add_edge(a, b, weight=1)
    return G


def affiliation_collaboration(records):
    G = nx.Graph()
    for r in records:
        insts = sorted(set(r["institutions"]))
        for a, b in combinations(insts, 2):
            if G.has_edge(a, b):
                G[a][b]["weight"] += 1
            else:
                G.add_edge(a, b, weight=1)
    return G


def country_collaboration(records):
    G = nx.Graph()
    for r in records:
        countries = sorted(set(r["countries"]))
        for a, b in combinations(countries, 2):
            if G.has_edge(a, b):
                G[a][b]["weight"] += 1
            else:
                G.add_edge(a, b, weight=1)
    return G


def draw_network(G, title, path, label_max=25):
    if G.number_of_nodes() == 0:
        return False
    plt.figure(figsize=(14, 10))
    if G.number_of_edges() == 0 and G.number_of_nodes() > 1:
        pos = nx.spring_layout(G, seed=42, k=2)
    else:
        pos = nx.spring_layout(G, seed=42, weight="weight", k=1.2)
    weights = [G[u][v].get("weight", 1) for u, v in G.edges()]
    max_w = max(weights) if weights else 1
    widths = [1 + 4 * (w / max_w) for w in weights] if weights else []
    sizes = [
        300 + 80 * G.nodes[n].get("size", G.degree(n) + 1) for n in G.nodes()
    ]
    nx.draw_networkx_edges(G, pos, width=widths or 0.5, alpha=0.55, edge_color="#4a6fa5")
    nx.draw_networkx_nodes(
        G, pos, node_size=sizes[: len(G.nodes)], node_color="#c45c48", alpha=0.85
    )
    labels = {n: (n[:28] + "…" if len(n) > 30 else n) for n in list(G.nodes())[:label_max]}
    if G.number_of_nodes() <= label_max:
        labels = {n: (n[:28] + "…" if len(n) > 30 else n) for n in G.nodes()}
    nx.draw_networkx_labels(G, pos, labels=labels, font_size=8)
    plt.title(title, fontsize=14)
    plt.axis("off")
    plt.tight_layout()
    plt.savefig(path, dpi=150, bbox_inches="tight")
    plt.close()
    return True


def top_items(counter, n=15):
    return counter.most_common(n)


def summarize_graph(G, name):
    degs = dict(G.degree())
    top_nodes = sorted(degs.items(), key=lambda x: -x[1])[:12]
    return {
        "name": name,
        "nodes": G.number_of_nodes(),
        "edges": G.number_of_edges(),
        "top_nodes": top_nodes,
    }


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    records = load_corpus()
    seeds = [r for r in records if r.get("seed")]

    kwG, kw_freq, pairs = keyword_cooccurrence(records, min_count=2)
    auG = author_collaboration(records)
    instG = affiliation_collaboration(records)
    ctyG = country_collaboration(records)

    paths = {
        "keyword": os.path.join(OUT_DIR, "network_keywords.png"),
        "author": os.path.join(OUT_DIR, "network_authors.png"),
        "institution": os.path.join(OUT_DIR, "network_institutions.png"),
        "country": os.path.join(OUT_DIR, "network_countries.png"),
    }
    draw_network(kwG, "Keyword co-occurrence network", paths["keyword"], 30)
    draw_network(auG, "Author collaboration network", paths["author"], 35)
    draw_network(instG, "Institution collaboration network", paths["institution"], 30)
    draw_network(ctyG, "Country collaboration network", paths["country"], 20)

    report = {
        "corpus_size": len(records),
        "seed_papers": [
            {"title": s["title"], "doi": s["doi"], "authors": s["authors"]}
            for s in seeds
        ],
        "top_keywords": top_items(kw_freq, 20),
        "top_keyword_pairs": top_items(
            Counter({f"{a} | {b}": c for (a, b), c in pairs.items()}), 20
        ),
        "graphs": [
            summarize_graph(kwG, "keywords"),
            summarize_graph(auG, "authors"),
            summarize_graph(instG, "institutions"),
            summarize_graph(ctyG, "countries"),
        ],
        "images": paths,
    }
    with open(os.path.join(OUT_DIR, "analysis_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(json.dumps(report, ensure_ascii=False, indent=2)[:3000])


if __name__ == "__main__":
    main()
