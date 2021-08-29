import React from 'react';
import { Alert, View } from 'react-native';
import { Card, Icon, Button } from 'react-native-elements';
import { useForm } from "react-hook-form";
import { InputControl } from '../Components/InputControl';
import { postIndices } from '../api/carelog';

export const Indice = (props) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const {control, handleSubmit, formState, trigger, reset} = useForm();

    const onSubmit = (values) => {
        setIsLoading(true);
        Object.keys(values).forEach((el) => {
          values[el] = parseInt(values[el]);
        });
        postIndices(props.route, values).then((value) => Alert.alert('Success', value.message, [{text: 'OK'}]))
        . catch((err) => Alert.alert('ERROR', err.message, [{text: 'OK'}]))
        .finally(() => {
            setIsLoading(false);
            reset();
        });
    }

    return (
        props.withoutCard ? 
        <>
            {props.inputs.map((input, i) => (
                <InputControl 
                    key={i}
                    trigger={trigger}
                    rules={input.rules}
                    keyboardType='numeric'
                    name={input.name}
                    control={control}
                />
            ))}
            <Button
                title='Save'
                disabled={!formState.isValid || isLoading}
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
            />
        </>
         :
        <Card>
            <View style={{flexDirection:'row', justifyContent: 'center'}}>
                {props.icon ? <Icon type={props.icon.type} name={props.icon.name} size={20} /> : null }
                <Card.Title>{props.title}</Card.Title>
            </View>
            <Card.Divider color='#FFC0CB' />
            {props.inputs.map((input, i) => (
                <InputControl 
                    key={i}
                    trigger={trigger}
                    rules={input.rules}
                    keyboardType='numeric'
                    name={input.name}
                    control={control}
                />
            ))}
            <Button
                title='Save'
                disabled={!formState.isValid || isLoading}
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
            />
        </Card>
    )
}