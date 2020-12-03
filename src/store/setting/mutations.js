export async function updateMinFaceMatch (state, payload) {
  state.minFaceMatch = payload
}

export async function updateMaxTestImages (state, payload) {
  state.maxTestImages = payload
}

export async function updatePredictionInterval (state, payload) {
  state.predictionInterval = payload
}
