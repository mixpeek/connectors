# Mixpeek Prebid Demo

This example demonstrates the Mixpeek Context Adapter integrated with Prebid.js.

## Setup

1. Build the adapter:
   ```bash
   cd ../..
   npm install
   npm run build
   ```

2. Update the configuration in `index.html`:
   - Replace `YOUR_MIXPEEK_API_KEY` with your actual API key
   - Replace `YOUR_COLLECTION_ID` with your collection ID

3. Start the demo server:
   ```bash
   npm start
   ```

4. Open http://localhost:8080 in your browser

## Features

- Real-time contextual analysis of page content
- Automatic IAB taxonomy classification
- Brand safety scoring
- Keyword extraction
- Live debug panel showing enrichment data
- Multiple ad units with contextual targeting

## How It Works

1. The page loads with article content about mobile phones and AI
2. Mixpeek Context Adapter extracts the page content
3. Content is sent to Mixpeek API for classification
4. Taxonomy, brand safety, and keywords are returned
5. Targeting keys are injected into Prebid ad requests
6. Bidders receive enriched requests with contextual signals
7. Ads are served based on contextual relevance

## Configuration

See the Mixpeek configuration in `index.html`:

```javascript
pbjs.setConfig({
  mixpeek: {
    apiKey: 'YOUR_MIXPEEK_API_KEY',
    collectionId: 'YOUR_COLLECTION_ID',
    mode: 'page',
    featureExtractors: ['taxonomy', 'brand-safety', 'keywords'],
    timeout: 250,
    cacheTTL: 300,
    debug: true
  }
});
```

## Testing

Try changing the article content and refresh the page to see how the contextual data changes.

