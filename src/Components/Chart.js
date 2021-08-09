import React, { useState } from 'react';
import { View, Dimensions, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Icon, Divider, Card } from 'react-native-elements';
import { getIndice } from '../api/carelog';
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
  } from 'react-native-chart-kit'

export const Chart = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState({});
    const dataValidation = React.useRef(false);
    const [indexes, setIndexes] = React.useState({year: {i: 0, arr: []}, week: {i: 0, arr: []}});
    const [statistic, setStatistic] = React.useState({});

    const setDataOfWeek = async () => {
        let Systolic = [];
        let Diastolic = [];
        let arr = [];
        let data2 = {};
        console.log("HERE", data);
        if(!Array.isArray(indexes.year.arr) || !Array.isArray(indexes.week.arr) || Object.keys(data).length == 0) return;
        console.log("HERE2");
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        weekdays.forEach(day => {
            if(!Array.isArray(data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day]))
            //    arr.push(null);
                console.log("null");
            else {
                if(!data2['labels']) data2['labels'] = [];
                data2['labels'].push(day);

                if(!data2['datasets']) data2['datasets'] = [];

                const dayValues = data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day];
                if(props.type != 'blood') {
                    let sum = 0;
                    dayValues.forEach(value => {
                        sum += value;
                    });
                    arr.push(sum/dayValues.length);
                    data2['datasets'] = [{data: arr}];
                } else {
                    let sumSystolic = 0;
                    let sumDiastolic = 0;
                    dayValues.forEach(value => {
                        sumSystolic += value.systolic;
                        sumDiastolic += value.diastolic;
                    });
                    Systolic.push(sumSystolic/dayValues.length);
                    Diastolic.push(sumDiastolic/dayValues.length);
                    data2['datasets'] = [
                        {data: Systolic},
                        {data: Diastolic}
                    ]
                    console.log(data2);
                    //arr.push(...arr, {systolic: sumSystolic/dayValues.length, diastolic: sumDiastolic/dayValues.length});
                }
            }
        });
        setStatistic(data2);
        console.log("statistic", statistic);
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

    useFocusEffect(
        React.useCallback(() => {
            const subscribe = async () => {
                setIsLoading(true);
                if(!dataValidation.current) {
                    dataValidation.current = true;
                    let d = await getIndice(props.type);
                    setData(d);
                    setIndexes({...indexes, year: {...indexes.year, arr: Object.keys(d).reverse()}});
                }
            };
            subscribe();

            return () => {
            }
            }, [props.type])
    );

    React.useEffect(() => {
        setIsLoading(true);
        setDataOfWeek();
        setIsLoading(false);
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

    const chartConfig = {
        backgroundGradientFrom: '#Ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(1, 122, 205, 1)`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, 1)`,
        style: {
            borderRadius: 16,
            fontFamily: 'Bogle-Regular'
        },
        propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#efefef',
            strokeDasharray: '0',
          },
          propsForLabels: {
            fontFamily: 'Arial'
          },
        data: {statistic}
    };
    return (
        <View>
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
                {console.log(statistic)}
                <LineChart
                    segments={3}
                    withShadow={false}
                    data={statistic}
                    showBarTops={false}
                    showValuesOnTopOfBars={true}
                    width={Dimensions.get('window').width} // from react-native
                    height={220}
                    chartConfig={chartConfig}
                    formatYLabel={(value) => value}
                    style={{
                        width: Dimensions.get('window').width,
                        borderRadius: 16
                    }}
                />
        </View>
    );
}