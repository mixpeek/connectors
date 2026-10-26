# Contextual ARTF agent (IAB Content Taxonomy 3.1)

A sample agent container for IAB Tech Lab's Agentic Real-Time Framework (ARTF) v1. It implements `RTBExtensionPoint.GetMutations` and returns one `ADD_CIDS` mutation with IAB Content Taxonomy 3.1 category IDs for content it finds in a read-only reference file. That file is built ahead of time from a Mixpeek collection, so the agent makes no network call during the auction.

The walkthrough is the guide [Build an ARTF agent container that adds IAB content categories](https://mixpeek.com/guides/artf-contextual-agent-container).

| File | What it is |
|---|---|
| `agent.py` | gRPC server on 50051, `/health/live` and `/health/ready` on 8080 |
| `build_reference.py` | Builds `reference/iab_reference.json` from a collection via `GET /v1/collections/{id}/documents` |
| `reference/iab_reference.json` | Two sample entries with real 3.1 IDs (210, 216, 274, 276) |
| `manifest.json` | ARTF manifest: one intent (`metadataEnhancement`), no dependencies, no egress |
| `Dockerfile` | Puts the Base64 manifest in the `com.iabtechlab.artf.descriptor` label |
| `test_agent.py` | Starts the server and calls it over gRPC |

```bash
pip install -r requirements.txt grpcio-tools==1.81.0
make test   # fetches the ARTF protos at a pinned commit, generates gen/, runs 7 tests
make run
```

The protos are AGPL-3.0 and are downloaded at build time into `proto/` and `gen/` (both gitignored). Nothing from the ARTF repository is vendored here. The code in this folder is MIT.

## What was tested

On 2026-10-19 the 7 tests passed, and grpcurl against the running agent with the ARTF repository's `samples/video-deals.json` (with `ADD_CIDS` added to `applicable_intents`) returned the expected mutation.

Not yet tested: building and running the Docker image, running inside an exchange's ARTF host, image signing, OpenTelemetry, MCP, and latency under load. Treat this as a starting point for your own agent.
