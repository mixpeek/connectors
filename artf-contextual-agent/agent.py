#!/usr/bin/env python3
"""A contextual ARTF agent: IAB Content Taxonomy 3.1 categories from a local index.

Implements the ARTF v1 gRPC service (RTBExtensionPoint.GetMutations). For each bid
request it looks up the content (site.content.id, then site.page, then app.content.id)
in a read-only reference file and proposes one ADD_CIDS mutation on
/site/content/data (or /app/content/data) carrying the IAB 3.1 category IDs as data
segments. The reference file is built ahead of time from a Mixpeek collection
(build_reference.py), so the agent makes no network call during the auction.

    python3 agent.py --reference reference/iab_reference.json --grpc-port 50051 --health-port 8080

Health: GET /health/live and /health/ready on the health port, as in the ARTF
manifest example. Stubs come from IAB Tech Lab's protos (make stubs).
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
import threading
from concurrent import futures
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "gen"))
import grpc  # noqa: E402
import agenticrtbframework_pb2 as pb  # noqa: E402
import agenticrtbframeworkservices_pb2_grpc as svc  # noqa: E402
from com.iabtechlab.openrtb.v2 import openrtb_pb2 as ortb  # noqa: E402

PROVIDER_ID = "mixpeek"
PROVIDER_NAME = "mixpeek-iab-content-3.1"
log = logging.getLogger("artf-contextual")


def load_reference(path: Path) -> dict[str, dict]:
    """Reference file: {"taxonomy": "IAB Content Taxonomy 3.1", "items": {key: {"content_id", "categories": [{"id","name"}]}}}."""
    data = json.loads(path.read_text())
    items = data.get("items")
    if not isinstance(items, dict):
        raise SystemExit(f"{path}: expected an 'items' object")
    return items


class ContextualAgent(svc.RTBExtensionPointServicer):
    def __init__(self, reference: dict[str, dict]):
        self.reference = reference

    def lookup(self, br) -> tuple[str, dict] | tuple[None, None]:
        if br.HasField("site"):
            for key in (br.site.content.id, br.site.page):
                if key and key in self.reference:
                    return "/site/content/data", self.reference[key]
        if br.HasField("app"):
            key = br.app.content.id
            if key and key in self.reference:
                return "/app/content/data", self.reference[key]
        return None, None

    def GetMutations(self, request, context):
        mutations = []
        intents = list(request.applicable_intents)
        if not intents or pb.ADD_CIDS in intents:
            path, hit = self.lookup(request.bid_request)
            if hit and hit.get("categories"):
                data = ortb.BidRequest.Data(id=PROVIDER_ID, name=PROVIDER_NAME)
                for c in hit["categories"]:
                    data.segment.add(id=str(c["id"]), name=c["name"])
                if hit.get("content_id"):
                    data.ext.cids.append(hit["content_id"])
                mutations.append(pb.Mutation(
                    intent=pb.ADD_CIDS, op=pb.OPERATION_ADD, path=path,
                    content_data=pb.DataPayload(data=[data]),
                ))
        log.info("request %s: %d mutation(s)", request.id, len(mutations))
        return pb.RTBResponse(id=request.id, mutations=mutations,
                              metadata=pb.Metadata(api_version="1.0", model_version="iab-content-3.1"))


class Health(BaseHTTPRequestHandler):
    def do_GET(self):
        ok = self.path in ("/health/live", "/health/ready")
        self.send_response(200 if ok else 404)
        self.end_headers()
        self.wfile.write(b"ok\n" if ok else b"not found\n")

    def log_message(self, *a):
        pass


def serve(reference_path: Path, grpc_port: int, health_port: int):
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    svc.add_RTBExtensionPointServicer_to_server(ContextualAgent(load_reference(reference_path)), server)
    bound = server.add_insecure_port(f"0.0.0.0:{grpc_port}")
    server.start()
    health = ThreadingHTTPServer(("0.0.0.0", health_port), Health)
    threading.Thread(target=health.serve_forever, daemon=True).start()
    return server, health, bound


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--reference", type=Path, default=Path("/data/iab_reference.json"))
    ap.add_argument("--grpc-port", type=int, default=50051)
    ap.add_argument("--health-port", type=int, default=8080)
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    server, _, bound = serve(a.reference, a.grpc_port, a.health_port)
    log.info("gRPC on %d, health on %d", bound, a.health_port)
    server.wait_for_termination()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
