// Shared live state — updated by index.js, read by webserver.js
const state = {
  username:  'wolfXtg_bot',
  status:    'STARTING',
  platform:  'local',
  cmdCount:  0,
  startTime: Date.now(),
};

function set(patch) {
  Object.assign(state, patch);
}

function get() {
  return { ...state };
}

module.exports = { set, get };
