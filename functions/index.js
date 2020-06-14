'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Listens for new messages added to /conversations/:conversation_id/messages/:message_id
exports.messagingNotifications = functions.database
    .ref('/conversations/{conversationId}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        // Grab the original value of what was written to db
        const message = snap.val();
        const conversationId = context.params.conversationId;
        const messageId = context.params.messageId;
        console.log('We have a new message ID: ', messageId, 'at conversation ID: ', conversationId);

        // Get userIDs
        const receiverUID = message.receiver_id;
        const senderUID = message.sender_id;
        console.log('Message sent from senderUID: ', senderUID, ' to receiverUID: ', receiverUID);

        // Get device token for receiverUID
        const getDeviceTokensPromise = admin.database()
            .ref(`/users/${receiverUID}/notification_id`).once('value');
        
        const getSenderPromise = admin.database()
            .ref(`/users/${senderUID}`).once('value');
        
        let tokenSnapshot;
        let senderSnapshot;
        const results = await Promise.all([getDeviceTokensPromise, getSenderPromise]);
        tokenSnapshot = results[0];
        sender = results[1].val();

        if (!tokenSnapshot.hasChildren()) {
            return console.log('There are no tokens to send notifications to.');
        }

        const token = tokenSnapshot.val();
        if (!token) {
            return console.log('Notification token is empty.');
        }

        if (!sender) {
            return console.log('No sender user found with UID: ', senderUID);
        }

        // Notification details.
        const payload = {
            notification: {
                title: `${sender.user_handle}`,
                body: `${sender.user_handle} sent you a message.`,
                icon: sender.profile_pic_url
            }
        };

        // Send notifications to all tokens.
        // const response = await admin.messaging().sendToDevice(token, payload);
        // check response errors ?
        return admin.messaging().sendToDevice(token, payload);
    });