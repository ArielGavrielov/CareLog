import React from 'react';
import { Text, Divider } from 'react-native-elements'
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { Chart } from '../Components/Chart';

const StatisticsScreen = ({navigation}) => {
  const indices = {
    blood: {
      route: 'blood',
      title: 'Blood pressure',
      render: <Chart
                type='blood'
                navigation={navigation}
              />
    },
    pulse: {
      route: 'pulse',
      title: 'Pulse',
      render: <Chart
                type='pulse'
                navigation={navigation}
              />
    },
    bodyheat: {
      route: 'bodyheat',
      title: 'Body heat',
      render: <Chart
                type='bodyheat'
                navigation={navigation}
              />
    },
    oxygen: {
      route: 'oxygen',
      title: 'Oxygen Saturation',
      render: <Chart
                type='oxygen'
                navigation={navigation}
              />
    },
  };

  const [selected, setSelected] = React.useState(indices.blood);

  return (
    <View>
        <Text h1>Statistics Screen</Text>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {
            Object.keys(indices).map((key, i) => (
              <View key={key} style={{flexDirection: 'row', alignSelf: 'center'}}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                }}
                onPress={() => {
                  setSelected(indices[key]);
                }}
              >
                <Text style={(key === selected.route ? {fontWeight: 'bold'} : null)}>{indices[key].title}</Text>
              </TouchableOpacity>
              {Object.keys(indices).length - 1 != i ?
              <Divider style={{marginHorizontal: 10}} orientation="vertical" color='#FFC0CB' width={1} />
              : null}
              </View>
            ))
          }
        </View>
        <Divider color='#FFC0CB' style={{marginBottom: 10}}/>
        <Chart
                type={selected.route}
                navigation={navigation}
              />
    </View>
    );
}
export default StatisticsScreen;