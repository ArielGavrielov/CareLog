import * as React from 'react';
import { Progress, Box, VStack, Text } from 'native-base';
import { Card } from 'react-native-elements';
import { View } from 'react-native';

const ProgressBar = ({title, data}) => {
    return <Card>
        <Card.Title>{title}</Card.Title>
        <Card.Divider color = '#FFC0CB'/>
        <Box w="90%">
            <VStack space="md">
                <VStack mx={4} space="md">
                    {
                        data.map((item, i) => (
                            <View key={i}>
                                <Text>{item.title}</Text>
                                <Progress colorScheme={item.colorScheme} value={item.value} min={item.min} max={item.max} />
                            </View>
                        ))
                    }
                </VStack>
            </VStack>
        </Box>
    </Card>
}

export default ProgressBar;
