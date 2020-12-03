export async function updateMinFaceMatch ({ commit, state }, data) {
  try {
    await commit('updateMinFaceMatch', data)
    console.log('Minimum facematch set to', (data * 100) + '%')
    return data
  } catch (error) {
    console.error('Error setting minimum facematch to', data)
    return error
  }
}

export async function updateMaxTestImages ({ commit, state }, data) {
  try {
    await commit('updateMaxTestImages', data)
    console.log('Maximum testimage set to', data)
    return data
  } catch (error) {
    console.error('Error setting maximum testimage to', data)
    return error
  }
}

export async function updatePredictionInterval ({ commit, state }, data) {
  try {
    await commit('updatePredictionInterval', data)
    console.log('Prediction interval set to', data + 'minutes')
    return data
  } catch (error) {
    console.error('Error setting prediction interval to', data + 'minutes')
    return error
  }
}
