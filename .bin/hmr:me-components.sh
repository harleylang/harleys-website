# if a component's styles are re-compiled
# then also re-build the component too
# deno --quiet run --allow-read .bin/filewhistle.ts \
#    www/css --pattern "me-(.*)(.scss)" | \
{ read effect; echo "${effect/.scss/".ts"}"; } | \
{ read effect; echo "${effect/css/"js"}"; } | \
xargs deno task bin:esbuild
