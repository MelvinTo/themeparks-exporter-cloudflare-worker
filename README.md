# themeparks-exporter-cloudflare-worker

## What is this for?
* This script can be deployed to cloudflare worker (free) that you can monitor waiting time of each ride in disney theme parks
* The result can be exported to prometheus server, and then display on grafana dashboard.
## How to use
* Account Setup
  * Setup your free account at cloudflare worker
  * https://dash.cloudflare.com/login
* Install
```
npm -g install wrangler
wrangler login
# configure your cloudflare worker account id in wrangler.toml
# publish
wrangler publish
```
* Test
  * Click the link in the output of wrangler publish. e.g. `https://themeparks-exporter-cloudflare-worker.<yourusername>.workers.dev`