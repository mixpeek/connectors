# Fetch IAB Tech Lab's ARTF protos at a pinned commit and generate Python stubs into gen/.
# The protos are AGPL-3.0 (github.com/IABTechLab/agentic-real-time-framework); they are
# downloaded at build time, not vendored here.
ARTF_SHA ?= 9253072ec4bf0b469ce42370525fdd8e00d05384
RAW = https://raw.githubusercontent.com/IABTechLab/agentic-real-time-framework/$(ARTF_SHA)/proto
PROTOS = agenticrtbframework.proto agenticrtbframeworkservices.proto com/iabtechlab/openrtb/v2/openrtb.proto

# Needs: pip install -r requirements.txt grpcio-tools==1.81.0
stubs:
	mkdir -p proto/com/iabtechlab/openrtb/v2 gen
	for p in $(PROTOS); do curl -sfL "$(RAW)/$$p" -o "proto/$$p" || exit 1; done
	python3 -m grpc_tools.protoc -Iproto --python_out=gen --grpc_python_out=gen $(PROTOS)

test: stubs
	python3 -m unittest -v test_agent.py

run: stubs
	python3 agent.py --reference reference/iab_reference.json

.PHONY: stubs test run
