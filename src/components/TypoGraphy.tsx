import { Box, CircularProgress, Typography } from '@mui/material'
import React from 'react'

function TypoGraphy(props) {
    return (
        <>
            <Box sx={{ width: '80%', textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                        variant="determinate"
                        value={100} // 100% for background (i.e., full circle)
                        size={50} // Adjust the size as needed
                        thickness={4.6}
                        sx={{
                            color: 'grey', // Background color (orange)
                            position: 'absolute',
                        }}
                    />
                    <CircularProgress
                        className="font-medium text-black dark:text-white"
                        variant="determinate"
                        value={props.total}
                        size={50} // Adjust the size as needed
                        color='warning'
                        thickness={4.6}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="caption" component="div" color="text.secondary" className='dark:text-white'>
                            <b>{`${Math.round(props.percentage)}%`}</b>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default TypoGraphy