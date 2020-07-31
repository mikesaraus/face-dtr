export async function updateVideoDevices (state, payload) {
  state.devices.video = payload
}

export async function updateAudioDevices (state, payload) {
  state.devices.audio = payload
}

export async function updateOtherDevices (state, payload) {
  state.devices.other = payload
}

export async function changeCamera (state, payload) {
  state.camera = payload
}

export async function changeFaceOption (state, payload) {
  state.selectedFaceOption = payload
}
