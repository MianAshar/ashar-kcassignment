// Entry point: loads persisted trip data (S-8), initialises state, renders app.

import { setState, setTripData } from "./ui/state.js";
import { render } from "./ui/app.js";
import { loadTrip } from "./logic/storage.js";

function initApp(): void {
  const result = loadTrip(localStorage);

  if (result.ok) {
    setTripData(result.data.participants, result.data.expenses);
  } else if (result.reason === "corrupt") {
    // S-8: corrupted data — show the banner, start with empty trip.
    setState({ storageLoadError: true });
  }
  // result.reason === "empty" → nothing to do, app starts empty by default.

  render();
}

initApp();
