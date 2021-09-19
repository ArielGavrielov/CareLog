import React, { useState } from 'react';
import { View, Dimensions, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Text, Icon, Divider, Card } from 'react-native-elements';

import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
  } from 'react-native-chart-kit'

export const IndiceChart = (props) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const dataValidation = React.useRef(false);
    const [indexes, setIndexes] = React.useState({year: {i: 0, arr: []}, week: {i: 0, arr: []}});
    const [statistic, setStatistic] = React.useState({});

    const setDataOfWeek = async () => {
        let data = {};
        if(!Array.isArray(indexes.year.arr) || !Array.isArray(indexes.week.arr) || Object.keys(props.data).length == 0) return;
        data['labels'] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        data['labels'].forEach(day => {
            if(!data['datasets']) data['datasets'] = [{data: []}, {data: []}];

            if(!Array.isArray(props.data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day])) {
                if(props.type != 'blood') {
                    data['datasets'][0]['data'].push(0);
                } else {
                    data['datasets'][0]['data'].push(0);
                    data['datasets'][1]['data'].push(0);
                }
            } else {
                const dayValues = props.data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day];
                if(props.type != 'blood') {
                    let sum = 0;
                    dayValues.forEach(value => {
                        sum += value;
                    });
                    data['datasets'][0]['data'].push(sum/dayValues.length);
                } else {
                    let sumSystolic = 0;
                    let sumDiastolic = 0;
                    dayValues.forEach(value => {
                        sumSystolic += value.systolic;
                        sumDiastolic += value.diastolic;
                    });
                    data['datasets'][0]['data'].push(sumSystolic/dayValues.length);
                    data['datasets'][1]['data'].push(sumDiastolic/dayValues.length);
                }
            }
        });
        if(props.type == 'blood') {
            data['legend'] = ["Systolic", "Diastolic"];
            data['datasets'][0]['color'] = (opacity = 1) => `rgba(0, 255, 255, ${opacity})`
            data['datasets'][1]['color'] = (opacity = 1) => `rgba(255, 0, 255, ${opacity})`
        }
        setStatistic(data);
    }
    
    const onIndexChange = ({ weekIndex=-1, yearIndex=-1 }) => {
        if(Object.keys(props.data).length > 0) {
            if(yearIndex >= 0) {
                setIndexes((prev) => {
                    return { 
                        year: {
                            ...prev.year,
                            i: yearIndex
                        },
                        week: {
                            i: 0,
                            arr: Object.keys(props.data[prev.year.arr[yearIndex]])
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
                    //let d = await getIndice(props.type);
                    //setData(props.data);
                    setIndexes({...indexes, year: {...indexes.year, arr: Object.keys(props.data).reverse()}});
                }
            };
            subscribe();
            }, [props.type])
    );

    React.useEffect(() => {
        if(!dataValidation.current && props.data) {
            setIsLoading(true);
            setDataOfWeek();
            setIsLoading(false);
        }
    }, [indexes]);

    React.useMemo(() => {
        if(dataValidation.current) {
            onIndexChange({yearIndex: 0});
            dataValidation.current = false;
        }
    }, [indexes]);

      if(isLoading || Object.keys(statistic).length === 0) return <Text style={{alignSelf: 'center'}}>Loading...</Text>
      else if(!Array.isArray(indexes.year.arr) || !props.data || props.data == {}) return <Text>No Data</Text>

    const chartConfig = {
        backgroundColor: "#ffffff",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",    
        decimalPlaces: 0,
        color: (opacity = 1) => `rgb(0,0,0)`,
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
        }
    };
    return (
        <View>
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
                <View style={{flex: 1}}>
                {
                    indexes.year.i < indexes.year.arr.length-1 ?
                    <TouchableOpacity onPress={() => onIndexChange({yearIndex: indexes.year.i+1, weekIndex: 0})}>
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
                    indexes.year.i > 0 ?
                    <TouchableOpacity onPress={() => onIndexChange({ yearIndex: indexes.year.i-1, weekIndex: 0 })}>
                        <Icon name='arrow-right-circle' type='feather' />
                    </TouchableOpacity> : null
                }
                </View>
            </View>
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
                <View style={{flex: 1}}>
                {
                    indexes.week.i < indexes.week.arr.length-1 ?
                    <TouchableOpacity onPress={() => onIndexChange({weekIndex: indexes.week.i+1})}>
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
                    indexes.week.i > 0 ?
                    <TouchableOpacity onPress={() => onIndexChange({weekIndex: indexes.week.i-1})}>
                        <Icon name='arrow-right-circle' type='feather' />
                    </TouchableOpacity> : null
                }
                </View>
            </View>
            {props.type === 'blood' ?
            <LineChart
                getDotProps={(dataPoint) => {
                    if(dataPoint === 0) return {
                        r: '0',
                        strokeWidth: '0',
                    }
                    return {
                        r: '4',
                    }
                }}
                onDataPointClick={(data) => {
                    console.log(data);
                    <View style={{position:'absolute' ,bottom: data.y, top: data.y, right: data.x, left: data.x}}><Text>{data.value}</Text></View>
                }}
                withShadow={false}
                data={statistic}
                width={Dimensions.get('window').width}
                height={220}
                fromNumber={180}
                chartConfig={chartConfig}
                style={{
                    width: Dimensions.get('window').width,
                    borderRadius: 16
                }}
            />
            : 
            <BarChart
                data={statistic}
                showValuesOnTopOfBars
                width={Dimensions.get('window').width}
                height={220}
                chartConfig={chartConfig}
            />
            }
        </View>
    );
}

export const FeelingChart = (props) => {

    const [isLoading, setIsLoading] = React.useState(true);
    const isScreenMounted = React.useRef();
    const [indexes, setIndexes] = React.useState({year: {i: 0, arr: null}, week: {i: 0, arr: null}});
    const [statistic, setStatistic] = React.useState(null);

    // create data for chart module
    const setDataOfWeek = async () => {
        let data = {};

        if(!Array.isArray(indexes.year.arr) || !Array.isArray(indexes.week.arr) || Object.keys(props.data).length == 0) return;

        console.log(props.data);

        data['labels'] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        data['labels'].forEach(day => {
            if(!data['datasets']) data['datasets'] = [{data: []}];

            const dayValue = props.data[indexes.year.arr[indexes.year.i]][indexes.week.arr[indexes.week.i]][day];
            data['datasets'][0]['data'].push(dayValue ? dayValue : 0);
        });
        //console.log(data);
        setStatistic(data);
    }

    const onIndexChange = ({ weekIndex=-1, yearIndex=-1 }) => {
        if(Object.keys(props.data).length > 0) {
            if(yearIndex >= 0) 
                setIndexes((prev) => {
                    return { 
                        year: {
                            ...prev.year,
                            i: yearIndex
                        },
                        week: {
                            i: 0,
                            arr: Object.keys(props.data[prev.year.arr[yearIndex]])
                        }
                    }
                });
            
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

    function* yLabel() {
        yield* ['No data', 'Terrible', 'Bad', 'Okay', 'Good', 'Great'];
        //yield* [0, 1, 2, 3, 4, 5];
    }
    const yLabelIterator = yLabel();

    React.useEffect(() => {
        if(props.data && !statistic) {
            setIndexes({...indexes, year: {...indexes.year, arr: Object.keys(props.data).reverse()}});
            onIndexChange({yearIndex: 0});
        }
    }, []);

    React.useEffect(() => {
        if(!indexes.year.arr || !indexes.week.arr) return;
        setDataOfWeek();
        setIsLoading(false);
    }, [indexes]);

    const chartConfig = {
        backgroundColor: "#ffffff",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",    
        decimalPlaces: 0,
        color: (opacity = 1) => `rgb(0,0,0)`,
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
        formatYLabel: (y) => yLabelIterator.next().value
    };

    if(isLoading || 
        !statistic || 
        Object.keys(statistic).length === 0 ||
        !indexes) return <Text style={{alignSelf: 'center'}}>Loading...</Text>

    return (
        <View>
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
                <View style={{flex: 1}}>
                {
                    indexes.year.i < indexes.year.arr.length-1 ?
                    <TouchableOpacity onPress={() => onIndexChange({yearIndex: indexes.year.i+1, weekIndex: 0})}>
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
                    indexes.year.i > 0 ?
                    <TouchableOpacity onPress={() => onIndexChange({ yearIndex: indexes.year.i-1, weekIndex: 0 })}>
                        <Icon name='arrow-right-circle' type='feather' />
                    </TouchableOpacity> : null
                }
                </View>
            </View>
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
                <View style={{flex: 1}}>
                {
                    indexes.week.i < indexes.week.arr.length-1 ?
                    <TouchableOpacity onPress={() => onIndexChange({weekIndex: indexes.week.i+1})}>
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
                    indexes.week.i > 0 ?
                    <TouchableOpacity onPress={() => onIndexChange({weekIndex: indexes.week.i-1})}>
                        <Icon name='arrow-right-circle' type='feather' />
                    </TouchableOpacity> : null
                }
                </View>
            </View>
            <BarChart
                withShadow={false}
                data={statistic}
                segments={5}
                fromNumber={5}
                width={Dimensions.get('window').width}
                height={220}
                chartConfig={chartConfig}
                style={{
                    width: Dimensions.get('window').width,
                    borderRadius: 16
                }}
            />
        </View>
    );
}