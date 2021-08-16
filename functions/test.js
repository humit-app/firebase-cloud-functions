const axios = require('axios').default;

let title = "one more";
let body = "does this work";
let campaignURL = 'https://api.webengage.com/v2/accounts/aa131ccd/experiments/~1ni6qh2/transaction';
sendNotif(campaignURL, 1, title, body);

//Sample userIDs : Rohit: 1, Prithvi: 2, Jaideep: 261, Ishaan: 42, Mom: 1016, 

function sendNotif(postURL, toUserID, notifTitle, notifBody) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer facbcace-4eb0-4812-96f8-c5f7e4c95fdd'
        }
    };
    axios
        .post(campaignURL, {
                "ttl": 60,
                "overrideData": {
                    "context": {
                        "token": {
                            "title": notifTitle,
                            "body": notifBody
                        }
                    }
                },
                "userId": 62983
            },
            config
        )
        .then(function(response) {
            console.log(response);
        })
        .catch(function(error) {
            console.log('Response status: ', error.response.status, "Response config data: ", error.response.config.data);
        });
}