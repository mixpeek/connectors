# Build: make stubs && docker build --build-arg MANIFEST_B64="$(base64 < manifest.json | tr -d '\n')" -t mixpeek-iab-contextual:0.1.0 .
# Run:   docker run --rm -p 50051:50051 -p 8080:8080 -v "$PWD/reference:/data:ro" mixpeek-iab-contextual:0.1.0
FROM python:3.12-slim
ARG MANIFEST_B64=""
LABEL com.iabtechlab.artf.descriptor="${MANIFEST_B64}" \
      com.iabtechlab.artf.container-version="0.1.0"
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
WORKDIR /app
COPY agent.py ./
COPY gen ./gen
RUN useradd --uid 10001 --no-create-home artf
USER 10001
EXPOSE 50051 8080
ENTRYPOINT ["python3", "agent.py", "--reference", "/data/iab_reference.json"]
