import React from 'react'
import BatchesVenue from '../components/BatchesVenue'
import { useLocation } from 'react-router-dom';

function BatchVenue() {
    const { state } = useLocation();
    return (
        <BatchesVenue venueDetails={state} />
    )
}

export default BatchVenue