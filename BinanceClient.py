import time

from binance.client import Client

class Binance(object):

    def __init__(self, api_key, secret_key):
        self.client = Client(api_key, secret_key)

        self._portfolio_cache = {}
        self._last_retrieved = 0.0
        self._update_limit = 10 #seconds

    def portfolio(self):
        if time.time() - self._last_retrieved > self._update_limit:
            self._last_retrieved = time.time()
            self._portfolio_cache = self._portfolio()

        return self._portfolio_cache

    def _portfolio(self):
        btc_usdt_ticker = self.client.get_ticker(symbol="BTCUSDT")
        btc_usdt = float(btc_usdt_ticker['askPrice'])

        assets = self.client.get_account()['balances']

        coins = []
        for asset in assets:
            # ignore coins with hold no value
            if float(asset['free']) == 0.0:
                continue

            coin = {
                "symbol": asset['asset'],
                "amount": float(asset['free']),
                "trading": 0.0,
                "value": 0.0
            }

            if coin['symbol'] == 'BTC':
                coin['trading'] = btc_usdt
            else:
                ticker = self.client.get_ticker(symbol=coin['symbol']+"BTC")
                coin['trading'] = btc_usdt * float(ticker['askPrice'])

            coin['value'] = coin['trading'] * coin['amount']
            coins.append(coin)
        return coins


