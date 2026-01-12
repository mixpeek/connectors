# Mixpeek n8n Node Demo Video Script

This guide provides step-by-step instructions for recording the verification demo video.

## Prerequisites

Before recording:
- Have your Mixpeek API key ready (from https://app.mixpeek.com)
- Have a sample file to upload (image, video, or document)
- Use screen recording software (Loom recommended)

## Video Recording Steps (~4-5 minutes)

### Step 1: Install the Node (30 seconds)

1. Open your n8n instance at http://localhost:5678
2. Go to **Settings** (gear icon) → **Community Nodes**
3. Click **Install a community node**
4. Enter: `@mixpeek/n8n-nodes-mixpeek`
5. Click **Install**
6. Wait for installation to complete

### Step 2: Set Up Credentials (30 seconds)

1. Click **Credentials** in the sidebar
2. Click **Add Credential**
3. Search for "Mixpeek" and select **Mixpeek API**
4. Enter your API Key from https://app.mixpeek.com
5. Click **Test Connection** - show it succeeds
6. Click **Save**

### Step 3: Create Workflow - Setup Resources (1-2 minutes)

Create a new workflow called "Mixpeek Demo"

#### 3a. Create a Bucket
1. Add **Manual Trigger** node
2. Add **Mixpeek** node, connect to trigger
3. Configure:
   - **Resource**: Bucket
   - **Operation**: Create
   - **Bucket Name**: "demo-bucket"
4. Click **Test step** - show bucket created

#### 3b. Create a Collection
1. Add another **Mixpeek** node
2. Configure:
   - **Resource**: Collection
   - **Operation**: Create
   - **Collection Name**: "demo-collection"
   - **Additional Fields** → **Bucket ID**: (paste from previous step)
3. Click **Test step** - show collection created

### Step 4: Upload & Process Content (1 minute)

#### 4a. Create Upload URL
1. Add **Mixpeek** node
2. Configure:
   - **Resource**: Upload
   - **Operation**: Create Presigned URL
   - **Bucket ID**: (your bucket ID)
   - **Filename**: "sample.jpg" (or your file)
   - **Content Type**: "image/jpeg"
3. Click **Test step** - show presigned URL returned

#### 4b. Confirm Upload
1. Add **Mixpeek** node
2. Configure:
   - **Resource**: Upload
   - **Operation**: Confirm
   - **Bucket ID**: (your bucket ID)
   - **Upload ID**: (from previous step)
3. Click **Test step** - show upload confirmed

### Step 5: Search Content (1 minute)

#### 5a. Create/Get Retriever
1. Add **Mixpeek** node
2. Configure:
   - **Resource**: Retriever
   - **Operation**: List (or Create if needed)
3. Click **Test step** - show retrievers

#### 5b. Execute Search
1. Add **Mixpeek** node
2. Configure:
   - **Resource**: Retriever
   - **Operation**: Execute
   - **Retriever ID**: (your retriever ID)
   - **Query**: "describe what's in the image" (or relevant query)
3. Click **Test step** - **Show the search results!** (This is the key demo)

### Step 6: AI Agent Integration (30 seconds)

1. Add **AI Agent** node
2. Add **OpenAI Chat Model** (or other LLM)
3. Connect Mixpeek as a **Tool** to the agent
4. Show the connection works
5. (Optional) Quick test: "Search for images containing..."

## Sample Narration Script

> "Hi, I'm demonstrating the Mixpeek community node for n8n.
>
> First, I'll install the node - searching for @mixpeek/n8n-nodes-mixpeek... installed.
>
> Let me set up my credentials with my Mixpeek API key... testing connection... perfect, it works.
>
> Now I'll show a complete workflow. First, I'll create a bucket to store our content... done.
>
> Next, I'll create a collection - this is where Mixpeek processes and indexes our content... created.
>
> Now let's upload some content. I'll get a presigned URL for my file... and confirm the upload. Mixpeek will now process this file and extract features for search.
>
> Here's the main feature - semantic search. I'll execute a search query on my retriever... and here are the results with relevance scores. Mixpeek found matching content based on the semantic meaning, not just keywords.
>
> Finally, this works as an AI agent tool. I'll connect Mixpeek to an AI Agent... and now the agent can search my multimodal content autonomously.
>
> That's the Mixpeek node for n8n - enabling multimodal search in your workflows. Thanks!"

## Quick Reference - Resource Flow

```
Namespace (optional)
    └── Bucket (storage)
           └── Upload (files)
           └── Collection (indexed content)
                  └── Documents (processed items)
                         └── Retriever (search)
```

## Tips for Recording

- Record in 1080p or higher
- Keep the video under 5 minutes
- Don't include cuts - record in one take
- Speak clearly if doing voiceover
- Make sure results are clearly visible
- Hide any sensitive data (API keys, personal info)
- Have your Mixpeek account pre-populated with some data for faster demo
