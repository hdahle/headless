#!/bin/sh

# Input arguments:
# $1 - html source folder
# $2 - URL to scrape
# $3 - Image folder

SOURCE=$1
JSFILE="cb.js"
IMGFOLDER=$2
URL=$3
DEST=$(mktemp -d -t scrape-XXXXXXXX)
PORT=8081

if [ "$SOURCE" = "" ] ; then
  echo "Usage: $0 <source folder> <output folder>  [url]"
  echo "Example:"
  echo "  $0 ~/dashboard img"
  echo "  $0 ~/dashboard img http://localhost:8080"
  exit
fi

if [ ! -d "${SOURCE}" ] ; then
  echo "Source directory not found: " ${SOURCE} 
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

# Copy files from HTML folder to local folder
echo "Copyng files from ${SOURCE} to ${DEST}"
rmdir ${DEST}
cp -r ${SOURCE} ${DEST}

# Copy the CB.JS file containing callback code for PNG generation
cp ${JSFILE} ${DEST}/js

# Run web-server in the background, exit after 30 sec
node server.js --folder ${DEST} --selfdestruct --port ${PORT} &

# Scrape the images
node scraper.js --url ${URL} --folder ${IMGFOLDER}
