# Narxoz background sync

Public code only. Credentials, Canvas records and device subscriptions must never be committed to this repository.

The bundled Node.js worker reads Canvas, refreshes the owner's private online dashboard and sends Web Push reminders for incomplete assignments with a deadline. Thresholds: 24, 12 and 6 hours, 1 hour and 30 minutes. A delayed run sends only the closest relevant reminder, not a burst of all missed thresholds. Notifications are deduplicated per device, assignment, deadline and threshold. Expired subscriptions are removed. Only fresh Canvas results are used for reminders.

Configuration is one encrypted GitHub Actions secret: `NARXOZ_WORKER_CONFIG`. The workflow belongs at `.github/workflows/sync.yml`. It runs every five minutes, plus manual dispatch. GitHub may delay or drop scheduled runs and disable schedules after prolonged repository inactivity. This free setup is best-effort, not an exact alarm service. Re-enable the workflow if GitHub disables it.

`worker.cjs` is bundled from the application's `runner/sync.mjs`, `lib/canvas.mjs`, `lib/notify.mjs` and web-push 3.6.7. It requires Node.js 20 or later. No secrets are included in the bundle. Runtime logs contain counts and generic errors only.

On a phone, open the private dashboard and sign in as its owner. Under Settings enable notifications on that device. On iPhone/iPad, first add the site to the Home Screen. Notification permission and device/browser settings determine delivery; the screen may show the subject and assignment name.
