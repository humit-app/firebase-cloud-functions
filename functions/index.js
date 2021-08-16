'use strict'

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
var db = admin.database();

// Listens for new messages added to /conversations/:conversation_id/messages/:message_id
exports.messagingNotifications = functions.database
    .ref('/conversations/{conversationId}/messages/{messageId}')
    .onCreate(async(snap, context) => {
        // Grab the original value of what was written to db
        const message = snap.val();

        let receiverUID, senderUID, blocked;
        try {
            // Get userIDs
            receiverUID = message.receiver_id;
            senderUID = message.sender_id;

            // Check if blocked
            blocked = message.blocked;
            if (blocked) {
                return null
            }

        } catch (error) {
            //console.log(error);
            console.log('Message sent from senderUID: ', senderUID, ' to receiverUID: ', receiverUID);
            return Promise.reject(new Error('Malformed message object. Either sender_id, receiver_id, or blocked key not found'));
        }

        // Check if muted
        const muted = await db.ref(`/equations/u_${receiverUID}/u_${senderUID}/muted`).once('value');
        if (muted.val()) {
            return null
        }

        let title, body;
        try {
            if (message.contains_hum === false) {
                title = `@${sender.user_handle} sent you a message`
                body = message.message
            } else if (message.sent_hum !== true) {
                title = `@${sender.user_handle} replied to your hum`
                body = message.message
            } else {
                title = `@${sender.user_handle} sent you a hum`
                body = `${message.hum_data.song_title} by ${message.hum_data.artists}`
            }
        } catch (error) {
            title = `@${sender.user_handle} sent you a message`
            body = `tap to see`
        }

        //Using Webenagge to send notification 
        let campaignID = "~1ni6qh2"
        let campaignURL = `https://api.webengage.com/v2/accounts/aa131ccd/experiments/${campaignID}/transaction`;

        //Calling the function
        sendNotif(campaignURL, receiverUID, title, body);

        //Sample userIDs : Rohit: 1, Prithvi: 2, Jaideep: 261, Ishaan: 42

        function sendNotif(postURL, toUserID, notifTitle, notifBody) {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${functions.config().webenage_authentication.key}`
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
                        "userId": toUserID
                    },
                    config
                )

            .then(function(error) {
                if (error.response.status !== 200) {
                    console.log('Response status: ', error.response.status, "; Response config data: ", error.response.config.data);
                    // fallback option: skipping WebEngage, using backend to notify
                    // Get device token for receiverUID and sender user details 
                    const getDeviceTokensPromise = db.ref(` / users / $ { receiverUID }
                        /notification_id`).once('value');
                    const getSenderPromise = db.ref(`/users/${senderUID}`).once('value');

                    let tokenSnapshot, senderSnapshot;
                    const results = await Promise.all([getDeviceTokensPromise, getSenderPromise]);
                    tokenSnapshot = results[0];
                    senderSnapshot = results[1];

                    const token = tokenSnapshot.val();
                    if (!token) {
                        console.log('Message sent from senderUID: ', senderUID, ' to receiverUID: ', receiverUID);
                        return Promise.reject(new Error('Notification token is empty.'));
                    }

                    const sender = senderSnapshot.val();
                    if (!sender) {
                        console.log('Message sent from senderUID: ', senderUID, ' to receiverUID: ', receiverUID);
                        return Promise.reject(new Error('No sender user found with UID: ', senderUID));
                    }

                    try {
                        // Notification details.
                        const payload = {
                            notification: {
                                title: title,
                                body: body
                            }
                            // },
                            // data: {
                            //     channel: 'messages',
                            //     largeIconUrl: sender.profile_pic_url
                            // }
                        }
                        return admin.messaging().sendToDevice(token, payload);
                    } catch (error) {
                        console.log('Message sent from senderUID: ', senderUID, ' to receiverUID: ', receiverUID);
                        return Promise.reject(error);
                    }

                }
            });
        }

    })