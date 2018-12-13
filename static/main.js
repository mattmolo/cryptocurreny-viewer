const UPDATE_INTERVAL = 3*1000 // 2 seconds

function round(val, decimal_points=5) {
    let factor = Math.pow(10, decimal_points)
    return Math.round(val * factor) / factor
}

let V = new Vue({
    el: '#app',
    data: {
        // API data
        data: undefined
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
            // and the decimal part together, which is rounded to 4 places
            let decimal_points = 4

            let integer_part_string = Number(integer_part).toLocaleString()

            let decimal_part_string = round(decimal_part, decimal_points).toFixed(decimal_points).substr(1)

            return integer_part_string + decimal_part_string
        }
    },
    methods: {
        getData: async function() {
            // Using jsonp cors proxy for kraken api
            let response = await axios.get('/portfolio')

            this.data = response.data

            // Recall the function to update data again
            setTimeout(this.getData, UPDATE_INTERVAL)
        },
        total: function(exchange) {
            let sum = 0.0

            for (coin of exchange) {
                sum += coin.value
            }

            return sum
        }
    },
    created: function() {
        this.getData()
    }
})
