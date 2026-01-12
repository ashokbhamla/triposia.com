# URL Conventions - All Lowercase

All URLs in the application use lowercase slugs and query parameters.

## URL Patterns

### Airports
- `/airports/[iata]` - e.g., `/airports/del`
- `/airports/[iata]/departures` - e.g., `/airports/del/departures`
- `/airports/[iata]/arrivals` - e.g., `/airports/del/arrivals`

### Flights
- `/flights/[route]` - e.g., `/flights/del-bom`
- `/flights/from-[iata]` - e.g., `/flights/from-del`
- `/flights/to-[iata]` - e.g., `/flights/to-bom`

### Airlines
- `/airlines/[code]` - e.g., `/airlines/6e`
- `/airlines/[code]/from-[iata]` - e.g., `/airlines/6e/from-del`
- `/airlines/[code]/[route]` - e.g., `/airlines/6e/del-bom`

### Admin
- `/admin/login`
- `/admin/dashboard`
- `/admin/airports`
- `/admin/flights`
- `/admin/airlines`

## Implementation

All URL generation uses `.toLowerCase()`:
- Route slugs: `formatRouteSlug()` function ensures lowercase
- IATA codes in URLs: Always converted to lowercase
- Airline codes: Always converted to lowercase
- Breadcrumb URLs: All use lowercase
- Canonical URLs: All use lowercase
- Sitemap URLs: All use lowercase

## Examples

✅ Correct:
- `/airports/del`
- `/flights/del-bom`
- `/airlines/6e/from-del`

❌ Incorrect:
- `/airports/DEL`
- `/flights/DEL-BOM`
- `/airlines/6E/from-DEL`

