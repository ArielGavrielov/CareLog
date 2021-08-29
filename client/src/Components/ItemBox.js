import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Icon, Text } from 'react-native-elements';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const SCREEN_WIDTH = Dimensions.get('window').width;

const ItemBox = (props) => {
    const leftSwipe = (progress, dragX) => {
        const scale = dragX.interpolate({
            inputRange: [0, 70],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          });
        return (
            <TouchableOpacity onPress={props.handleDelete} activeOpacity={0.6}>
                <View style={styles.deleteBox}>
                    <Animated.View style={{transform: [{scale: scale}]}}>
                        <Text style={{color: 'white'}}>Delete</Text>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
    <Swipeable renderLeftActions={leftSwipe}>
        <View style={styles.container}>
            <Text>{props.data}</Text>
        </View>
    </Swipeable>
  );
};

export default ItemBox;

const styles = StyleSheet.create({
    container: {
      height: 30,
      width: SCREEN_WIDTH,
      backgroundColor: 'white',
      justifyContent: 'center',
      paddingLeft: 10
    },
    deleteBox: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: 30,
      },
  });