# Made For More

A clean, responsive one-page agency site built with HTML, CSS and vanilla JavaScript. No build step or framework is required.

## Run locally

Because the project list is loaded from `projects.json`, serve the folder over HTTP rather than opening `index.html` as a `file://` URL. For example, with Python installed:

```bash
cd made-for-more
python -m http.server 8000
```

Then open <http://localhost:8000>. You can also use VS Code Live Server.

## Configure form email delivery

The contact form uses Formspree. It collects an optional Instagram handle alongside the optional phone number. The page includes client-side required field and email validation, a hidden honeypot field, a loading state, and success/error messages. Formspree validates submissions on its service as well. Until configured, the form clearly asks visitors to email the agency directly.

1. Create a form at [formspree.io](https://formspree.io/) and set its destination/recipient to **madeformore555@gmail.com**. Verify that inbox if Formspree asks.
2. Copy the form endpoint shown by Formspree. It has this shape: `https://formspree.io/f/xxxxxxxx`.
3. In `app.js`, replace `https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID` in `FORM_ENDPOINT` with your real endpoint. The endpoint ID is the only project setting needed; there is no email password or secret key in the site.
4. Deploy the updated files and submit a real test enquiry. Confirm it arrives in the agency inbox and check spam if needed.

The endpoint is public by design for browser forms; never put a Gmail password or SMTP app password in `app.js`. For stronger anti-spam protection or private credentials, use Formspree's available spam controls or move to a server-backed form.

## Add a project

Projects are managed in one place: `projects.json`. Add a new object to the array and upload its image/video under `assets/projects/` (create that folder if you want to keep local assets together). Example:

```json
{
  "id": "bright-new-launch",
  "title": "Bright New Launch",
  "category": "Website",
  "description": "A longer explanation shown when someone opens the project.",
  "shortDescription": "A concise line shown on the project card.",
  "image": "assets/projects/bright-new-launch.webp",
  "alt": "Describe what is visible in the image",
  "link": "https://your-project.example"
}
```

Use a unique `id`; `category` must be `Website`, `Video` or `Publishing`. Use a compressed `.webp` or `.jpg` thumbnail and a useful `alt` description. The card and category filters update automatically. If you have a video file to play in the detail view, add a `"video": "assets/projects/example.mp4"` property; keep `image` as its poster/thumbnail. The separate link button opens `link` in a new tab. Project data is public, so do not put private/client-sensitive details in it.

## Deploy for free

### Netlify (recommended)

1. Push this folder to a GitHub repository or use Netlify's manual deploy to upload the `made-for-more` folder.
2. In Netlify, choose **Add new site → Import an existing project**, connect the repository and set the publish directory to `.` if the repository root is this folder. No build command is needed.
3. Add a custom domain if desired. After changing `app.js` or `projects.json`, deploy again.

### GitHub Pages

1. Put these files at the root of a GitHub repository (or configure Pages to use the `made-for-more` folder via a workflow).
2. In **Settings → Pages**, select the `main` branch and `/ (root)` folder, then save.
3. Wait for Pages to publish. No build command is needed.

### Vercel

Import the repository in Vercel, choose **Other** as the framework preset, leave the build command empty, and set the output directory to `.`. Deploy.

The sample portfolio images use Unsplash URLs for presentation. Replace them with optimized images you have permission to use before launching. The contact address, social links, project examples, and `example.com` project URLs are editable placeholders where applicable.
