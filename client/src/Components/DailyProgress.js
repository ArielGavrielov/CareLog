import * as React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Progress, Box, VStack, Text, Center } from 'native-base';
import { Card } from 'react-native-elements';
import { View } from 'react-native';
import { postSteps, getDailyProgresses } from '../api/carelog';

/*
{ stepsCount !== null && <Card>
        <Card.Title>Daily progress</Card.Title>
        <Card.Divider color = '#FFC0CB' />
        <Center><Text>{stepsCount}/3000</Text></Center>
        <Progress
          max={3000}
          value={stepsCount}
          colorScheme={stepsProgressColor}
        />
      </Card> }
*/

const DailyProgress = ({title}) => {
    const [isFetching, setFetching] = React.useState(false);
    const [progresses, setProgresses] = React.useState([]);

    useFocusEffect(
        React.useCallback(() => {
            let mounted = true;
            const subscribe = async () => {
                if(!isFetching && mounted) {
                    setFetching(true);
                    await postSteps();
                    console.log(mounted);
                    if(!mounted) return;
                    console.log("here");
                    let dailyProgresses = await getDailyProgresses();
                    if(!mounted) return;
                    setFetching(false);
                    setProgresses(dailyProgresses);
                    mounted = null;
                }
            }
            subscribe();

            return () => {
                mounted = false;
            }
        }, [])
    );

    return <Card>
        <Card.Title>{title}</Card.Title>
        <Box w="100%">
            <VStack space="md">
                <VStack mx={4} space="md">
                    {
                        progresses.map((progress, i) => (
                            <View key={i}>
                                <Card.Divider color = '#FFC0CB'/>
                                <Center>
                                    <Text bold>{progress.title}</Text>
                                    {progress.extraText && <Text>{progress.extraText}</Text>}
                                </Center>
                                <Progress {...progress.config} />
                            </View>
                        ))
                    }
                </VStack>
            </VStack>
        </Box>
    </Card>
}

export default DailyProgress;
