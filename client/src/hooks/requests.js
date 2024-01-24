const API_URL = 'http://localhost:4000';

async function httpGetPlanets() {
  // Load Planets and return as JSON
  const response = await fetch(`${API_URL}/v1/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  const response = await fetch(`${API_URL}/v1/launches`);
  const launches = await response.json();
  // Sort them by flightNumber desc
  return launches.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
  try {
    // Submit given launch data to launch system.
    return await fetch(`${API_URL}/v1/launches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(launch)
    });
  } catch(error) {
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  // Abort launch with given ID.
  try {
    return await fetch(`${API_URL}/v1/launches/${id}`, {
      method: 'PATCH'
    });
  } catch(error) {
    return {
      ok: false 
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};