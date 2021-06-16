'use strict'

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
var db = admin.database();

// Listens for new messages added to /conversations/:conversation_id/messages/:message_id
exports.messagingNotifications = functions.database
.ref('/conversations/{conversationId}/messages/{messageId}')
.onCreate(async (snap, context) => {
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
        // console.log(error);
        console.log('Message sent from senderUID: ', senderUID, ' to receiverUID: ', receiverUID);
        return Promise.reject(new Error('Malformed message object. Either sender_id, receiver_id, or blocked key not found'));
    }
    
    // Check if muted
    const muted = await db.ref(`/equations/u_${receiverUID}/u_${senderUID}/muted`).once('value');
    if (muted.val()) {
        return null
    }

    // Get device token for receiverUID and sender user details 
    const getDeviceTokensPromise = db.ref(`/users/${receiverUID}/notification_id`).once('value');
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

    try{
        // Notification details.
        const payload = {
            notification: {
                title: title,
                body: body
            },
            fcmOptions: {
                analyticsLabel: "messaging"
            },
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
})