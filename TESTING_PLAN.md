# Comprehensive URL Testing Plan

## URL Structure Overview

### Core Pages
1. `/` - Home page
2. `/flights` - All flights listing
3. `/airports` - All airports listing
4. `/airlines` - All airlines listing (if exists)

### Flight Route Pages
5. `/flights/[route]` - Individual flight route (e.g., `/flights/del-bom`)
6. `/flights/from-[iata]` - Flights from airport (e.g., `/flights/from-del`)
7. `/flights/to-[iata]` - Flights to airport (e.g., `/flights/to-bom`)

### Airport Pages
8. `/airports/[iata]` - Airport detail page (e.g., `/airports/del`)
9. `/airports/[iata]/departures` - Airport departures (e.g., `/airports/del/departures`)
10. `/airports/[iata]/arrivals` - Airport arrivals (e.g., `/airports/del/arrivals`)

### Airline Pages
11. `/airlines/[code]` - Airline detail page (e.g., `/airlines/ai`)
12. `/airlines/[code]/from-[iata]` - Airline flights from airport (e.g., `/airlines/ai/from-del`)
13. `/airlines/[code]/[route]` - Airline specific route (e.g., `/airlines/ai/del-bom`)

### Trust & Authority Pages
14. `/manifesto` - Trust Manifesto
15. `/how-we-help` - How We Help Travelers
16. `/editorial-policy` - Editorial Policy
17. `/corrections` - Corrections & Feedback

### Admin Pages (Optional for testing)
18. `/admin/login` - Admin login
19. `/admin/dashboard` - Admin dashboard
20. `/admin/airports` - Admin airports management
21. `/admin/flights` - Admin flights management
22. `/admin/airlines` - Admin airlines management

---

## Test URLs (Sample Data)

### Test Flight Routes
- `/flights/del-bom` (Delhi to Mumbai)
- `/flights/bom-del` (Mumbai to Delhi)
- `/flights/jfk-lax` (New York to Los Angeles)
- `/flights/lhr-cdg` (London to Paris)

### Test Airports
- `/airports/del` (Delhi)
- `/airports/bom` (Mumbai)
- `/airports/jfk` (New York JFK)
- `/airports/lax` (Los Angeles)
- `/airports/lhr` (London Heathrow)
- `/airports/del/departures`
- `/airports/del/arrivals`
- `/airports/bom/departures`
- `/airports/bom/arrivals`

### Test Airlines
- `/airlines/ai` (Air India)
- `/airlines/6e` (IndiGo)
- `/airlines/aa` (American Airlines)
- `/airlines/dl` (Delta)
- `/airlines/ai/from-del`
- `/airlines/ai/del-bom`
- `/airlines/6e/from-bom`

### Test Flights From/To
- `/flights/from-del`
- `/flights/from-bom`
- `/flights/to-del`
- `/flights/to-bom`

---

## Testing Checklist

### ✅ Visual Design Checks

#### Flight Route Pages (`/flights/[route]`)
- [ ] Route header with origin and destination cards
- [ ] Airport images displayed correctly
- [ ] Flight time and distance displayed prominently
- [ ] Flight schedule table shows airline logos
- [ ] Airlines section lists operating airlines
- [ ] POI section displays correctly (if available)
- [ ] Map displays destination airport location
- [ ] Internal links section present

#### Airport Pages (`/airports/[iata]`)
- [ ] Airport image/logo displayed in header
- [ ] Airport stats grid (destinations, departures, arrivals, route split)
- [ ] Tabs working (Departures/Arrivals)
- [ ] Flight table shows airline logos
- [ ] POI section displays correctly
- [ ] Map displays airport location
- [ ] Internal links section (routes, airlines)

#### Airline Pages (`/airlines/[code]`)
- [ ] Airline logo displayed in header
- [ ] Route listing shows correctly
- [ ] Internal links section (hub airports, popular routes)

#### Trust Pages
- [ ] Clean, professional layout
- [ ] Organization JSON-LD present
- [ ] No marketing fluff
- [ ] Footer links working

---

## Testing Script

### Phase 1: Core Pages (HTTP Status Check)
```bash
# Home & Listing Pages
curl -s -o /dev/null -w "Home: %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "Flights: %{http_code}\n" http://localhost:3000/flights
curl -s -o /dev/null -w "Airports: %{http_code}\n" http://localhost:3000/airports
curl -s -o /dev/null -w "Airlines: %{http_code}\n" http://localhost:3000/airlines

# Trust Pages
curl -s -o /dev/null -w "Manifesto: %{http_code}\n" http://localhost:3000/manifesto
curl -s -o /dev/null -w "How We Help: %{http_code}\n" http://localhost:3000/how-we-help
curl -s -o /dev/null -w "Editorial Policy: %{http_code}\n" http://localhost:3000/editorial-policy
curl -s -o /dev/null -w "Corrections: %{http_code}\n" http://localhost:3000/corrections
```

### Phase 2: Flight Routes
```bash
# Sample routes
curl -s -o /dev/null -w "DEL-BOM: %{http_code}\n" http://localhost:3000/flights/del-bom
curl -s -o /dev/null -w "BOM-DEL: %{http_code}\n" http://localhost:3000/flights/bom-del
curl -s -o /dev/null -w "JFK-LAX: %{http_code}\n" http://localhost:3000/flights/jfk-lax

# From/To
curl -s -o /dev/null -w "From DEL: %{http_code}\n" http://localhost:3000/flights/from-del
curl -s -o /dev/null -w "To BOM: %{http_code}\n" http://localhost:3000/flights/to-bom
```

### Phase 3: Airports
```bash
# Airport detail pages
curl -s -o /dev/null -w "DEL Airport: %{http_code}\n" http://localhost:3000/airports/del
curl -s -o /dev/null -w "BOM Airport: %{http_code}\n" http://localhost:3000/airports/bom
curl -s -o /dev/null -w "JFK Airport: %{http_code}\n" http://localhost:3000/airports/jfk

# Departures/Arrivals
curl -s -o /dev/null -w "DEL Departures: %{http_code}\n" http://localhost:3000/airports/del/departures
curl -s -o /dev/null -w "DEL Arrivals: %{http_code}\n" http://localhost:3000/airports/del/arrivals
```

### Phase 4: Airlines
```bash
# Airline pages
curl -s -o /dev/null -w "AI Airline: %{http_code}\n" http://localhost:3000/airlines/ai
curl -s -o /dev/null -w "6E Airline: %{http_code}\n" http://localhost:3000/airlines/6e

# Airline routes
curl -s -o /dev/null -w "AI from DEL: %{http_code}\n" http://localhost:3000/airlines/ai/from-del
curl -s -o /dev/null -w "AI route DEL-BOM: %{http_code}\n" http://localhost:3000/airlines/ai/del-bom
```

---

## Design Verification Checklist

### Flight Route Page Design Elements
1. ✅ Route header matches flightsfrom.com style
2. ✅ Airport cards with images side-by-side
3. ✅ Flight time and distance prominently displayed
4. ✅ Flight schedule table with airline logos
5. ✅ Airlines section with links
6. ✅ POI section (if available)
7. ✅ Map below POIs
8. ✅ Internal links section

### Airport Page Design Elements
1. ✅ Airport logo/image in header
2. ✅ Stats grid (4 cards)
3. ✅ Tabs for Departures/Arrivals
4. ✅ Flight tables with airline logos
5. ✅ POI section
6. ✅ Map
7. ✅ Internal links

### Airline Page Design Elements
1. ✅ Airline logo in header
2. ✅ Route listing
3. ✅ Internal links (hub airports, routes)

---

## Visual Checks to Perform

### For Each Page Type:

#### Flight Route Pages
- [ ] Title: "Direct (non-stop) flights from [City] to [City]"
- [ ] Summary paragraph with route details
- [ ] Airport cards show airport images
- [ ] Flight time and distance in separate cards
- [ ] Flight table has airline logos (32x32 avatars)
- [ ] Table rows hover effect
- [ ] Airlines section lists airlines with links
- [ ] Map height is 300px (compact)
- [ ] POI cards show images correctly

#### Airport Pages
- [ ] Airport image (64x64 avatar) in header
- [ ] Stats grid has 4 cards (or fewer if data missing)
- [ ] Tabs switch between Departures and Arrivals
- [ ] Flight tables show airline logos
- [ ] Map displays below POIs

#### Airline Pages
- [ ] Airline logo (64x64 avatar) in header
- [ ] Routes list shows correctly
- [ ] Internal links section present

---

## Expected HTTP Status Codes

- ✅ **200** - Page loads successfully
- ✅ **404** - Expected for invalid routes/airports/airlines
- ❌ **500** - Server error (needs investigation)

---

## Image URLs Verification

### Airline Logos
Check that images load:
- `https://ik.imagekit.io/clearmystay/askfares/airlines/AI.webp`
- `https://ik.imagekit.io/clearmystay/askfares/airlines/6E.webp`
- `https://ik.imagekit.io/clearmystay/askfares/airlines/AA.webp`

### Airport Images
Check that images load:
- `https://ik.imagekit.io/clearmystay/askfares/airports/DEL.webp`
- `https://ik.imagekit.io/clearmystay/askfares/airports/BOM.webp`
- `https://ik.imagekit.io/clearmystay/askfares/airports/JFK.webp`

---

## Browser Testing Checklist

1. Open each URL in browser
2. Verify images load correctly
3. Check responsive design (mobile/tablet/desktop)
4. Verify all links work
5. Check console for errors
6. Verify SEO metadata (view source)
7. Check JSON-LD schema

---

## Common Issues to Watch For

1. **Missing Images**: If airline/airport images don't load, check ImageKit URLs
2. **Broken Links**: Verify internal links point to correct URLs (lowercase)
3. **Layout Issues**: Check Material UI theme colors are applied
4. **Missing Data**: Pages should gracefully handle missing data
5. **Map Loading**: Verify OpenStreetMap embeds work

