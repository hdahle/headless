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
#
#
# H.Dahle, 2020

# Root for HTML source
SRCFOLDER=$1
# Where to write the images
IMGFOLDER=$2
# The URL to scrape, including index.html
URL=$3

PORT=8083

if [ "$SRCFOLDER" = "" ] ; then
  echo "Usage: $0 <source folder> <output folder> <url>"
  echo "  <source folder>  Source HTML  folder"
  echo "  <output folder>  Where to write the PNG files"
  echo "  <url>            URL to scrape"
  echo "Example:"
  echo "  $0 ~/dashboard img http://localhost:8083/images-index.html "
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

if [ ! -f "${URL}"] ; then
  echo "File does not exist: ${URL}"
  exit
fi

# Run web-server in the background, exit after 30 sec
node server.js --folder ${SRCFOLDER} --selfdestruct --port ${PORT} &

# Scrape the images
node scraper.js --url ${URL} --folder ${IMGFOLDER}
