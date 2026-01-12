#!/bin/bash

# Comprehensive URL Testing Script
# Tests all pages in the application

BASE_URL="http://localhost:3000"

echo "=========================================="
echo "COMPREHENSIVE URL TESTING"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_url() {
    local url=$1
    local description=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} $description: ${GREEN}$status${NC}"
    elif [ "$status" -eq 404 ]; then
        echo -e "${YELLOW}○${NC} $description: ${YELLOW}$status${NC} (Not Found - may be expected)"
    else
        echo -e "${RED}✗${NC} $description: ${RED}$status${NC}"
    fi
}

echo "=== CORE PAGES ==="
test_url "$BASE_URL/" "Home"
test_url "$BASE_URL/flights" "Flights Listing"
test_url "$BASE_URL/airports" "Airports Listing"
test_url "$BASE_URL/airlines" "Airlines Listing"
echo ""

echo "=== TRUST & AUTHORITY PAGES ==="
test_url "$BASE_URL/manifesto" "Manifesto"
test_url "$BASE_URL/how-we-help" "How We Help"
test_url "$BASE_URL/editorial-policy" "Editorial Policy"
test_url "$BASE_URL/corrections" "Corrections"
echo ""

echo "=== FLIGHT ROUTE PAGES ==="
test_url "$BASE_URL/flights/del-bom" "DEL to BOM"
test_url "$BASE_URL/flights/bom-del" "BOM to DEL"
test_url "$BASE_URL/flights/jfk-lax" "JFK to LAX"
test_url "$BASE_URL/flights/lhr-cdg" "LHR to CDG"
echo ""

echo "=== FLIGHTS FROM/TO ==="
test_url "$BASE_URL/flights/from-del" "Flights from DEL"
test_url "$BASE_URL/flights/from-bom" "Flights from BOM"
test_url "$BASE_URL/flights/to-del" "Flights to DEL"
test_url "$BASE_URL/flights/to-bom" "Flights to BOM"
echo ""

echo "=== AIRPORT PAGES ==="
test_url "$BASE_URL/airports/del" "DEL Airport"
test_url "$BASE_URL/airports/bom" "BOM Airport"
test_url "$BASE_URL/airports/jfk" "JFK Airport"
test_url "$BASE_URL/airports/lax" "LAX Airport"
test_url "$BASE_URL/airports/lhr" "LHR Airport"
echo ""

echo "=== AIRPORT DEPARTURES/ARRIVALS ==="
test_url "$BASE_URL/airports/del/departures" "DEL Departures"
test_url "$BASE_URL/airports/del/arrivals" "DEL Arrivals"
test_url "$BASE_URL/airports/bom/departures" "BOM Departures"
test_url "$BASE_URL/airports/bom/arrivals" "BOM Arrivals"
echo ""

echo "=== AIRLINE PAGES ==="
test_url "$BASE_URL/airlines/ai" "Air India (AI)"
test_url "$BASE_URL/airlines/6e" "IndiGo (6E)"
test_url "$BASE_URL/airlines/aa" "American Airlines (AA)"
test_url "$BASE_URL/airlines/dl" "Delta (DL)"
echo ""

echo "=== AIRLINE ROUTES ==="
test_url "$BASE_URL/airlines/ai/from-del" "AI from DEL"
test_url "$BASE_URL/airlines/ai/del-bom" "AI route DEL-BOM"
test_url "$BASE_URL/airlines/6e/from-bom" "6E from BOM"
echo ""

echo "=== INVALID ROUTES (Expected 404) ==="
test_url "$BASE_URL/airports/xxx" "Invalid Airport (XXX)"
test_url "$BASE_URL/flights/xxx-yyy" "Invalid Route (XXX-YYY)"
test_url "$BASE_URL/airlines/xxx" "Invalid Airline (XXX)"
echo ""

echo "=========================================="
echo "TESTING COMPLETE"
echo "=========================================="
echo ""
echo "Legend:"
echo "  ${GREEN}✓${NC} = Success (200)"
echo "  ${YELLOW}○${NC} = Not Found (404 - may be expected)"
echo "  ${RED}✗${NC} = Error (other status codes)"
echo ""
echo "Next Steps:"
echo "1. Check browser console for JavaScript errors"
echo "2. Verify images load correctly (airline logos, airport images)"
echo "3. Test responsive design on mobile/tablet"
echo "4. Verify all internal links work"
echo "5. Check SEO metadata (view page source)"

