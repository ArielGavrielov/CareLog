import React, { useState } from 'react';
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

export const Chart = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState({});
    const dataValidation = React.useRef(false);
    const [indexes, setIndexes] = React.useState({year: {i: 0, arr: []}, week: {i: 0, arr: []}});
    const [statistic, setStatistic] = React.useState([1,null,null,null,null,null,null]);

    const setDataOfWeek = async () => {
        let arr = [];
        if(!Array.isArray(indexes.year.arr) || !Array.isArray(indexes.week.arr) || Object.keys(data).length == 0) return;
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        weekdays.forEach(day => {
            if(!Array.isArray(data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day]))
                arr.push(null);
            else {
                const dayValues = data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day];
                if(props.type != 'blood') {
                    let sum = 0;
                    dayValues.forEach(value => {
                        sum += value;
                    });
                    arr.push(sum/dayValues.length);
                } else {
                    console.log("here");
                    //arr.push(1);
                    let sumSystolic = 0;
                    let sumDiastolic = 0;
                    dayValues.forEach(value => {
                        console.log(value);
                        sumSystolic += value.systolic;
                        sumDiastolic += value.diastolic;
                    });
                    arr.push(sumSystolic/dayValues.length, sumDiastolic/dayValues.length);
                }
            }
        });
        setStatistic(arr);
        console.log(statistic);
    }
    
    const onIndexChange = ({ weekIndex=-1, yearIndex=-1 }) => {
        if(Object.keys(data).length > 0) {
            if(yearIndex >= 0) {
                setIndexes((prev) => {
                    return { 
                        year: {
                            ...prev.year,
                            i: yearIndex
                        },
                        week: {
                            i: 0,
                            arr: Object.keys(data[prev.year.arr[yearIndex]])
                        }
                    }
                });
            }
            if(weekIndex >= 0)
                setIndexes((prev) => {
                    return {
                        ...prev,
                        week: {
                            ...prev.week,
                            i: weekIndex
                        }
                    }
                });
        }
    };

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
                if(!dataValidation.current) {
                    dataValidation.current = true;
                    let d = await getIndice(props.type);
                    setData(d);
                    console.log(d);
                    setIndexes({...indexes, year: {...indexes.year, arr: Object.keys(d).reverse()}});
                }
            };
            subscribe();

            return () => {
            }
            }, [props.type])
    );

    React.useEffect(() => {
        setDataOfWeek();
    }, [indexes]);

    React.useMemo(() => {
        if(dataValidation.current) {
            onIndexChange({yearIndex: 0});
            dataValidation.current = false;
            setIsLoading(false);
        }
    }, [indexes]);

      if(isLoading || statistic.length == 0) return <Text style={{alignSelf: 'center'}}>Loading...</Text>
      else if(!Array.isArray(indexes.year.arr) || !data || data == {}) return <Text>No Data</Text>

    return (
        <View>
            <Card>
                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                    <View style={{flex: 1}}>
                        {
                            indexes.year.i > 0 ?
                            <TouchableOpacity onPress={() => onIndexChange({yearIndex: indexes.year.i-1, weekIndex: 0})}>
                                <Icon name='arrow-left-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                    <View style={{flex: 5}}>
                        <Text h3 style={{alignSelf: 'center'}}>
                            {indexes.year.arr[indexes.year.i]}
                        </Text>
                    </View>
                    <View style={{flex: 1}}>
                        {
                            indexes.year.i < indexes.year.arr.length-1 ?
                            <TouchableOpacity onPress={() => onIndexChange({ yearIndex: indexes.year.i+1, weekIndex: 0 })}>
                                <Icon name='arrow-right-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                </View>
                <View style={{flexDirection:'row', justifyContent: 'center'}}>
                    <View style={{flex: 1}}>
                        {
                            indexes.week.i > 0 ?
                            <TouchableOpacity onPress={() => onIndexChange({weekIndex: indexes.week.i-1})}>
                                <Icon name='arrow-left-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                    <View style={{flex: 5}}>
                        <Text h4 style={{alignSelf: 'center'}}>
                            {indexes.week.arr[indexes.week.i]}
                        </Text>
                    </View>
                    <View style={{flex: 1}}>
                        {
                            data[indexes.year.arr[indexes.year.i]] && indexes.week.i < indexes.week.arr.length-1 ?
                            <TouchableOpacity onPress={() => onIndexChange({weekIndex: indexes.week.i+1})}>
                                <Icon name='arrow-right-circle' type='feather' />
                            </TouchableOpacity> : null
                        }
                    </View>
                </View>
                <Card.Divider color='#FFC0CB'/>
                <BarChart
                data={{
                    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    datasets: [
                        {
                            data: statistic
                        }
                    ]
                }}
                //width={Dimensions.get("window").width}
                width={355}
                height={220}
                onDataPointClick={({value, dataset, getColor}) => {
                    console.log(value, dataset, getColor);
                }}
                chartConfig={chartConfig}
            />
            </Card>
        </View>
    );
}