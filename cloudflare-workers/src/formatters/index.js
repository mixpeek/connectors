/**
 * Response Formatters
 *
 * Format content profiles for different consumers:
 * - GAM (Google Ad Manager) - Key-value targeting
 * - OpenRTB 2.6 - Prebid Server / SSP integration
 * - Analytics - GA4 / BI tools
 * - JSON - Generic API response
 */

export { formatForGAM } from './gamFormatter.js'
export { formatForOpenRTB } from './openrtbFormatter.js'
export { formatForAnalytics } from './analyticsFormatter.js'
export { formatForJSON } from './jsonFormatter.js'
