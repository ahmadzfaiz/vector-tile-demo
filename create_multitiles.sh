# Layer adm0 (Country)
tippecanoe \
  --output="tiles/ID_adm0.mbtiles" \
  --no-tile-compression \
  --layer=adm0 --minimum-zoom=1 --maximum-zoom=3 data/gadm41_IDN_0.geojson \
  --drop-rate=0 \
  --no-feature-limit \
  --no-tile-size-limit \
  --read-parallel

# Layer adm1 (Province)
tippecanoe \
  --output="tiles/ID_adm1.mbtiles" \
  --no-tile-compression \
  --layer=adm1 --minimum-zoom=4 --maximum-zoom=6 data/gadm41_IDN_1.geojson \
  --drop-rate=0 \
  --no-feature-limit \
  --no-tile-size-limit \
  --read-parallel

# Layer adm2 (Kabupaten/Kota)
tippecanoe \
  --output="tiles/ID_adm2.mbtiles" \
  --no-tile-compression \
  --layer=adm2 --minimum-zoom=7 --maximum-zoom=9 data/gadm41_IDN_2.geojson \
  --drop-rate=0 \
  --no-feature-limit \
  --no-tile-size-limit \
  --read-parallel

# Layer adm3 (Kecamatan)
tippecanoe \
  --output="tiles/ID_adm3.mbtiles" \
  --no-tile-compression \
  --layer=adm3 --minimum-zoom=10 --maximum-zoom=12 data/gadm41_IDN_3.geojson \
  --drop-rate=0 \
  --no-feature-limit \
  --no-tile-size-limit \
  --read-parallel

# Layer adm4 (Desa)
tippecanoe \
  --output="tiles/ID_adm4.mbtiles" \
  --no-tile-compression \
  --layer=adm4 --minimum-zoom=13 --maximum-zoom=15 data/gadm41_IDN_4.geojson \
  --drop-rate=0 \
  --no-feature-limit \
  --no-tile-size-limit \
  --read-parallel

tile-join \
  --output=tiles/ID.mbtiles \
  tiles/ID_adm0.mbtiles \
  tiles/ID_adm1.mbtiles \
  tiles/ID_adm2.mbtiles \
  tiles/ID_adm3.mbtiles \
  tiles/ID_adm4.mbtiles \

# Remove individual MBTiles files after merging
rm tiles/ID_adm*.mbtiles