# Mixpeek n8n Node Demo Video Script

This guide provides step-by-step instructions for recording the verification demo video.

## Prerequisites

Before recording:
- Have your Mixpeek API key ready (from https://app.mixpeek.com)
- Have some data in your Mixpeek account (namespaces, collections, retrievers)
- Use screen recording software (Loom recommended)

## Video Recording Steps

### Step 1: Install the Node (30 seconds)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter: `@mixpeek/n8n-nodes-mixpeek`
5. Select version **1.0.4** (the version being verified)
6. Click **Install**
7. Wait for installation to complete

### Step 2: Create a New Workflow (15 seconds)

1. Click **Workflows** in the sidebar
2. Click **Add Workflow** or **Create new workflow**
3. Name it "Mixpeek Demo"

### Step 3: Set Up Credentials (45 seconds)

1. Click the **+** button to add a node
2. Search for "Mixpeek" and select it
3. Click on **Credential to connect with**
4. Click **Create New Credential**
5. Enter your Mixpeek API Key
6. Leave Base URL as default (`https://api.mixpeek.com`)
7. Click **Test Connection** - show it succeeds
8. Click **Save**

### Step 4: Demo Core Functionality (2-3 minutes)

#### 4a. List Namespaces
1. With Mixpeek node selected, set:
   - **Resource**: Namespace
   - **Operation**: List
2. Click **Test step** - show the results

#### 4b. List Collections
1. Add another Mixpeek node
2. Set:
   - **Resource**: Collection
   - **Operation**: List
3. Click **Test step** - show the results

#### 4c. Execute a Search (Main Feature)
1. Add another Mixpeek node
2. Set:
   - **Resource**: Retriever
   - **Operation**: Execute
   - **Retriever ID**: (paste a retriever ID from your account)
   - **Query**: "your search query"
3. Click **Test step** - show the search results

#### 4d. Show Other Resources (Quick Overview)
Briefly show the dropdown options for other resources:
- Buckets
- Documents
- Uploads
- Tasks
- Taxonomies
- Clusters
- Webhooks
- Inference

### Step 5: AI Agent Tool Demo (30 seconds)

1. Add an **AI Agent** node to the workflow
2. Add the Mixpeek node as a tool
3. Show that it connects properly to the AI Agent
4. (Optional) Run a quick test showing the agent using Mixpeek

## Sample Narration Script

> "Hi, I'm demonstrating the Mixpeek community node for n8n.
>
> First, I'll install the node from npm - searching for @mixpeek/n8n-nodes-mixpeek version 1.0.4.
>
> Now I'll create a new workflow and add the Mixpeek node.
>
> Let me set up my credentials. I'll enter my API key from Mixpeek... and test the connection. Great, it's working.
>
> Let me show the main functionality. First, I'll list my namespaces... Here are my namespaces.
>
> Now let's list collections... And here are my collections with their configurations.
>
> The main feature is semantic search using retrievers. I'll execute a search with a sample query... And here are the search results with relevance scores.
>
> The node supports all Mixpeek API resources - buckets, documents, uploads, tasks, taxonomies, clusters, webhooks, and inference.
>
> Finally, let me show that this works as an AI agent tool. I'll add an AI Agent node and connect Mixpeek as a tool... It connects successfully and can be used by the agent for multimodal search.
>
> That's the Mixpeek node for n8n. Thanks for watching!"

## Tips for Recording

- Record in 1080p or higher
- Keep the video under 5 minutes
- Don't include cuts - record in one take
- Speak clearly if doing voiceover
- Make sure your screen is clearly visible
- Hide any sensitive data (API keys, personal info)

## Demo Workflow

You can import the included `mixpeek-demo-workflow.json` file to have a pre-built workflow structure, then just configure the credentials.
