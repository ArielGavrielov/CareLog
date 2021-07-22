import * as React from 'react';
import { useForm } from 'react-hook-form';
import { View, StyleSheet } from 'react-native';
import { Text, Image, Button } from 'react-native-elements';
import { Context as AuthContext } from '../Context/AuthContext';
import { InputControl, DateInputControl } from '../Components/InputControl';
import { emailPattern, birthdatePattern } from '../Components/Patterns';

const ForgotScreen = (props) => {
    const { control, trigger, handleSubmit, formState } = useForm();
    const { state, getResetPasswordToken } = React.useContext(AuthContext);
    const [dataState, setDataState] = React.useState({
        isLoading: false,
        countdown: 0
    });

    const onSubmit = async (props) => {
        setDataState({...dataState, isLoading:true});
        await getResetPasswordToken(props);
        setDataState({...dataState, isLoading:false, countdown: 30});
    }

    React.useEffect(() => {
        if(props.route.params.email)
            trigger('email');
        if(dataState.countdown > 0)
            setTimeout(() => setDataState({countdown: dataState.countdown-1}), 1000);
    });
    //trigger();
    return (
        <View style={styles.container}>
            <Image style={styles.image} source={require("../assets/logo-197X69.png")} />
            <Text h4 style={ styles.headerText }>Reset Password</Text>
            <InputControl
                defaultValue={props.route.params.email}
                keyboardType='email-address'
                control={control}
                trigger={trigger}
                name="email"
                leftIcon={{type: 'font-awesome-5', name: 'envelope'}}
                rules={{
                    required: "You must specify a email address",
                    pattern: emailPattern
                }}
            />
            <DateInputControl
                trigger={trigger}
                leftIcon={{type: 'font-awesome-5', name: 'calendar-minus'}}
                control={control}
                trigger={trigger}
                name="Birth date"
                rules={{
                    validate:(v) => {return !Number.isNaN(Date.parse(v)) ? true : 'Invalid date!';},
                    required: "You must specify a birth date",
                    //pattern: birthdatePattern,
                }}
            />
            {state.errorMessage ? 
                <Text style={styles.errorMessage}>{state.errorMessage}</Text>
            : 
            state.message ? <Text style={styles.message}>{state.message}</Text> : null}
            <Button 
                disabled={!formState.isDirty || !formState.isValid || dataState.isLoading || dataState.countdown > 0}
                loading={dataState.isLoading}
                buttonStyle={ styles.Btn } 
                titleStyle= {{ color: "white" }}
                title={dataState.countdown > 0 ? "Reset Password (" + dataState.countdown + ")" : "Reset Password"}
                type="solid"
                onPress={handleSubmit(onSubmit, (errors) => console.log(errors))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: 150,
        height: 50
    },
    headerText: {
        marginBottom: 40
    },
    Btn: {
        width: 200,
        borderRadius: 25,
        height: 50,
        backgroundColor: "pink",
        color: '#fff'
    },
    errorMessage: {
        color: 'red',
        marginBottom: 10
    },
    message: {
        marginBottom: 10
    }
})

export default ForgotScreen;