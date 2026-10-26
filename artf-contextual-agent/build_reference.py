#!/usr/bin/env python3
"""Build the agent's reference file from a Mixpeek collection.

Reads every document of a collection that a taxonomy enrichment has tagged with IAB
Content Taxonomy 3.1 fields, groups them by a content key (the value the exchange
will send as site.content.id, site.page or app.content.id), and writes
{"taxonomy", "items": {key: {"content_id", "categories": [{"id","name"}]}}}.

    MIXPEEK_API_KEY=... python3 build_reference.py --collection col_123 \
        --key-field metadata.content_id --out reference/iab_reference.json

Uses GET /v1/collections/{collection}/documents (cursor pagination). Field names
default to the IAB taxonomy template's outputs (iab_category_id, iab_category_name).
"""
from __future__ import annotations

import argparse
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path


def dig(doc: dict, path: str):
    cur = doc
    for part in path.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur


def fetch(api: str, key: str, collection: str, namespace: str | None):
    cursor = None
    while True:
        q = {"page_size": "100"}
        if cursor:
            q["cursor"] = cursor
        req = urllib.request.Request(
            f"{api}/v1/collections/{urllib.parse.quote(collection)}/documents?{urllib.parse.urlencode(q)}",
            headers={"Authorization": f"Bearer {key}", **({"X-Namespace": namespace} if namespace else {})},
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            body = json.load(r)
        yield from body.get("results") or []
        cursor = (body.get("pagination") or {}).get("next_cursor")
        if not cursor:
            return


def build(docs, key_field: str, id_field: str, name_field: str) -> dict:
    items: dict[str, dict] = {}
    skipped = 0
    for doc in docs:
        k, cid, name = dig(doc, key_field), dig(doc, id_field), dig(doc, name_field)
        if not k or cid in (None, ""):
            skipped += 1
            continue
        item = items.setdefault(str(k), {"content_id": str(k), "categories": []})
        if all(c["id"] != str(cid) for c in item["categories"]):
            item["categories"].append({"id": str(cid), "name": str(name or "")})
    return {"taxonomy": "IAB Content Taxonomy 3.1", "items": items, "skipped_documents": skipped}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--collection", required=True)
    ap.add_argument("--namespace")
    ap.add_argument("--key-field", required=True)
    ap.add_argument("--id-field", default="iab_category_id")
    ap.add_argument("--name-field", default="iab_category_name")
    ap.add_argument("--api", default=os.environ.get("MIXPEEK_API_URL", "https://api.mixpeek.com"))
    ap.add_argument("--out", type=Path, required=True)
    a = ap.parse_args()
    key = os.environ.get("MIXPEEK_API_KEY")
    if not key:
        raise SystemExit("set MIXPEEK_API_KEY")
    ref = build(fetch(a.api, key, a.collection, a.namespace), a.key_field, a.id_field, a.name_field)
    a.out.write_text(json.dumps(ref, indent=1) + "\n")
    print(f"{len(ref['items'])} content keys, {ref['skipped_documents']} documents without a key or category")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
