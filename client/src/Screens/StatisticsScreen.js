import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Divider } from 'react-native-elements'
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { IndiceChart, FeelingChart } from '../Components/Chart';
import { getIndice, getFeeling } from '../api/carelog';

const StatisticsScreen = ({navigation}) => {
  const indices = {
    blood: {
      route: 'blood',
      title: 'Blood pressure'
    },
    pulse: {
      route: 'pulse',
      title: 'Pulse'
    },
    bodyheat: {
      route: 'bodyheat',
      title: 'Body heat'
    },
    oxygen: {
      route: 'oxygen',
      title: 'Oxygen Saturation'
    },
  };

  const [selected, setSelected] = React.useState(indices.blood);
  const [indicesData, setIndicesData] = React.useState(null);
  const [feelingData, setFeelingData] = React.useState(null);
  const [isLoading, setLoading] = React.useState(true);
  const isScreenMounted = React.useRef(true);
  const initialSubscribe = React.useRef(true);

  const subscribe = async () => {
    try {
      const indice = await getIndice(selected.route);
      setIndicesData(indice);

      const feeling = await getFeeling();
      setFeelingData(feeling);

      initialSubscribe.current = false;
    } catch(err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      console.log('statistics mount');
      subscribe();
      isScreenMounted.current = true;

      return () => {
        setFeelingData(null);
        setIndicesData(null);
        setSelected(indices.blood);
        isScreenMounted.current = false;
        initialSubscribe.current = true;
      }
    }, [])
  )

  React.useEffect(() => {
    if(initialSubscribe.current || !isScreenMounted.current) return;
    setLoading(true);
    if(selected) {
      getIndice(selected.route).then((data) => {
        if(isScreenMounted.current) {
          setIndicesData(data);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
    }
  }, [selected]);

  return (
    <View style={{backgroundColor: 'white', height: Dimensions.get('window').height}}>
      <View style={{height: 370}}>
          <Text h3 style={{alignSelf: 'center'}}>Indices</Text>
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
          {!indicesData || isLoading || (indicesData && indicesData.constructor === Object && Object.keys(indicesData).length === 0) ? <Text style={{alignSelf: 'center'}}>Loading...</Text> :
          indicesData && indicesData.error ? <Text style={{alignSelf: 'center'}}>No Data...</Text> :
          <IndiceChart
            type={selected.route}
            data={indicesData}
            navigation={navigation}
          />
          }
        </View>
        <View>
          <Text h3 style={{alignSelf: 'center'}}>Feeling</Text>
          <Divider color='#FFC0CB' style={{marginBottom: 10}}/>
          {feelingData && Object.keys(feelingData).length > 0 ? 
          <FeelingChart 
            data={feelingData}
          /> : !feelingData ?
            <Text style={{alignSelf: 'center'}}>Loading...</Text>
            : <Text style={{alignSelf: 'center'}}>No Data...</Text> }
        </View>
    </View>
    );
}
export default StatisticsScreen;