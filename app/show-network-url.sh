#!/bin/bash

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Default port
PORT=5175

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 MEMORY App - Multi Device Access${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📱 Access URLs:${NC}"
echo ""
echo -e "${YELLOW}Laptop/Desktop (Localhost):${NC}"
echo -e "  ${GREEN}http://localhost:${PORT}/${NC}"
echo ""
echo -e "${YELLOW}Mobile Phone (Network):${NC}"
echo -e "  ${GREEN}http://${LOCAL_IP}:${PORT}/${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📝 Instructions:${NC}"
echo "  1. Make sure HP & Laptop are on SAME WiFi/LAN"
echo "  2. Copy the Network URL above"
echo "  3. Open in Chrome Mobile"
echo "  4. Test upload & reload!"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Press 'h' + Enter in terminal for Vite help"
echo "  • Press 'r' + Enter to restart server"
echo "  • Press 'q' + Enter to quit"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
