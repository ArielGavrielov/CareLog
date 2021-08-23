import React from 'react';
import { Alert } from 'react-native';
import { Card, Text, Icon, Button } from 'react-native-elements';
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
            <Card.Title>{props.title}</Card.Title>
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