import React from 'react'
import TimerSet from '../components/TimerSet'

function TimerFnc(props) {
  console.log(props);
  debugger;
  return (
    <TimerSet pi_id ={props.pi_id}/>
  )
}

export default TimerFnc