#! /bin/bash

node build.js modules=animation,interaction,gestures,image_filters,text,itext,textbox,shadow,gradient,alignment,centeringGuidelines,parser,tabs,table,menu,pattern

cp ./dist/fabric.js /postermywall/svn/trunk/server/assets/javascript/vendor/fabric.js

echo 'Copied file to PosterMyWall web.'
