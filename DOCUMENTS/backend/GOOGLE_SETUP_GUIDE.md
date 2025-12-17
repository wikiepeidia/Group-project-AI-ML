# Google OAuth Setup Guide

## Fixing "Error 403: access_denied"

This error happens because your Google Cloud project is in **Testing** mode, and the email you are trying to log in with is not added as a **Test User**.

### Solution 1: Add Test Users (Recommended for Development)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent).
2. Navigate to **APIs & Services** > **OAuth consent screen**.
3. Scroll down to the **Test users** section.
4. Click **+ ADD USERS**.
5. Enter the email address you are trying to log in with (e.g., `your.email@gmail.com`).
6. Click **Save**.

### Solution 2: Publish App (Not Recommended yet)

If you click "Publish App", it will be available to everyone, but you might need to go through a verification process with Google, which takes time.

## Fixing "Error 400: redirect_uri_mismatch"

If you see this error, it means the URL your app is using is not whitelisted.

1. Go to **APIs & Services** > **Credentials**.
2. Click on your **OAuth 2.0 Client ID**.
3. Under **Authorized redirect URIs**, ensure you have:
   - `http://localhost:5000/callback` (For the token generator script)
   - `http://localhost:5000/google/callback` (For the main app login)
   - `http://127.0.0.1:5000/google/callback` (Alternative for main app)

## Welcome Email Logic

The system is currently configured to send Welcome Emails **only when a new user is created**:

1. **Google Signup** (`app.py`):
   - The code checks if the email exists in the database.
   - If it exists: It just logs you in.
   - If it's new: It creates the account and sends the email.

2. **Standard Signup** (`core/auth.py`):
   - The code tries to insert the new user.
   - If the email is taken: It fails and sends nothing.
   - If it's new: It creates the account and sends the email.
