import { date } from 'quasar'

export async function addNewRecord ({ commit, state }, record) {
  try {
    let validateRec = false
    const arr = state.history
    await arr.forEach(async (val, i) => {
      if (val.name === record.name) {
        const diff = date.getDateDiff(Date.now(), val.time, 'minutes')
        if (diff < record.interval) {
          validateRec = true
          console.warn(record.name, 'exist', diff, `minute${(diff > 1) ? 's' : ''} ago!`, 'Please wait', (record.interval - diff), `minute${((record.interval - diff) > 1) ? 's' : ''} and try again.`)
        }
      }
    })
    if (validateRec === false) {
      await commit('addHistory', record)
      console.log(state.history.length, record.time_str, ' - ', record.name)
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('Error Adding Record', error)
    return error
  }
}
