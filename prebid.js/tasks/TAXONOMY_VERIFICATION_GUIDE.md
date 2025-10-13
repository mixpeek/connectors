# Mixpeek Taxonomy Verification Guide

## Purpose

Before we can properly map Mixpeek's taxonomy to IAB codes, we need to verify **what Mixpeek actually returns**.

As noted in `CORRECTED_ANALYSIS.md`, we shouldn't assume the taxonomy format. This guide helps you discover the real structure.

## Three Possible Scenarios

### Scenario A: Mixpeek Already Returns IAB Codes ✅
**Best case** - No mapping needed!

```javascript
{
  "enrichments": {
    "taxonomies": [{
      "label": "IAB19-11",  // Already IAB!
      "node_id": "IAB19-11",
      "path": ["IAB19", "IAB19-11"],
      "score": 0.94
    }]
  }
}
```

**Action:** Just extract and use. No mapping table needed.

### Scenario B: Mixpeek Has Custom Node IDs
**Most likely** - Need node_id → IAB mapping

```javascript
{
  "enrichments": {
    "taxonomies": [{
      "label": "Technology - Artificial Intelligence",
      "node_id": "tech_artificial_intelligence",  // Custom ID
      "path": ["technology", "ai"],
      "score": 0.94
    }]
  }
}
```

**Action:** Populate `MIXPEEK_NODE_TO_IAB` in `src/utils/iabMapping.js`

```javascript
export const MIXPEEK_NODE_TO_IAB = {
  'tech_artificial_intelligence': 'IAB19-11',
  'sports_football': 'IAB17-3',
  // ... etc
}
```

### Scenario C: Generic Labels Only
**Fallback** - Use label-based matching

```javascript
{
  "enrichments": {
    "taxonomies": [{
      "label": "Artificial Intelligence",
      "node_id": null,
      "path": null,
      "score": 0.94
    }]
  }
}
```

**Action:** The `LABEL_TO_IAB` fallback will handle this (less reliable)

## Running the Verification Script

### Step 1: Set Up Environment

```bash
# Export your Mixpeek credentials
export MIXPEEK_API_KEY="your_api_key_here"
export COLLECTION_ID="your_collection_id"

# Optional: Set custom endpoint
export MIXPEEK_ENDPOINT="https://api.mixpeek.com"
```

### Step 2: Run the Script

```bash
node scripts/verify-mixpeek-taxonomy.js
```

### Step 3: Review Output

The script will:
1. ✅ List all available feature extractors
2. ✅ Get taxonomy extractor configuration
3. ✅ Test with 5 different content samples
4. ✅ Show you the exact `node_id` and `label` values returned
5. ✅ Indicate if IAB codes are already present

### Example Output

```
🔍 MIXPEEK TAXONOMY VERIFICATION
================================================================================

Endpoint:      https://api.mixpeek.com
Collection ID: col_abc123
API Key:       sk_1234567...

📋 Step 1: Listing available feature extractors...

✅ Available extractors:
  - taxonomy
  - brand-safety
  - keywords
  - sentiment

📋 Step 2: Getting taxonomy extractor details...

✅ Taxonomy extractor configuration:
{
  "id": "taxonomy",
  "version": "1.0",
  "taxonomy_type": "custom"  ← KEY INSIGHT!
}

📋 Step 3: Testing taxonomy with sample content...

🧪 Testing with sample: tech_ai
   Content: "Article about artificial intelligence and machine..."

✅ Success! Taxonomy response:

   Taxonomy 1:
     label:    "Technology - Artificial Intelligence"
     node_id:  "tech_artificial_intelligence"  ← THIS IS WHAT YOU NEED!
     path:     ["technology", "ai", "machine_learning"]
     score:    0.94
     ⚠️  Needs mapping - add to MIXPEEK_NODE_TO_IAB:
        'tech_artificial_intelligence': 'IAB19-11',

...more samples...

✅ VERIFICATION COMPLETE

Next steps:
1. Review the node_id values returned above
2. Update src/utils/iabMapping.js MIXPEEK_NODE_TO_IAB with actual mappings
3. Map each Mixpeek node_id to the appropriate IAB code
```

## Step 4: Update the Mapping

Based on the output, update `/src/utils/iabMapping.js`:

```javascript
export const MIXPEEK_NODE_TO_IAB = {
  // Replace placeholders with actual Mixpeek node_ids from verification
  'tech_artificial_intelligence': 'IAB19-11',
  'tech_software': 'IAB19-18',
  'sports_football': 'IAB17-3',
  'business_finance': 'IAB13-7',
  // ... add all discovered mappings
}
```

## IAB Category Reference

Use the official IAB Content Taxonomy to find the right codes:
https://iabtechlab.com/standards/content-taxonomy/

### Common IAB Categories

| Category | IAB Code | Description |
|----------|----------|-------------|
| Technology & Computing | IAB19 | General tech |
| - Artificial Intelligence | IAB19-11 | AI/ML content |
| - Software | IAB19-18 | Software/apps |
| Sports | IAB17 | All sports |
| - Football | IAB17-3 | American football |
| - Soccer | IAB17-44 | Soccer/football |
| News | IAB12 | News content |
| - Technology News | IAB12-6 | Tech news |
| Business & Finance | IAB13 | Business topics |
| - Financial Planning | IAB13-7 | Finance/banking |
| Entertainment | IAB9 | Entertainment |
| - Movies | IAB9-7 | Film content |
| Health & Fitness | IAB7 | Health topics |
| - Fitness | IAB7-18 | Exercise/fitness |

Full list: [IAB Tech Lab Content Taxonomy v3.0](https://iabtechlab.com/wp-content/uploads/2021/03/IAB-Tech-Lab-Content-Taxonomy-V3.xlsx)

## Testing After Mapping

Once you've updated the mapping, test it:

```javascript
// In browser console or test file
import { getIABFromTaxonomy } from './src/utils/iabMapping.js'

const taxonomy = {
  label: "Technology - Artificial Intelligence",
  node_id: "tech_artificial_intelligence",
  score: 0.94
}

const iabCode = getIABFromTaxonomy(taxonomy)
console.log(iabCode) // Should output: "IAB19-11"
```

## Fallback Behavior

The IAB mapper uses a multi-strategy approach:

1. ✅ **Check if already IAB code** (Scenario A)
   - Looks for `IAB\d+(-\d+)?` pattern in label or node_id
   - If found, uses it directly

2. ✅ **Map by node_id** (Scenario B)
   - Looks up node_id in `MIXPEEK_NODE_TO_IAB`
   - Most reliable when properly configured

3. ✅ **Map by label text** (Scenario C)
   - Falls back to `LABEL_TO_IAB` for keyword matching
   - Less precise but provides coverage

4. ✅ **Try path matching**
   - Searches through path array for known terms
   - Last resort fallback

## Troubleshooting

### No taxonomies returned

```
✅ Success! Taxonomy response:
   No taxonomies in response
```

**Possible causes:**
- Taxonomy extractor not configured in collection
- Content too short or unclear
- Feature extractor ID incorrect

**Solution:**
- Check collection configuration
- Verify `feature_extractor_id: 'taxonomy'` is correct
- Try with longer, clearer content

### API errors (401, 403)

```
❌ Error: Status 401
```

**Solution:**
- Verify `MIXPEEK_API_KEY` is correct
- Check API key hasn't expired
- Ensure API key has permissions for the collection

### Timeout errors

**Solution:**
- Increase timeout if using dev server
- Add delays between requests (rate limiting)
- Check network connection

## Next Steps

After verification:

1. ✅ Update `MIXPEEK_NODE_TO_IAB` with discovered mappings
2. ✅ Test the IAB mapper with real responses
3. ✅ Document any edge cases or special handling
4. ✅ Add tests for your specific taxonomy structure
5. ✅ Create a mapping maintenance plan (new categories, updates)

## Questions to Ask Mixpeek Team

If the verification reveals unexpected results:

1. **What taxonomy system does Mixpeek use?**
   - Custom? IAB? Other standard?
   
2. **What's the format of node_id values?**
   - Hierarchical? Flat? Code-based?
   
3. **Can the taxonomy be configured to return IAB codes directly?**
   - Would eliminate need for mapping
   
4. **How stable are the node_id values?**
   - Will they change? Need versioning?
   
5. **Is there a complete list of all possible taxonomies?**
   - Helps pre-populate mapping

---

**Remember:** Don't assume - verify first, then map!

