create_tile:
	bash create_tiles.sh

run_martin:
	martin --config config.yaml

run_ol:
	cd app-ol; npm run dev

run_maplibre:
	python3 -m http.server 8000 --directory ./app-maplibre
