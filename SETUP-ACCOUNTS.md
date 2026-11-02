# Turning on online accounts

Procademy's Profile page lets a learner sign in with Google, or make an account with a username and a
password, so their progress is saved online and they can log in on any computer. It runs on Firebase, Google's free plan. The site's
owner sets this up once, in about five minutes; learners never visit Firebase.

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. **Create a project.** Name it `procademy` (any name works). Google Analytics is not needed: switch it
   off. Press **Create project**, then **Continue**.
3. **Turn on passwords.** In the left menu: **Build → Authentication → Get started**. On the
   **Sign-in method** tab, choose **Email/Password**, switch on the first switch (**Email/Password**, not
   the passwordless link), and **Save**.
   Then, for **Continue with Google**: **Add new provider → Google**, switch on **Enable**, choose your
   email as the *support email*, and **Save**.
4. **Add the website.** Still in Authentication: **Settings → Authorized domains → Add domain** →
   `priyaanh.github.io` → **Add**.
5. **Make the database.** **Build → Firestore Database → Create database**. Pick a location near you
   (for example `nam5 (United States)`), then **Start in production mode** → **Create**.
6. **Lock it down.** In Firestore, open the **Rules** tab, delete what is there, paste the whole of
   [`firestore.rules`](firestore.rules), and press **Publish**. These rules let each learner read and
   write only their own progress.
7. **Register the web app.** Click the gear ⚙ next to *Project overview* → **Project settings**. Under
   **Your apps**, press the web button `</>`. Nickname: `Procademy`. Leave *Firebase Hosting* unticked.
   **Register app**. Firebase shows a block like:

   ```js
   const firebaseConfig = {
     apiKey: "AIza…",
     authDomain: "procademy-1234.firebaseapp.com",
     projectId: "procademy-1234",
     storageBucket: "…",
     messagingSenderId: "…",
     appId: "1:…:web:…"
   };
   ```

   Copy it into `lib/firebase-config.js` as `window.PROCADEMY_FIREBASE = { apiKey: …, authDomain: …,
   projectId: …, appId: … };` (or send it to Claude to do). These values are not secret: every Firebase web
   app publishes them. The passwords and the rules are what keep accounts safe.
8. **If this is your own project** (not `procademy-9d972`): in `index.html`'s security policy, change
   `frame-src https://procademy-9d972.firebaseapp.com` to your project's `authDomain`. The Google pop-up
   reports back through a hidden frame from that address, and the policy allows no other frames.
9. Run `./tests/run.sh`, push, and open **Profile** on the site.

Optional, for extra safety: in <https://console.cloud.google.com/apis/credentials> (same Google account,
same project), open the **Browser key**, set **Application restrictions → Websites** and add
`https://priyaanh.github.io/*` and your project's `https://<project-id>.firebaseapp.com/*` (password-reset
links and the Google pop-up run there), then **Save**. The key then works only on the Procademy site.

## What is stored

One document per learner, `users/{uid}`: the username, when the account was made and last saved, and the
same progress the site keeps on the device (levels, practice history, settings, badges, speed-sprint
bests). Tutor chats and attached files are never uploaded. Passwords are held by Firebase Authentication,
hashed; Procademy never sees them. With Google sign-in there is no password at all: Google confirms who
it is, and Firebase Authentication keeps the Google account's email, name and photo, as it does for any
Google sign-in. Procademy shows only the email, on the Profile page, and never saves the name or photo
with the progress. A learner can delete their account, and everything saved online, from
the Profile page.

Free-plan limits (50,000 reads and 20,000 writes a day) are far more than a family or a class needs.
