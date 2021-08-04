import React from 'react';
import { ScrollView } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { Indice } from '../Components/Indice';

const IndicesScreen = () => {

    const indices = [
    {
        route: 'blood',
        title: 'Blood pressure',
        inputs: [
            {
                name: 'Systolic',
                rules: {
                    min: {
                    value: 100,
                    message: 'Minimum value is 100.'
                    },
                    max: {
                    value: 200,
                    message: 'Maximum value is 200.'
                    },
                    required: "Systolic is required."
                },
            },
            {
                name: 'Diastolic',
                rules: {
                    min: {
                    value: 70,
                    message: 'Minimum value is 70.'
                    },
                    max: {
                    value: 140,
                    message: 'Maximum value is 140.'
                    },
                    required: "Diastolic is required."
                }
            }
        ]
    },
    {
        route: 'pulse',
        title: 'Pulse',
        inputs: [
            {
                name: 'Pulse',
                rules: {
                    min: {
                    value: 50,
                    message: 'Minimum value is 50.'
                    },
                    max: {
                    value: 200,
                    message: 'Maximum value is 200.'
                    },
                    required: "Pulse is required."
                }
            }
        ]
    },
    {
        route: 'bodyheat',
        title: 'Body heat',
        inputs: [
            {
                name: 'Body heat',
                rules: {
                    min: {
                    value: 31,
                    message: 'Minimum value is 31.'
                    },
                    max: {
                    value: 43,
                    message: 'Maximum value is 43.'
                    },
                    required: "Body Heat is required."
                }
            }
        ]
    },
    {
        route: 'oxygen',
        title: 'Oxygen Saturation',
        inputs: [
            {
                name: 'Oxygen saturation',
                rules: {
                    min: {
                    value: 60,
                    message: 'Minimum value is 60.'
                    },
                    max: {
                    value: 100,
                    message: 'Maximum value is 100.'
                    },
                    required: "Oxygen Saturation is required."
                }
            }
        ]
    }];

    return (
        <ScrollView>
            <Text h1>Indices</Text>
            {
                indices.map((item, i) => (
                    <Indice
                        key={i}
                        route={item.route}
                        title={item.title}
                        inputs={item.inputs}
                    />
                ))
            }
      </ScrollView>
    )
}

export default IndicesScreen;