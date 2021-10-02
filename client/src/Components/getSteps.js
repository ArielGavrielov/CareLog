import React from 'react';
import { Pedometer } from 'expo-sensors';
import moment from 'moment';

export const getSteps = (unit='day') => {

    return {
        isPedometerAvailable: isPedometerAvailable,
        pastStepCount: pastStepCount,
        currentStepCount: currentStepCount
    };
}

export const getStepsByUnit = async (unit='day') => {
  const [steps, setSteps] = React.useState(0);

  await Pedometer.isAvailableAsync().then(result => {
      if(result) {
        console.log(startDate, endDate);
        Pedometer.getStepCountAsync(startDate, endDate).then(
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