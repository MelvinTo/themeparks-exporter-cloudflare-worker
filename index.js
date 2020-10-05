let latestRides = null;

async function fetchWaitingTime() {
  const url = "https://api.themeparks.wiki/preview/parks/ShanghaiDisneylandPark/waittime";
  const init = {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  };
  const response = await fetch(url, init);
  return response;
}

async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return await response.json();
  }

  return null;
}

async function handleScheduled(event) {
  const response = await fetchWaitingTime();
  const rides = await gatherResponse(response);
  if(rides) {
    latestRides = rides;
  }
}

const gaugeName = "themeparks_waiting_time";
const header = "# HELP themeparks_waiting_time waiting time for configured themeparks\n# TYPE themeparks_waiting_time gauge";

function buildOutput(rides) {
  if (!rides)
    return ""

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

addEventListener("fetch", event => {
  if(!latestRides) {
    event.waitUntil(handleScheduled())
  }

  const output = buildOutput(latestRides);

  return event.respondWith(
    new Response(output, {
      headers: {
        "content-type": "text/plain; version=0.0.1; charset=utf-8"
      }
    })
  )
});

addEventListener("scheduled", event => {
  event.waitUntil(handleScheduled(event))
});