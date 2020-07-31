export async function updateMinFaceMatch ({ commit, state }, data) {
  try {
    await commit('updateMinFaceMatch', data)
    console.log(data, 'Minimum facematch set to', data, '%')
    return true
  } catch (error) {
    console.error('Error setting minimum facematch to', data)
    return error
  }
}

export async function updateMaxTestImages ({ commit, state }, data) {
  try {
    await commit('updateMaxTestImages', data)
    console.log(data, 'Maximum testimage set to', data)
    return true
  } catch (error) {
    console.error('Error setting maximum testimage to', data)
    return error
  }
}

export async function updatePredictionInterval ({ commit, state }, data) {
  try {
    await commit('updatePredictionInterval', data)
    console.log(data, 'Prediction interval set to', data)
    return true
  } catch (error) {
    console.error('Error setting prediction interval to', data)
    return error
  }
}
