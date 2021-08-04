import React from 'react';
import { View, Dimensions, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Icon, Divider, Card } from 'react-native-elements';
import { getIndice } from '../api/carelog';
import SplashScreen from '../Screens/SplashScreen';
import Swipeable from 'react-native-gesture-handler/Swipeable'
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
} from "react-native-chart-kit";
import { TouchableOpacity } from 'react-native-gesture-handler';


const dataSets = async (type) => {
    let res = await getIndice(type);

    return res;
};

export const Chart = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState({});
    const [indexes, setIndexes] = React.useState({year: 0, week: 0});
    
    const chartConfig = {
        backgroundColor: "#fff",
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 1, // optional, default 3
        barPercentage: 1,
        useShadowColorFromDataset: false // optional
    };

      useFocusEffect(
        React.useCallback(() => {
            const subscribe = async () => {
                setIsLoading(true);
                setData(await dataSets(props.type));
                setIsLoading(false);
            };
            subscribe();

            return () => {
                setIsLoading(true);
                setData({});
                setIndexes({year: 0, week: 0});
            }
            }, [props.type])
        );

      if(isLoading) return <SplashScreen />

    return (
        <View>
            <Card>
                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                    <View style={{flex: 1}}>
                        {
                            indexes.year > 0 ?
                            <TouchableOpacity onPress={() => setIndexes({year: indexes.year-1, week: 0})}>
                                <Icon name='arrow-left-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                    <View style={{flex: 5}}>
                        <Text h3 style={{alignSelf: 'center'}}>
                            {Object.keys(data)[indexes.year]}
                        </Text>
                    </View>
                    <View style={{flex: 1}}>
                        {
                            indexes.year < Object.keys(data).length-1 ?
                            <TouchableOpacity onPress={() => setIndexes({year: indexes.year+1, week: 0})}>
                                <Icon name='arrow-right-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                </View>
                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                    <View style={{flex: 1}}>
                        {
                            indexes.week > 0 ?
                            <TouchableOpacity onPress={() => setIndexes({...indexes, week: indexes.week-1})}>
                                <Icon name='arrow-left-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                    <View style={{flex: 5}}>
                        <Text h4 style={{alignSelf: 'center'}}>
                            {Object.keys(data[Object.keys(data)[indexes.year]])[indexes.week]}
                        </Text>
                    </View>
                    <View style={{flex: 1}}>
                        {
                            indexes.week < Object.keys(data[Object.keys(data)[indexes.year]]).length-1 ?
                            <TouchableOpacity onPress={() => setIndexes({...indexes, week: indexes.week+1})}>
                                <Icon name='arrow-right-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                </View>
                <Card.Divider color='#FFC0CB'/>
                <BarChart
                data={{
                    labels: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
                    datasets: [
                        {
                            data: [5,null,null,null,null,100,null]
                        }
                    ]
                }}
                //width={Dimensions.get("window").width}
                width={355}
                height={220}
                chartConfig={chartConfig}
            />
            </Card>
        </View>
    );
}