const waittimeURL = "https://api.themeparks.wiki/preview/parks/ShanghaiDisneylandPark/waittime";
const gaugeName = "themeparks_waiting_time";
const header = "# HELP themeparks_waiting_time waiting time for configured themeparks\n# TYPE themeparks_waiting_time gauge";

async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return await response.json();
  }

  return null;
}

async function handleRequest(event) {
  const cacheKey = waittimeURL;
  const cache = caches.default

  let response = await cache.match(cacheKey)

  if (!response) {
    //If not in cache, get it from origin
    response = await fetch(waittimeURL)

    // Must use Response constructor to inherit all of response's fields
    response = new Response(response.body, response)

    response.headers.append("Cache-Control", "max-age=300")

    // Store the fetched response as cacheKey
    // Use waitUntil so computational expensive tasks don"t delay the response
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}

function buildOutput(rides) {
  if (!rides)
    return header + "\n";

  let lines = [];
  for (const ride of rides) {
    // original format
    // {"id":"ShanghaiDisneylandPark_attDumboFlyingElephant","waitTime":40,"status":"Operating","active":true,"lastUpdate":"2020-10-05T00:40:43.888Z","fastPass":false,"name":"Dumbo the Flying Elephant","meta":{"singleRider":false,"longitude":121.66635200217,"type":"ATTRACTION","latitude":31.148841563822}},
    // output
    // themeparks_waiting_time{rideName="The Many Adventures of Winnie the Pooh",rideId="ShanghaiDisneyResortMagicKingdom_attAdventuresWinniePooh"} 15
    if(!ride.waitTime || !ride.id || !ride.name) {
      continue;
    }

    const line = `${gaugeName}{rideName="${ride.name}", rideId="${ride.id}"} ${ride.waitTime}`
    lines.push(line)
  }

  return `${header}\n${lines.join("\n")}`;
}

async function getResponse(event) {
  const response = await handleRequest(event)
  const lastRides = await response.json();
  const output = buildOutput(lastRides);

  return new Response(output, {
    headers: {
      "content-type": "text/plain; version=0.0.1; charset=utf-8"
    }
  })
}

addEventListener("fetch", event => {
  return event.respondWith(getResponse(event));
});
