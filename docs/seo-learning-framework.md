# SEO Learning Framework for GA4 + Google Search Console

## Overview

This framework helps the team understand:
- Which pages Google is testing
- Which queries show demand
- Which pages need improvement
- Where to scale content safely (avoid thin content issues)

---

## 1. Page Type Classification

### Page Types
- `flight_route` → `/flights/[route]`
- `airport` → `/airports/[iata]`
- `airline` → `/airlines/[airline]`
- `airline_route` → `/airlines/[airline]/[route]`
- `blog` → `/blog/[slug]`

### Implementation
See `lib/pageType.ts` for `getPageType(pathname)` utility.

---

## 2. GA4 Event Standardization

All GA4 events include:
- `page_type` - Classification from pageType.ts
- `entity_primary` - Main entity (route / airport / airline)
- `entity_secondary` - Optional secondary entity

### Standard Events
- `view_route` - Flight route page views
- `view_airport` - Airport page views
- `view_airline` - Airline page views
- `click_booking` - Booking button clicks

---

## 3. Search Console Learning Checklist

### Weekly GSC Checks

1. **Performance Report**
   - Sort by Impressions (descending)
   - Identify pages with impressions but CTR < 2%
   - Note queries with position 8-20

2. **Pages Report**
   - Check "Not indexed" section
   - Review "Indexed, not submitted in sitemap"
   - Monitor "Crawled - currently not indexed"

3. **Queries Report**
   - Filter by position 8-20
   - Identify informational queries
   - Note commercial intent queries

### Monthly GSC Checks

1. **Coverage Report**
   - Review excluded pages
   - Check for thin content warnings
   - Monitor duplicate content issues

2. **Enhancements Report**
   - Review structured data errors
   - Check mobile usability
   - Monitor Core Web Vitals

3. **Links Report**
   - Identify top linked pages
   - Check for broken internal links
   - Review external links

---

## 4. Query → Page Matching Strategy

### Informational Queries
**Pattern**: "What", "How", "When", "Where", "Why"
**Target Pages**: Airport / Route page sections
**Action**: Expand FAQ sections, add detailed information blocks

**Examples**:
- "how many flights from delhi to mumbai" → `/flights/del-bom` FAQ section
- "what airlines fly to jfk" → `/airports/jfk` airlines section
- "when is the best time to fly to bangalore" → Route page insights

### Commercial Queries
**Pattern**: "Book", "Buy", "Price", "Cheap", "Deal"
**Target Pages**: Airline / Booking CTA
**Action**: Optimize booking CTAs, add price information

**Examples**:
- "cheap flights delhi mumbai" → `/flights/del-bom` price calendar
- "book air india flights" → `/airlines/ai` booking section
- "best price delhi to bangalore" → Route page price statistics

### Seasonal Queries
**Pattern**: "Best time", "Weather", "Season", "Month"
**Target Pages**: Weather / Best time sections
**Action**: Add seasonal insights, monthly price data

**Examples**:
- "best time to visit mumbai" → Route page insights
- "weather in delhi" → Airport page information
- "cheapest month to fly" → Route page price calendar

### Navigational Queries
**Pattern**: Brand names, airline names, airport codes
**Target Pages**: Brand / Airline profile
**Action**: Optimize brand pages, add comprehensive information

**Examples**:
- "air india" → `/airlines/ai`
- "delhi airport" → `/airports/del`
- "indigo flights" → `/airlines/6e`

---

## 5. Safe Scale Content Rules (Anti-Thin Content)

### When NOT to Expand Routes

1. **Low Demand Signals**
   - Impressions < 10/month in GSC
   - No clicks in 90 days
   - Position > 50 consistently

2. **Quality Thresholds**
   - Page quality score < 0.5
   - Missing core data (flights, schedules)
   - No user engagement signals

3. **Duplicate Content Risk**
   - Similar routes already exist with better content
   - No unique value proposition
   - Would create thin content

### When to Noindex Low-Demand Pages

1. **Criteria**
   - Impressions < 5/month for 6+ months
   - Position > 100 consistently
   - Quality score < 0.3
   - No backlinks or internal links

2. **Process**
   - Add `noindex` in metadata
   - Remove from sitemap
   - Keep in database for internal use
   - Monitor for demand increase

### Minimum Engagement Signals Before Scaling

1. **Required Metrics**
   - Impressions > 50/month
   - CTR > 1%
   - Position improving (8-20 range)
   - At least 1 click in last 30 days

2. **Content Requirements**
   - Core data present (flights, schedules)
   - Basic FAQ section
   - At least 500 words of unique content
   - Working internal links

### How to Avoid Google "Scaled Content Abuse"

1. **Quality Over Quantity**
   - Focus on top 1000 routes by demand
   - Ensure each page has unique value
   - Add location-specific insights
   - Include user-generated signals (if available)

2. **Content Differentiation**
   - Unique airport information
   - Route-specific insights
   - Airline-specific details
   - Local context and tips

3. **Regular Updates**
   - Update flight schedules monthly
   - Refresh price data weekly
   - Add new FAQs based on queries
   - Monitor and improve based on GSC data

4. **Internal Linking Strategy**
   - Link from high-authority pages
   - Create topic clusters
   - Use descriptive anchor text
   - Maintain logical site structure

---

## 6. Decision Framework

### Improve Existing Page
**When**:
- Position 8-20
- Impressions > 50/month
- CTR < 2%
- Quality score 0.5-0.7

**Actions**:
- Expand FAQ section
- Add missing data
- Improve content quality
- Optimize meta description
- Add internal links

### Expand Content
**When**:
- Position 4-10
- Impressions > 100/month
- CTR improving
- Quality score > 0.7

**Actions**:
- Add detailed sections
- Include more FAQs
- Add related information
- Create supporting content
- Add visual elements

### Create Supporting Blog
**When**:
- Informational queries
- Position 8-20
- High search volume
- Related to existing pages

**Actions**:
- Write comprehensive guide
- Link to relevant pages
- Include structured data
- Add visual content
- Promote internally

### Wait (No Action)
**When**:
- Position > 50
- Impressions < 10/month
- No improvement trend
- Quality score < 0.3

**Actions**:
- Monitor monthly
- Check for trend changes
- Review in 3 months
- Consider noindex if no improvement

---

## 7. Monitoring & Reporting

### Weekly Metrics
- Top 20 pages by impressions
- Pages with position 8-20
- Queries with commercial intent
- CTR trends

### Monthly Metrics
- Coverage issues
- Quality score trends
- Content gaps
- Scaling opportunities

### Quarterly Review
- Content strategy alignment
- Thin content audit
- Scaling decisions
- Performance improvements

---

## 8. Tools & Resources

### Google Search Console
- Performance report
- Coverage report
- Enhancements report
- Links report

### Google Analytics 4
- Page views by page_type
- User engagement metrics
- Conversion tracking
- Custom events

### Internal Tools
- `lib/pageType.ts` - Page classification
- `lib/gtag.ts` - Event tracking
- Quality scoring system
- Indexing checks

---

## 9. Best Practices

1. **Always prioritize quality over quantity**
2. **Monitor GSC weekly, act monthly**
3. **Use data to drive content decisions**
4. **Avoid thin content at all costs**
5. **Focus on user intent, not just keywords**
6. **Regular audits and improvements**
7. **Test and measure everything**

---

## 10. Contact & Support

For questions about this framework:
- Review GSC data weekly
- Check GA4 events monthly
- Consult with SEO team for major decisions
- Document all changes and results

