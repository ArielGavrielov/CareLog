import React from 'react';
import { Text, Divider } from 'react-native-elements'
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { IndiceChart } from '../Components/Chart';
import { getIndice } from '../api/carelog';

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
  const [data, setData] = React.useState({});
  const [Loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const changeData = async () => {
      setLoading(true);
      if(selected) {
        setData(await getIndice(selected.route));
        //setLoading(false);
      }
    }
    changeData();
  }, [selected]);

  React.useMemo(() => {
    setLoading(false);
  }, [data]);

  return (
    <View>
      <View>
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
          {Loading || data && Object.keys(data).length === 0 && data.constructor === Object ? <Text style={{alignSelf: 'center'}}>Loading...</Text> :
          data.error ? <Text style={{alignSelf: 'center'}}>No Data...</Text> :
          <IndiceChart
            type={selected.route}
            data={data}
            navigation={navigation}
          />
          }
        </View>
    </View>
    );
}
export default StatisticsScreen;