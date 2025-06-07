# Running areal Palenka

A very simple web page which contains the info about running areal Palenka tracks.
Live at [https://xbenes.github.io/bezecky-areal-palenka/](https://xbenes.github.io/bezecky-areal-palenka/).

## Additional info

The web page allows visitors to view individual tracks in the areal and also download them. The areal is located near [Cerveny Kostelec](https://en.mapy.cz/s/3sYJe).

## Technology

The webpage is written using plain old javascript. No js transpile, no css preprocessing. The page should run "as is".

The web page uses [Leaflet.js](https://leafletjs.com/) library to show gpx tracks ([leaflet-gpx](https://github.com/mpetazzoni/leaflet-gpx) plugin) on a map generated from [OpenStreetMap](https://www.openstreetmap.org/) data.

## Base tile layer images

Generated mbtiles file from OpenStreetMap pbf with systemed/tilemaker. Then rendered mbtiles with maptiler/tileserver-gl and downloaded the output png for the particular limited region and zoom range.
