#! /bin/bash

node build.js modules=animation,interaction,gestures,image_filters,text,itext,textbox,shadow,gradient,alignment,parser,tabs,table,menu

cp ./dist/fabric.js /postermywall/svn/trunk/server/assets/javascript/vendor/fabric.js

echo 'Copied file to PosterMyWall web.'