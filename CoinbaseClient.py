import time

from coinbase.wallet.client import Client

class Coinbase(object):

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
        accounts = self.client.get_accounts()

        coins = []
        for account in accounts.data:
            # ignore coins with hold no value
            if float(account['balance']['amount']) == 0.0:
                continue

            coin = {
                "symbol": account['currency'],
                "amount": float(account['balance']['amount']),
                "trading": 0.0,
                "value": float(account['native_balance']['amount'])
            }

            # estimate the trading value, since coinbase API only seems to
            # return the BTC trading price atm
            coin['trading'] = coin['value'] / coin['amount']
            coins.append(coin)

        return coins
