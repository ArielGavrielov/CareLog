import React from 'react';
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
  const [Loading, setLoading] = React.useState(true);
  const isScreenMounted = React.useRef(true);

  React.useEffect(() => {
    setLoading(true);
    if(selected) {
      getIndice(selected.route).then((data) => {
        if(isScreenMounted.current)
          setIndicesData(data)
      })
      .catch((err) => console.log(err))
      .finally(() => {
        if(isScreenMounted.current) setLoading(false);
      });
    }
  }, [selected]);

  React.useEffect(() => {
    isScreenMounted.current = true;
    if(isScreenMounted.current) {
      console.log("again 1");
      getFeeling().then((data) => {
        if(isScreenMounted.current)
          setFeelingData(data);
          console.log(data);
      }).catch((err) => setFeelingData({}));
    }
    return () => {
      setFeelingData(null);
      isScreenMounted.current = false;
    }
  }, []);

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
          {Loading || indicesData && Object.keys(indicesData).length === 0 && indicesData.constructor === Object ? <Text style={{alignSelf: 'center'}}>Loading...</Text> :
          !indicesData || indicesData.error ? <Text style={{alignSelf: 'center'}}>No Data...</Text> :
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