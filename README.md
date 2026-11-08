# Narxoz background sync

Public code only. Credentials, Canvas records and device subscriptions must never be committed to this repository.

The bundled Node.js worker reads Canvas, refreshes the owner's private online dashboard and sends Web Push reminders for incomplete assignments with a deadline. Thresholds: 24, 12 and 6 hours, 1 hour and 30 minutes. A delayed run sends only the closest relevant reminder, not a burst of all missed thresholds. Notifications are deduplicated per device, assignment, deadline and threshold. Expired subscriptions are removed. Only fresh Canvas results are used for reminders.

Canvas configuration is one encrypted GitHub Actions secret: `NARXOZ_WORKER_CONFIG`. The workflow belongs at `.github/workflows/sync.yml`. The dashboard's Cloudflare minute cron dispatches it every five minutes through GitHub's API; the site's Refresh button can also request a run. A shared database lease, cooldown and active-run check prevent duplicate launches. The separate repository-scoped Actions credential lives only in the Cloudflare secret `CANVAS_DISPATCH_TOKEN`; the Canvas credential stays in GitHub. GitHub's own scheduled trigger is removed to avoid competing schedulers. Runner queues, outages and Canvas response time can still delay completion: this is best-effort refresh, not an exact five-minute freshness guarantee. The dashboard's own minute cron also handles its notification delivery independently of this loader.

`worker.cjs` is bundled from the application's `runner/sync.mjs`, `lib/canvas.mjs`, `lib/notify.mjs` and web-push 3.6.7. It requires Node.js 20 or later. No secrets are included in the bundle. Runtime logs contain counts and generic errors only.

On a phone, open the private dashboard and sign in as its owner. Under Settings enable notifications on that device. On iPhone/iPad, first add the site to the Home Screen. Notification permission and device/browser settings determine delivery; the screen may show the subject and assignment name.
