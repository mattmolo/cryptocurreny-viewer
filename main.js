function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

function round(val, decimal_points=5) {
    let factor = Math.pow(10, decimal_points)
    return Math.round(val * factor) / factor
}

const LS_COIN = 'coin'
const LS_AMOUNT = 'amount'
const LOADING = 'Loading...'
const UPDATE_INTERVAL = 2*1000 // 2 seconds

let V = new Vue({
    el: '#app',
    data: {
        // Coin's Ticke Value
        coin: undefined,

        // Amount of coins
        amount: undefined,

        // API data
        data: undefined,

        // If data is from local storage
        local_storage: false,

        // Keep track of any errors
        init_error: undefined,
        data_error: undefined,
    },
    computed: {
        conversion_rate: function() {
            if (!this.data) return LOADING
            return round(this.data.a[0])
        },
        total_usd: function() {
            if (!this.data) return LOADING
            return round(this.amount * this.conversion_rate)
        },
        link: function() {
            // Compute a direct link when using local storage
            let loc = document.location
            return `${loc.origin}${loc.pathname}?coin=${this.coin}&amount=${this.amount}`
        },
        error: function() {
            // Returns init and data error with
            // priority to the init error
            if (this.init_error) {
                return this.init_error
            } else if (this.data_error) {
                return this.data_error
            } else {
                return false
            }
        }
    },
    filters: {
        number: function(val) {
            // Only modify actual numbers or numbers greater than 0
            // (Algorithm only works on positive numbers)
            if (isNaN(Number(val)) || val < 0) return val

            // Everything left of the decimal
            let integer_part = Math.floor(val)

            // Everything right of the decimal
            let decimal_part = val - integer_part

            // Combine the locale integer part of the number (With their thousand's seperator)
            // and the decimal part together, which is rounded to 5 points < 100 and 2 >= 100

            let decimal_points = integer_part >= 100 ? 2 : 5

            let integer_part_string = Number(integer_part).toLocaleString()

            let decimal_part_string = round(decimal_part, decimal_points).toFixed(decimal_points).substr(1)

            return integer_part_string + decimal_part_string
        }
    },
    methods: {
        saveData: function() {
            // Save data when data is not already displayed from local strorage
            if (!this.local_storage) {
                localStorage.setItem(LS_COIN, this.coin)
                localStorage.setItem(LS_AMOUNT, this.amount)
            }
        },
        getData: async function() {
            // Using jsonp cors proxy for kraken api
            let response = await axios.get('https://jsonproxy.herokuapp.com', {
                params: {
                    url: `https://api.kraken.com/0/public/Ticker?pair=${this.coin}USD`
                }
            })

            let {result, error} = response.data

            if (error.length) {
                // Error: data becomes undefined
                // data_error is set to the API's error
                this.data = undefined
                this.data_error = error[0]
            } else {
                // Sucess: data becomes the first result
                // data_error is set to undefined
                this.data = Object.values(result)[0]
                this.data_error = undefined
            }

            // Recall the function to update data again
            setTimeout(this.getData, UPDATE_INTERVAL)
        },
        round: round
    },
    created: function() {
        this.coin = getUrlParameter("coin")
        this.amount = getUrlParameter("amount")

        // If both coin and amount are missing, then
        // get them from local storage instead
        if (!this.coin && !this.amount) {
            this.coin = localStorage.getItem(LS_COIN)
            this.amount = localStorage.getItem(LS_AMOUNT)
            this.local_storage = true
        }

        // Coin or amount isn't set, which means local storage failed
        // or one parameter is set and the other isn't.
        if (!this.coin) {
            this.init_error = "Coin parameter must be set!"
        } else if (Number(this.amount) <= 0) {
            this.init_error = "Amount should be a positive value greater than 0!"
        } else if (!this.amount) {
            this.amount = 1
        }

        if (!this.init_error) {
            // Update the title
            document.title = `${this.coin} Status`

            // Load in the data
            this.getData()
        }
    }
})
