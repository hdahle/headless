#!/bin/sh

# Input arguments:
# $1 - html source folder
# $2 - URL to scrape

SOURCE=$1
JSFILE="cb.js"
URL=$2
DEST=$(mktemp -d -t scrape-XXXXXXXX)

if [ "$SOURCE" = "" ] ; then
  echo "Usage: $0 source url"
  exit
fi

if [ ! -d "${SOURCE}" ] ; then
  echo "Source directory not found: " ${SOURCE} 
  exit
fi

if [ "$URL" = "" ] ; then
  URL="http://localhost:8080"
fi

if [ ! "${JSFILE}" ] ; then
  echo "Not found:" ${JSFILE}
fi

# Copy files from HTML folder to local folder
echo "Copyng files from ${SOURCE} to ${DEST}"
rmdir ${DEST}
cp -r ${SOURCE} ${DEST}

# Copy the CB.JS file containing callback code for PNG generation
cp ${JSFILE} ${DEST}/js

# Start the web-server
node server.js --folder ${DEST} --selfdestruct &

# Scrape the images
node imagescraper.js --url ${URL}
