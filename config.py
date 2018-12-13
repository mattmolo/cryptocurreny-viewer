import os

from CoinbaseClient import Coinbase
from BinanceClient import Binance

def build_exchanges():
    exchanges = [
        ("Binance", Binance),
        ("Coinbase", Coinbase)
    ]

    exchange_config = []
    for name, client in exchanges:
        api_key = os.environ.get("%s_API_KEY" % name.upper(), "")
        secret_key = os.environ.get("%s_SECRET_KEY" % name.upper(), "")

        if api_key and secret_key:
            exchange_config.append({
                "name": name,
                "client": client,
                "init": {
                    "api_key": api_key,
                    "secret_key": secret_key
                }
            })

    return exchange_config

config = {
    "exchanges": build_exchanges()
}

