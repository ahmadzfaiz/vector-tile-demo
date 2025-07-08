import io
import os
from flask import Flask, send_file, abort

app = Flask(__name__)

TILE_DIR = os.path.join(os.getcwd(), 'tiles')

@app.route('/tiles/<int:z>/<int:x>/<int:y>.pbf')
@app.route('/tiles/<int:z>/<int:x>/<int:y>.mvt')
def serve_vector_tile(z: int, x: int, y: int):
    """
    Flask route to serve pre-generated vector tiles from a directory.
    The URL formats are /tiles/{z}/{x}/{y}.pbf and /tiles/{z}/{x}/{y}.mvt,
    both standard for slippy maps.
    """
    tile_path = os.path.join(TILE_DIR, str(z), str(x), f'{y}.pbf')

    print(f"Requesting tile: Z={z}, X={x}, Y={y}")
    print(f"Looking for tile at: {tile_path}")

    # Check if the tile file exists
    if not os.path.exists(tile_path):
        print(f"Tile not found: {tile_path}")
        abort(404)

    try:
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