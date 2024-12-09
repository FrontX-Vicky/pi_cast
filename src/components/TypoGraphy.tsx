import { Box, CircularProgress, Typography } from '@mui/material'
import React from 'react'

function TypoGraphy(props) {
    let bgColoring = '';
    var percent = parseInt(props.percentage);
    if(props.type == 'storage'){
        if(percent<=60){
            bgColoring = 'success';
        }else if(percent >60 && percent <=80){
            bgColoring = 'danger';
        }else{
            bgColoring = 'info';
        }
    }else{
        bgColoring = 'success';
    }
    return (
        <>
            <Box sx={{ width: '80%', textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                        variant="determinate"
                       // 100% for background (i.e., full circle)
                        size={50} // Adjust the size as needed
                        value={100}
                        thickness={4.6}
                        sx={{
                            color: '#f4f4f4', // Background color (orange)
                            position: 'absolute',
                        }}
                    />
                    <CircularProgress
                        className={`dark:text-${{bgColoring}}`}
                        variant="determinate"
                        value={props.percentage}
                        size={50} // Adjust the size as needed
                        // color='success'
                        color={bgColoring}
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