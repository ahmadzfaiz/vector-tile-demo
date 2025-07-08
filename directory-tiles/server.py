import io
import os
from flask import Flask, send_file, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

TILE_DIR = os.path.join(os.getcwd(), 'tiles')

@app.route('/tiles/<string:country_code>/<int:z>/<int:x>/<int:y>.pbf')
@app.route('/tiles/<string:country_code>/<int:z>/<int:x>/<int:y>.mvt')
def serve_vector_tile(country_code: str, z: int, x: int, y: int):
    """
    Flask route to serve pre-generated vector tiles from a directory,
    including a country code subfolder.
    The URL formats are /tiles/{country_code}/{z}/{x}/{y}.pbf and .mvt.
    """
    # Determine the file extension from the request URL
    from flask import request
    requested_extension = request.path.split('.')[-1]
    
    # Try both extensions to find the actual file
    tile_path_requested = os.path.join(TILE_DIR, country_code, str(z), str(x), f'{y}.{requested_extension}')
    tile_path_pbf = os.path.join(TILE_DIR, country_code, str(z), str(x), f'{y}.pbf')
    tile_path_mvt = os.path.join(TILE_DIR, country_code, str(z), str(x), f'{y}.mvt')
    
    # Check which file exists
    if os.path.exists(tile_path_requested):
        tile_path = tile_path_requested
    elif os.path.exists(tile_path_pbf):
        tile_path = tile_path_pbf
    elif os.path.exists(tile_path_mvt):
        tile_path = tile_path_mvt
    else:
        tile_path = None

    print(f"Requesting tile: Country={country_code}, Z={z}, X={x}, Y={y}")
    
    # Check if any tile file exists
    if tile_path is None:
        # Log missing tiles less verbosely (only log the coordinate, not full path)
        print(f"Tile not found: {country_code}/{z}/{x}/{y}")
        abort(404)
    
    print(f"Found tile at: {tile_path}")

    try:
        # Check if the tile is gzipped by reading the first few bytes
        with open(tile_path, 'rb') as f:
            first_bytes = f.read(2)
            is_gzipped = first_bytes == b'\x1f\x8b'
        
        if is_gzipped:
            # If gzipped, set proper content encoding
            response = send_file(
                tile_path,
                mimetype='application/x-protobuf',
                as_attachment=False
            )
            response.headers['Content-Encoding'] = 'gzip'
            return response
        else:
            # If not gzipped, serve normally
            return send_file(
                tile_path,
                mimetype='application/x-protobuf',
                as_attachment=False
            )
    except Exception as e:
        print(f"Error serving tile {tile_path}: {e}")
        abort(500)

@app.route('/')
def index():
    return f"Vector Tile Server is running. Tiles are served from: {TILE_DIR}. Try accessing /tiles/0/0/0.pbf or /tiles/0/0/0.mvt"

if __name__ == '__main__':
    if not os.path.isdir(TILE_DIR):
        print(f"Warning: Tile directory '{TILE_DIR}' does not exist. Please create it and place your .pbf tiles inside.")
        print("Example structure: TILE_DIR/Z/X/Y.pbf")

    app.run(debug=True, port=8002)