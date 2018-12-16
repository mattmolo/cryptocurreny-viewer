import time
from flask import Flask, jsonify

from config import config


app = Flask(__name__, static_url_path="")


portfolios = {}
for exchange in config['exchanges']:
    portfolios[exchange['name']] = exchange['client'](**exchange['init'])


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/portfolio')
def portfolio():
    return jsonify({
        name: client.portfolio()
        for name, client in portfolios.items()
    })

if __name__ == '__main__':
    app.run(debug=False, use_reloader=True, host="0.0.0.0", port=5000)
