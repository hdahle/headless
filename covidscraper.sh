#!/bin/sh
#
# Covidscraper.sh
# Scrapes all 197 images from images-index.html
# This sh-file should really be merged with imagescraper.sh
#
# Input arguments:
# $1 - html source folder
# $2 - URL to scrape
# $3 - Image folder
# $4 - File/path to node executable
#
# H.Dahle, 2020

# Root for HTML source
SRCFOLDER=$1
# Where to write the images
IMGFOLDER=$2
# The URL to scrape, including index.html
URL=$3
# Node executable including path
NODEBIN=$4

PORT=8083

if [ "$NODEBIN" = "" ] ; then
  echo "Usage: $0 <source folder> <output folder> <url> <nodebin>" 
  echo "  <source folder>  Source HTML  folder"
  echo "  <output folder>  Where to write the PNG files"
  echo "  <url>            URL to scrape"
  echo "  <nodebin>        Full path to node executable"
  echo "Example:"
  echo "  $0 ~/dashboard img http://localhost:8083/images-index.html /usr/bin/node "
  exit
fi

if [ ! -d "${SRCFOLDER}" ] ; then
  echo "Source directory not found: " ${SRCFOLDER} 
  exit
fi

if [ ! -d "${IMGFOLDER}" ] ; then
  echo "Output image folder does not exist: ${IMGFOLDER}"
  exit
fi

if [ "${URL}" = "" ] ; then
  echo "URL to scrape is missing"
  exit
fi

if [ ! -f "${NODEBIN}" ] ; then
  echo "Node.js executable not found at: ${NODEBIN}"
  exit
fi

# Run web-server in the background, exit after 30 sec
${NODEBIN} server.js --folder ${SRCFOLDER} --selfdestruct --port ${PORT} &

# Scrape the images
echo "Mustfix: use of PORT is inconsistent, ugly and just bad"
${NODEBIN} scraper.js --url ${URL} --folder ${IMGFOLDER}
