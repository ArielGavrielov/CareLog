import * as React from 'react';
import { Progress, Box, VStack, Text, Center } from 'native-base';
import { Card } from 'react-native-elements';
import { View } from 'react-native';
import { postSteps, getDailyProgresses } from '../api/carelog';
import moment from 'moment';

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
    const isScreenMounted = React.useRef(true);
    const [isFetched, setFetched] = React.useState({steps: false, indices: false});
    const [progresses, setProgresses] = React.useState([]);

    const indicesFetch = async () => {
        try {
            let config = await getIndicesProgress();
            if(!isScreenMounted.current) return;
            
            return {
                title: 'Indices',
                config: config
            };
        } catch(err) {

        }
    }

    React.useEffect(() => {
        const Async = async () => {
            if(!isScreenMounted.current) return;
            let dailyProgresses = await getDailyProgresses();
            if(!isScreenMounted.current) return;
            setProgresses(dailyProgresses);
        }

        Async();
        return () => {
            isScreenMounted.current = false;
        }
    }, [isScreenMounted.current]);

    return <Card>
        <Card.Title>{title}</Card.Title>
        <Box w="100%">
            <VStack space="md">
                <VStack mx={4} space="md">
                    {
                        progresses.map((progress, i) => (
                            <View key={i}>
                                {console.log(progress)}
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
