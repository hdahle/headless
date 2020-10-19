#!/bin/sh
#
# imagescraper.sh
# Scrapes images from images-index.html
#
# Input arguments:
# $1 - html source folder
# $2 - URL to scrape
# $3 - Image folder
# $4 - File/path to node executable
#
# H.Dahle, 2020

SRCFOLDER=$1
JSFILE="cb.js"
IMGFOLDER=$2
URL=$3
NODEBIN=$4
DEST=$(mktemp -d -t scrape-XXXXXXXX)
PORT=8081

if [ "$NODEBIN" = "" ] ; then
  echo "Usage: $0 <source folder> <output folder> <url> <nodebin>"
  echo "  <source folder>  Source HTML  folder"
  echo "  <output folder>  Where to write the PNG files"
  echo "  <url>            URL to scrape"
  echo "  <nodebin>        Full path to node executable"
  echo "Example:"
  echo "  $0 ~/dashboard img"
  echo "  $0 ~/dashboard img http://localhost"
  exit
fi

if [ ! -d "${SRCFOLDER}" ] ; then
  echo "Source directory not found: " ${SRCFOLDER} 
  exit
fi

if [ "${URL}" = "" ] ; then
  URL="http://localhost:${PORT}"
fi

if [ ! "${JSFILE}" ] ; then
  echo "Not found:" ${JSFILE}
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

# Copy files from HTML folder to local folder
echo "Copyng files from ${SRCFOLDER} to ${DEST}"
rmdir ${DEST}
cp -r ${SRCFOLDER} ${DEST}

# Copy the CB.JS file containing callback code for PNG generation
cp ${JSFILE} ${DEST}/js

# Run web-server in the background, exit after 30 sec
${NODEBIN} server.js --folder ${DEST} --selfdestruct --port ${PORT} &

# Scrape the images
echo "Mustfix: use of PORT is inconsistent, ugly and just bad"
${NODEBIN} scraper.js --url ${URL}:${PORT} --folder ${IMGFOLDER}
