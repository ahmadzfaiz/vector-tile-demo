create_tiles:
	bash create_tiles.sh

create_multitiles:
	bash create_multitiles.sh

run_martin:
	cd martin-tiles; martin --config config.yaml

run_flask:
	cd directory-tiles; . venv/bin/activate; python server.py

run_ol:
	cd app-ol; npm run dev

run_maplibre:
	python3 -m http.server 8000 --directory ./app-maplibre
