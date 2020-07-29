import { date } from 'quasar'

export async function addNewRecord ({ commit, state }, record) {
  try {
    let e = false
    const arr = state.history
    arr.forEach((val, i) => {
      if (val.name === record.name) {
        const diff = date.getDateDiff(Date.now(), val.time, 'minutes')
        if (diff < record.interval) {
          e = true
          console.log(record.name, 'exist', diff, `minute${(diff > 1) ? 's' : ''} ago!`, 'Please wait', (record.interval - diff), `minute${((record.interval - diff) > 1) ? 's' : ''} and try again.`)
        }
      }
    })
    if (!e) {
      await commit('addHistory', { name: record.name, time: record.time })
      console.log('Record', state.history.length, 'added!')
    }
  } catch (error) {
    console.error('Error Adding Record', error)
    return error
  }
}

export async function checkRecordExist ({ state }, record) {
  try {
    console.log('Checking if record exists!')
    let e = false
    const arr = state.history
    console.log(record, 'Record')
    console.log(state, 'state')
    arr.forEach((val, i) => {
      console.log(val, 'Value')
      if (val.name === record) {
        const diff = date.getDateDiff(Date.now(), val.time, 'minutes')
        if (diff >= 30) e = true
      }
    })
    return e
  } catch (error) {
    return false
  }
}
