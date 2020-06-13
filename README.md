# humit firebase cloud functions

home of cloud functions for humit firebase.

- notifications

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

## deploy

```bash
firebase deploy --only functions
```

## external links

- [Getting Started](https://firebase.google.com/docs/functions/get-started)
- [Config Environment Variables](https://firebase.google.com/docs/functions/config-env)
- [Structure](https://firebase.google.com/docs/functions/organize-functions)
