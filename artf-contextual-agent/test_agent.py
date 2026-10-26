"""End-to-end tests: start the gRPC server and call GetMutations over the wire.

Run: make test (fetches the ARTF protos and generates stubs first).
"""
import json
import sys
import unittest
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE / "gen"))
import grpc  # noqa: E402
from google.protobuf import json_format  # noqa: E402
import agenticrtbframework_pb2 as pb  # noqa: E402
import agenticrtbframeworkservices_pb2_grpc as svc  # noqa: E402
import agent  # noqa: E402
import build_reference  # noqa: E402

SAMPLE = {  # shaped like samples/video-deals.json in the ARTF repo
    "id": "sample-video-001", "tmax": 150, "lifecycle": "LIFECYCLE_PUBLISHER_BID_REQUEST",
    "applicable_intents": ["ACTIVATE_SEGMENTS", "ADD_CIDS"],
    "bid_request": {"id": "auction-456", "imp": [{"id": "imp-1", "video": {"mimes": ["video/mp4"]}}],
                    "site": {"id": "site-789", "page": "https://streaming.example.com/watch/12345",
                             "content": {"id": "content-12345", "title": "Example Video Content"}}},
}


def request(overrides=None):
    body = json.loads(json.dumps(SAMPLE))
    for k, v in (overrides or {}).items():
        body[k] = v
    return json_format.ParseDict(body, pb.RTBRequest())


class AgentTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server, cls.health, port = agent.serve(HERE / "reference" / "iab_reference.json", 0, 0)
        cls.health_port = cls.health.server_address[1]
        cls.channel = grpc.insecure_channel(f"127.0.0.1:{port}")
        cls.stub = svc.RTBExtensionPointStub(cls.channel)

    @classmethod
    def tearDownClass(cls):
        cls.channel.close()
        cls.server.stop(0)
        cls.health.shutdown()

    def call(self, req):
        return self.stub.GetMutations(req, timeout=5)

    def test_known_content_gets_add_cids_with_iab_ids(self):
        resp = self.call(request())
        self.assertEqual(resp.id, "sample-video-001")
        self.assertEqual(len(resp.mutations), 1)
        m = resp.mutations[0]
        self.assertEqual((m.intent, m.op, m.path), (pb.ADD_CIDS, pb.OPERATION_ADD, "/site/content/data"))
        data = m.content_data.data[0]
        self.assertEqual((data.id, data.name), ("mixpeek", "mixpeek-iab-content-3.1"))
        self.assertEqual([(s.id, s.name) for s in data.segment], [("210", "Food & Drink"), ("216", "Cooking")])
        self.assertEqual(list(data.ext.cids), ["content-12345"])

    def test_page_url_is_the_fallback_key(self):
        site = {"id": "s", "page": "https://news.example.com/2026/10/home-remodel", "content": {"id": "unknown"}}
        resp = self.call(request({"bid_request": {"id": "a", "imp": [{"id": "1"}], "site": site}}))
        self.assertEqual([s.id for s in resp.mutations[0].content_data.data[0].segment], ["274", "276"])

    def test_app_content_uses_app_path(self):
        resp = self.call(request({"bid_request": {"id": "a", "imp": [{"id": "1"}], "app": {"id": "ctv", "content": {"id": "content-12345"}}}}))
        self.assertEqual(resp.mutations[0].path, "/app/content/data")

    def test_unknown_content_returns_no_mutations(self):
        site = {"id": "s", "page": "https://nowhere.example.com/", "content": {"id": "nope"}}
        resp = self.call(request({"bid_request": {"id": "a", "imp": [{"id": "1"}], "site": site}}))
        self.assertEqual(len(resp.mutations), 0)

    def test_respects_applicable_intents(self):
        resp = self.call(request({"applicable_intents": ["ACTIVATE_DEALS"]}))
        self.assertEqual(len(resp.mutations), 0)

    def test_health_endpoints(self):
        for path in ("/health/live", "/health/ready"):
            with urllib.request.urlopen(f"http://127.0.0.1:{self.health_port}{path}", timeout=5) as r:
                self.assertEqual(r.status, 200)


class BuildReferenceTest(unittest.TestCase):
    def test_groups_categories_by_key_and_skips_untagged(self):
        docs = [
            {"metadata": {"content_id": "c1"}, "iab_category_id": "210", "iab_category_name": "Food & Drink"},
            {"metadata": {"content_id": "c1"}, "iab_category_id": "216", "iab_category_name": "Cooking"},
            {"metadata": {"content_id": "c1"}, "iab_category_id": "216", "iab_category_name": "Cooking"},
            {"metadata": {"content_id": "c2"}},
            {"iab_category_id": "1", "iab_category_name": "Automotive"},
        ]
        ref = build_reference.build(docs, "metadata.content_id", "iab_category_id", "iab_category_name")
        self.assertEqual(list(ref["items"]), ["c1"])
        self.assertEqual([c["id"] for c in ref["items"]["c1"]["categories"]], ["210", "216"])
        self.assertEqual(ref["skipped_documents"], 2)


if __name__ == "__main__":
    unittest.main()
