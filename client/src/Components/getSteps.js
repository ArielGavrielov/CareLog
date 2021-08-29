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

      console.log(currentStepCount);
  
      Pedometer.isAvailableAsync().then(
        result => {
          setIsPedometerAvailable(result);
        },
        error => {
          setIsPedometerAvailable('Could not get isPedometerAvailable: ' + error);
        }
      );
  
      const end = new Date();
      const start = new Date("2021-08-11T00:00:00.000Z");
      //start.setDate(end.getDate()+1);
      console.log(start, end);
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
      return ()=> {
        _unsubscribe();
      }
    },[]);

    return {
        isPedometerAvailable: isPedometerAvailable,
        pastStepCount: pastStepCount,
        currentStepCount: currentStepCount
    };
}

export const getStepsBetween = async (startDate, endDate) => {
  const [steps, setSteps] = React.useState(0);

  await Pedometer.isAvailableAsync().then(
    result => {
      if(result) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        console.log(start, end);
        Pedometer.getStepCountAsync(start, end).then(
          result => {
            console.log(result.steps);
            setSteps(result.steps);
          },
          error => {
            console.log('Could not get stepCount: ' + error);
          }
        );
      }
    },
    error => {
      console.log('Could not get isPedometerAvailable: ' + error);
    }
  );

  return steps;
};