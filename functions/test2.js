const axios = require('axios').default;

function sendNotif() {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer facbcace-4eb0-4812-96f8-c5f7e4c95fdd'
        }
    };
    axios
        .post('https://api.webengage.com/v2/accounts/aa131ccd/experiments/~1ni6qh2/transaction', {
                "ttl": 60,
                "overrideData": {
                    "context": {
                        "token": {
                            "title": "sup",
                            "body": "sup"
                        }
                    }
                },
                "userId": "261"
            },
            config
        )
        .then(function(response) {
            console.log(response);
        })
        .catch(function(error) {
            console.log(error);
        });
}

sendNotif();