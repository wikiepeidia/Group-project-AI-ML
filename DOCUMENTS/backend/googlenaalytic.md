# Setting up Google Analytics for Admin Analytics

This guide details how to integrate Google Analytics 4 (GA4) into the application to track user activity, which can then be visualized in the Admin Analytics dashboard.

## Step 1: Create a Google Analytics 4 Property

1. Go to [analytics.google.com](https://analytics.google.com/).
2. Click **Start measuring** (or **Admin** > **Create Account** if you already have an account).
3. **Account Setup**: Enter an account name (e.g., "Group Project AI-ML").
4. **Property Setup**:
    * Property Name: "App Analytics"
    * Reporting Time Zone: Select your time zone.
    * Currency: Select your currency.
5. **Business Details**: Select your industry and business size.
6. **Business Objectives**: Choose "Generate leads" or "Examine user behavior".
7. Click **Create** and accept the Terms of Service.

## Step 2: Set up a Data Stream

1. In the property you just created, choose a platform. Click **Web**.
2. **Website URL**: Enter your production URL (e.g., `your-app.com`).
   * Note: Google Analytics expects a publicly reachable URL for accurate collection. Using `localhost` is not recommended and may be blocked or produce skewed results.
   * For local testing, expose your development site using a secure tunneling tool like `ngrok` or `localtunnel` and use the generated HTTPS URL in the Website URL field (see example below).

3. **Stream Name**: e.g., "Web App Stream".
4. Click **Create stream**.
5. You will see a **Measurement ID** starting with `G-XXXXXXXXXX`. Copy this ID.

Tip: Start `ngrok` for local testing and use the forwarded HTTPS URL as your Website URL:

```bash
ngrok http 5000
```

## Step 3: Add the Tracking Code to Your Application

You need to add the Google tag to every page you want to measure. The best place is in your base template.

1. Open `ui/templates/base.html`.
2. Locate the `<head>` tag.
3. Paste the following code immediately after the opening `<head>` tag, replacing `G-YOUR-MEASUREMENT-ID` with your actual ID from Step 2.

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-MEASUREMENT-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-YOUR-MEASUREMENT-ID');
</script>
```

### Optional: Track Admin Specific Events

If you want to track specific actions in the Admin Analytics page (e.g., "Export Report"), you can manually trigger events in your JavaScript:

```javascript
// Example: Track when an admin exports a report
document.getElementById('exportBtn').addEventListener('click', function() {
    gtag('event', 'admin_export', {
        'event_category': 'Admin Actions',
        'event_label': 'Monthly Report'
    });
});
```

## Step 4: Verify Installation

1. Run your application locally or deploy it.
2. Go to your Google Analytics dashboard.
3. Navigate to **Reports** > **Realtime**.
4. Browse your website in a separate tab.
5. You should see at least "1 user in the last 30 minutes" in the Realtime report.

## Step 5: Integrating with Admin Dashboard (Future Implementation)

To display this data directly inside your `admin_analytics.html` page (instead of going to the Google Analytics website), you need to set up server-side access.

1. **Enable the API**:
    * Go to the [Google Cloud Console](https://console.cloud.google.com/).
    * Select your project.
    * Navigate to **APIs & Services** > **Library**.
    * Search for and enable **"Google Analytics Data API"**.

2. **Set up Authentication (Service Account)**:
    * Go to **APIs & Services** > **Credentials**.
    * Click **Create Credentials** > **Service Account**.
    * Name it (e.g., "analytics-fetcher") and click **Create**.
    * Click **Done**.
    * Click on the newly created Service Account (email looks like `name@project-id.iam.gserviceaccount.com`).
    * Go to the **Keys** tab > **Add Key** > **Create new key** > **JSON**.
    * Save this file as `secrets/analytics_service_account.json`.

3. **Grant Access in Google Analytics**:
    * Copy the **email address** of the Service Account you just created.
    * Go to [Google Analytics](https://analytics.google.com/).
    * Go to **Admin** > **Property Settings** > **Property Access Management**.
    * Click **+** > **Add users**.
    * Paste the Service Account email.
    * Assign the **Viewer** role.
    * Click **Add**.

4. **Install the Library**:

    ```bash
    pip install google-analytics-data
    ```

5. **Implementation in `app.py`**:
    You will need to use the `BetaAnalyticsDataClient`.
    * **Scope**: The library handles authentication automatically using the JSON key. If you were using a user-based OAuth flow instead, the required scope would be:
        `https://www.googleapis.com/auth/analytics.readonly`

    Example code snippet:

    ```python
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import RunReportRequest
    import os

    # Point to the service account key
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'secrets/analytics_service_account.json'

    def get_analytics_data(property_id):
        # property_id should be your numeric GA4 Property ID (e.g., '123456789')
        client = BetaAnalyticsDataClient()

        request = RunReportRequest(
            property=f"properties/{property_id}",
            dimensions=[{"name": "date"}],
            metrics=[{"name": "activeUsers"}],
            date_ranges=[{"start_date": "30daysAgo", "end_date": "today"}],
        )
        response = client.run_report(request)
        # Process response...
    ```
