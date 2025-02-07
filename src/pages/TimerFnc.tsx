import React from 'react';
import TimerSet from '../components/TimerSet';

function TimerFnc(props) {
  console.log("Inside TimerFnc function, pi_id:", props.pi_id);
  return (
    <TimerSet pi_id={props.pi_id} />
  );
}

export default TimerFnc;
