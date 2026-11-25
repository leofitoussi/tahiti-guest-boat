# Umami deployed customization

Source snapshot for the Umami 3.0.3 analytics application, separate from the Astro site.
The patch includes Netlify migration configuration, the authenticated A/B report, native pageview collection calculations and verification scripts. No database dumps, environment values, generated builds or Netlify credentials are included.

Base: upstream tag `v3.0.3` (`2a71cc7`). Apply in a clean checkout:

```sh
git clone --branch v3.0.3 https://github.com/umami-software/umami.git tgb-umami
cd tgb-umami
git apply --check /path/to/umami-v3.0.3-netlify.patch
git apply /path/to/umami-v3.0.3-netlify.patch
```

Configure DATABASE_URL and APP_SECRET privately and follow ops/README.md plus ops/home-experiment-report.md. The bundled migration README contains historical preparation notes; the Linear issues TGB-67/TGB-68 and the main site's operational runbook record the final state. Do not run the historical cutover steps again.

This patch is stored with the Tahiti Guest Boat source so the deployed report is backed up without pushing changes to the upstream Umami repository. The original MIT license is included.

Main site release: `6b0680a53a1a45974695fb4e`; analytics release: `6b06823c4dbf8e87e63d75fb`. Native collection starts `2026-11-25T06:31:07.153Z`; the end was explicitly extended on November 25 to December 13, 2026 at 07:34 Tahiti. The report now contains only the chart and comparison, shared date/device filters, and automatic refresh.
