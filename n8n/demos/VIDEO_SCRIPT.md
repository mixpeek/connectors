# Mixpeek n8n Node Demo Video Script

## Pre-configured Resources (Ready to Use)

| Resource | ID | Name |
|----------|-----|------|
| Namespace | `ns_1e5bd4df6f` | n8n-demo-v2 |
| Bucket | `bkt_17018bc1` | n8n-demo-bucket |
| Collection | `col_6ca83499cd` | n8n-demo-images |
| Retriever | `ret_df6b91279e4a84` | n8n-demo-search |

## Video Recording Steps (~4-5 minutes)

### Step 1: Install the Node (30 seconds)

1. Open n8n at http://localhost:5678
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Enter: `@mixpeek/n8n-nodes-mixpeek`
5. Click **Install**

### Step 2: Set Up Credentials (30 seconds)

1. Go to **Credentials** → **Add Credential**
2. Search for "Mixpeek" and select **Mixpeek API**
3. Enter API Key: `mxp_sk_qqgwtRt53bzgWJOEMS_Q1JA0O_0q52bp8aZhpra9JkGBKwUnxpu_3sDnNdxV5ZSBz9I`
4. Click **Test Connection** - show it works
5. Click **Save**

### Step 3: Import Demo Workflow

1. Create new workflow
2. Import `mixpeek-demo-workflow.json` from the demos folder
3. Connect credentials to all Mixpeek nodes

### Step 4: Demo the Nodes (2-3 minutes)

Walk through each node and test:

#### 4a. Get Namespace
- Resource: Namespace
- Operation: Get
- Namespace ID: `ns_1e5bd4df6f`
- **Test** → Shows namespace details

#### 4b. Get Bucket
- Resource: Bucket
- Operation: Get
- Bucket ID: `bkt_17018bc1`
- **Test** → Shows bucket with schema

#### 4c. Get Collection
- Resource: Collection
- Operation: Get
- Collection ID: `col_6ca83499cd`
- **Test** → Shows collection config with image extractor

#### 4d. Get Upload URL
- Resource: Upload
- Operation: Create Presigned URL
- Bucket ID: `bkt_17018bc1`
- Filename: `demo_image.jpg`
- Content Type: `image/jpeg`
- **Test** → Returns presigned S3 URL

#### 4e. Execute Search (Main Feature)
- Resource: Retriever
- Operation: Execute
- Retriever ID: `ret_df6b91279e4a84`
- Query: `colorful shapes` (or any text)
- **Test** → Shows semantic search results

### Step 5: AI Agent Integration (30 seconds)

1. Add **AI Agent** node
2. Connect Mixpeek as a tool
3. Show it connects successfully

## Sample Narration

> "I'm demonstrating the Mixpeek community node for n8n.
>
> First, installing the node... done. Now setting up credentials with my API key... testing... works.
>
> Here's the demo workflow. Let me show each operation:
>
> Getting the namespace - this organizes all resources. Bucket - where raw files are stored. Collection - where processed data lives with embeddings.
>
> Now the key feature - semantic search. I'll query 'colorful shapes'... and here are the results ranked by relevance. Mixpeek can search images using natural language.
>
> Finally, this works as an AI agent tool for autonomous search.
>
> That's the Mixpeek node - multimodal search for n8n. Thanks!"

## Quick Commands

Stop n8n when done:
```bash
docker stop n8n-demo && docker rm n8n-demo
```
