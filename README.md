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
* Configure
  * The default park in the index.js file is Shanghai Disney
  * You may change to other parks according to this repo: https://api.themeparks.wiki/preview/parks/
* Test
  * Click the link in the output of wrangler publish. e.g. `https://themeparks-exporter-cloudflare-worker.<yourusername>.workers.dev`
    * Repalce yourusername with real username
* Add to Prometheus Server
  * Add the following to the /etc/prometheus/prometheus.yml, and restart prometheus server
    * Repalce yourusername with real username
  ```
  - job_name: themeparks-exporter
    static_configs:
      - targets: ['themeparks-exporter-cloudflare-worker.<yourusername>.workers.dev:443']
    scheme: https
  ```
## Demo
* https://themeparks-exporter-cloudflare-worker.melvinto.workers.dev
