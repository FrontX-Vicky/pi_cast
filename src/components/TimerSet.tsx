import React, { useRef, useState, useEffect } from 'react';

const TimerSet=(pi_id) =>{  
  console.log('here258');

  const [PiExpire, SetPiexpire] = useState('');
  const timerRefs = useRef({}); // Store timeouts

    console.log('useEffect triggered with pi_id:', pi_id);

    if (timerRefs.current[pi_id]) {
      console.log('Clearing previous timeout for pi_id:', pi_id);
      clearTimeout(timerRefs.current[pi_id]);
    }
    timerRefs.current[pi_id] = setTimeout(() => {
      delete timerRefs.current[pi_id];
      // SetPiexpire(pi_id);
      console.log('Deleted pi_id after 15 seconds:', pi_id);
    }, 15000);

    return () => {
      if (timerRefs.current[pi_id]) {
        console.log('Cleanup: Clearing timeout for pi_id:', pi_id);
        clearTimeout(timerRefs.current[pi_id]);
        delete timerRefs.current[pi_id];
      }
    };
}
export default TimerSet;