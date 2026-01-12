# Anti-Scraping Protection Guide

This document outlines the anti-scraping measures implemented on the site and additional recommendations.

## Implemented Protections

### 1. **Middleware Protection** (`middleware.ts`)
- **User-Agent Blocking**: Automatically blocks known scraper user agents (Scrapy, curl, wget, Puppeteer, Selenium, etc.)
- **Rate Limiting**: Limits requests to 100 per minute per IP address
- **Allowed Bots**: Whitelist for legitimate search engine bots (Google, Bing, etc.)
- **Security Headers**: Adds additional security headers to all responses

### 2. **Robots.txt Restrictions**
- Added `crawlDelay: 1` to discourage aggressive crawling
- Explicitly blocks known scraper user agents
- Disallows admin and API routes
- Allows legitimate search engine bots

### 3. **Security Headers** (next.config.js)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy` restrictions

## Additional Recommendations

### 1. **Cloudflare Protection** (Recommended)
If using Cloudflare:
1. Enable **Bot Fight Mode** (Free tier)
2. Enable **Rate Limiting** rules
3. Enable **WAF (Web Application Firewall)** - Paid tier
4. Configure **Firewall Rules** to block suspicious IPs
5. Enable **Challenge Pages** for suspicious traffic

**Cloudflare Bot Management Rules:**
```
(http.user_agent contains "Scrapy" or
 http.user_agent contains "curl" or
 http.user_agent contains "wget" or
 http.user_agent contains "Puppeteer" or
 http.user_agent contains "HeadlessChrome" or
 http.user_agent contains "Selenium") and
 not (http.user_agent contains "Googlebot" or
      http.user_agent contains "Bingbot")
```
Action: Block

### 2. **Vercel Rate Limiting**
If deploying on Vercel:
1. Use **Vercel Edge Middleware** for advanced rate limiting
2. Configure **Edge Config** for IP blacklisting
3. Use **Vercel Analytics** to monitor traffic patterns

### 3. **IP-Based Blocking**
For persistent scrapers:
1. Create an IP blacklist in Redis or database
2. Update middleware to check blacklist
3. Automatically add IPs that exceed rate limits

### 4. **Honeypot Traps**
Create hidden links/pages that only scrapers would follow:
1. Create `/api/test/honeypot` route that returns 404 but logs requests
2. Add invisible links in HTML that humans don't see
3. Block any IP that accesses honeypot URLs

### 5. **CAPTCHA Challenges**
For suspicious traffic:
1. Implement Cloudflare Turnstile (free)
2. Add CAPTCHA for high-volume IPs
3. Use reCAPTCHA v3 for background verification

### 6. **Legal Protection**
1. Add Terms of Service prohibiting scraping
2. Add Copyright notices
3. Consider adding `X-Robots-Tag` headers for specific content
4. Monitor and send DMCA notices if content is scraped

### 7. **Monitoring & Alerting**
1. Monitor access logs for scraping patterns
2. Set up alerts for:
   - High request rates from single IP
   - Requests from known scraper user agents
   - Unusual traffic patterns
3. Use analytics to track bot traffic

### 8. **Content Protection**
1. **Watermarking**: Add invisible watermarks to content
2. **Content Delivery**: Serve content via JavaScript (harder to scrape)
3. **Tokenization**: Require tokens for API access
4. **Obfuscation**: Obfuscate HTML structure periodically

## Testing Your Protection

### Test User-Agent Blocking:
```bash
# This should be blocked (403)
curl -A "Scrapy/1.0" https://your-site.com/

# This should work (200)
curl -A "Mozilla/5.0" https://your-site.com/

# This should work (200) - legitimate bot
curl -A "Googlebot/2.1" https://your-site.com/
```

### Test Rate Limiting:
```bash
# Run 150 requests quickly - should get 429 after 100
for i in {1..150}; do curl https://your-site.com/; done
```

## Configuration

### Adjust Rate Limits
Edit `middleware.ts`:
```typescript
const RATE_LIMIT = 100; // Requests per window
const RATE_WINDOW = 60 * 1000; // Window in milliseconds
```

### Add More Blocked User Agents
Edit `middleware.ts` - add to `SCRAPER_USER_AGENTS` array

### Allow Additional Bots
Edit `middleware.ts` - add to `ALLOWED_BOTS` array

## Limitations

### Current Implementation:
- ✅ Blocks known scraper user agents
- ✅ Rate limits by IP
- ✅ Allows legitimate search engine bots
- ⚠️ In-memory rate limiting (resets on server restart)
- ⚠️ No persistent IP blacklist
- ⚠️ Can be bypassed with rotating IPs/proxies

### For Production:
1. **Use Redis** for distributed rate limiting
2. **Use Cloudflare** for advanced bot protection
3. **Monitor and update** blocked user agents regularly
4. **Implement IP blacklisting** for persistent offenders
5. **Consider** Cloudflare Bot Management (paid)

## Support

For issues or questions about anti-scraping measures, check:
- Middleware logs for blocked requests
- Rate limit headers in responses
- Cloudflare analytics (if using)
- Server access logs

