export async function updateVideoDevices ({ commit, state }, devices) {
  try {
    await commit('updateVideoDevices', devices)
    console.log(state.devices.video.length, 'Video device added!')
    return true
  } catch (error) {
    console.error('Error adding video devices', error)
    return error
  }
}

export async function updateAudioDevices ({ commit, state }, devices) {
  try {
    await commit('updateAudioDevices', devices)
    console.log(state.devices.audio.length, 'Audio devices added!')
    return true
  } catch (error) {
    console.error('Error adding audio devices', error)
    return error
  }
}

export async function updateOtherDevices ({ commit, state }, devices) {
  try {
    await commit('updateOtherDevices', devices)
    console.log(state.devices.other.length, 'Other device added!')
    return true
  } catch (error) {
    console.error('Error other other devices', error)
    return error
  }
}

export async function changeCamera ({ commit, state }, device) {
  try {
    await commit('changeCamera', device)
    console.log(state.camera && state.camera.label ? `Using camera ${state.camera.label}!` : 'Camera changed!')
    return device
  } catch (error) {
    console.error('Error camera change', error)
    return error
  }
}

export async function changeFaceOption ({ commit, state }, selected) {
  try {
    await commit('changeFaceOption', selected)
    console.log('Using', state.selectedFaceOption, 'detection!')
    return selected
  } catch (error) {
    console.error('Error camera change', error)
    return error
  }
}
