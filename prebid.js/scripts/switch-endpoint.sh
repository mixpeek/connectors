#!/bin/bash
# Quick endpoint switching script

case "$1" in
  dev|development)
    export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
    echo "✅ Switched to development server"
    echo "   Endpoint: https://api.mixpeek.com"
    echo ""
    echo "Now run: npm run test:live"
    ;;
  prod|production)
    export MIXPEEK_API_ENDPOINT=https://api.mixpeek.com
    echo "✅ Switched to production server"
    echo "   Endpoint: https://api.mixpeek.com"
    echo ""
    echo "Now run: npm run test:live"
    ;;
  local)
    export MIXPEEK_API_ENDPOINT=http://localhost:8000
    echo "✅ Switched to local server"
    echo "   Endpoint: http://localhost:8000"
    echo ""
    echo "Now run: npm run test:live"
    ;;
  *)
    echo "Usage: source scripts/switch-endpoint.sh [dev|prod|local]"
    echo ""
    echo "Examples:"
    echo "  source scripts/switch-endpoint.sh dev   # Use development server"
    echo "  source scripts/switch-endpoint.sh prod  # Use production server"
    echo "  source scripts/switch-endpoint.sh local # Use local server"
    return 1
    ;;
esac

