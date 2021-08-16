# humit firebase cloud functions

home of cloud functions for humit firebase.

**login** to firebase using-

```bash
firebase login
```

## setup

(**required**)
**install firebase** cli tools and node libraries required using-

```bash
cd <functions-folder>
npm install firebase-functions@latest firebase-admin@latest --save
npm install -g firebase-tools
```

(Ideally the following step is **not required** since repo is already setup)
**setup** a new function using-

```bash
firebase init functions
```

## install

```bash
npm install
```

## functions

### messaging notifications

send a notification to the receiver as soon as there is a new message in Realtime DB using FCM.

#### sample data structure

if a new message is send, a new entry is created at `/conversations/$conversationID/messages/$messageID`.

this function expects the following data structure at firebase db:

```
/humit-dev
    /conversations:
        /$conversationID:
            /last_message: "...",
            /members: [...],
            /messages:
                /$messageID:
                    ...
                    /sender_id: "...",
                    /receiver_id: "...",
                    /blocked: true/false,
                    ...
    /equations:
        /$user1ID:
            /$user2ID:
                ...
                /muted: true/false,
                ...
    /users:
        /$userID:
            ...
            /profile_pic_url: "...",
            /display_handle: "...",
            /notification_id: "...",
            ...
```

#### trigger rules

The function triggers every time a new message is created at `/conversations/$conversationID/messages/$messageID`.

## deploy

See external links at the bottom for additional info. By default cli looks in `functions/` folder.

- to deploy all functions in `fucntions/index.js`:

```bash
firebase deploy --only functions
```

- to deploy a specific function:

```bash
firebase deploy --only functions:<func-name>
```

- to configure webengage auth key

```bash
firebase functions:config:set webenage_authentication.key="auth-key-abc-xyz-goes-here" webenage_license_code.key="also-goes-here"
```

- to delete:

```bash
firebase functions:delete <func-name>
```

## external links

- [Based On Sample @](https://github.com/firebase/functions-samples/blob/master/fcm-notifications/functions/index.js)
- [Getting Started](https://firebase.google.com/docs/functions/get-started)
- [Deployment Docs](https://firebase.google.com/docs/functions/manage-functions)
- [Configure Environment Variables](https://firebase.google.com/docs/functions/config-env)
- [Structure multiple functions](https://firebase.google.com/docs/functions/organize-functions)
