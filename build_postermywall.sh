#! /bin/bash

node build.js modules=animation,interaction,gestures,image_filters,text,itext,textbox,shadow,gradient,pattern,freedrawing,alignment

cp ./dist/fabric.js /usr/postermywall/svn/trunk/server/assets/javascript/vendor/fabric.js

echo 'Copied file to PosterMyWall web.'
