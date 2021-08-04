import React from 'react';
import { Pedometer } from 'expo-sensors';

export const getSteps = () => {
    const [isPedometerAvailable, setIsPedometerAvailable] = React.useState('checking');
    const [pastStepCount, setPastStepCount] = React.useState(0);
    const [currentStepCount, setCurrentStepCount] = React.useState(0);
  
    let _subscription;
  
    const _subscribe = () => {
      _subscription = Pedometer.watchStepCount(result => {
        setCurrentStepCount(result.steps);
      });
  
      Pedometer.isAvailableAsync().then(
        result => {
          setIsPedometerAvailable(result);
        },
        error => {
          setIsPedometerAvailable('Could not get isPedometerAvailable: ' + error);
        }
      );
  
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 1);
      Pedometer.getStepCountAsync(start, end).then(
        result => {
          setPastStepCount(result.steps);
        },
        error => {
          setPastStepCount('Could not get stepCount: ' + error);
        }
      );
    };
  
    const _unsubscribe = () => {
      _subscription && _subscription.remove();
      _subscription = null;
    };
  
  
    React.useEffect(()=>{
      _subscribe();
      return ()=> _unsubscribe();
    },[]);

    return {
        isPedometerAvailable: isPedometerAvailable,
        pastStepCount: pastStepCount,
        currentStepCount: currentStepCount
    };
}