import * as React from 'react';
import { useForm } from 'react-hook-form';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Text, Image, Button } from 'react-native-elements';
import { Context as AuthContext } from '../Context/AuthContext';
import { InputControl, DateInputControl } from '../Components/InputControl';
import ModalWithX from '../Components/ModalWithX';
import * as patterns from '../Components/Patterns';

const ChangePasswordModal = (props) => {
    const { control, trigger, handleSubmit, formState, watch } = useForm();
    
    const onSubmit = async (params) => {
        await props.onSubmit(props.state.resetPassword.id, props.state.resetPassword.token, params.password);
    }

    return (
        <ModalWithX
            animationIn='slideInLeft'
            animationOut='slideOutRight'
            animationInTiming={300}
            animationOutTiming={300}
            isVisible={props.modal === 2}
            style={{flex:1}}
            deviceWidth={Dimensions.get('window').width}
            deviceHeight={Dimensions.get('window').height}
            onRequestClose={() => props.setModal(0)}
        >
            <Text h3>Change Password</Text>
            <InputControl
                control={control}
                trigger={trigger}
                name="Password"
                secureTextEntry
                leftIcon={{type: 'font-awesome-5', name: 'key'}}
                rules={{
                    minLength: {
                        value: 8,
                        message: "Password must have at least 8 characters"
                    },
                    maxLength: {
                        value: 16,
                        message: "Maximum password characters is 16."
                    },
                    required: "You must specify a password",
                    pattern: patterns.passwordPattern
                }}
            />
            <InputControl
                control={control}
                trigger={trigger}
                name="Repeat password"
                secureTextEntry
                leftIcon={{type: 'font-awesome-5', name: 'redo-alt'}}
                rules={{
                    required: "You must repeat the password",
                    validate: value => value === watch("password") || "The passwords do not match"
                }}
            />
            {props.state.errorMessage ? <Text style={styles.errorMessage}>{props.state.errorMessage}</Text> : null}
            <Button 
                disabled={!formState.isValid || formState.isSubmitting}
                loading={formState.isSubmitting}
                buttonStyle={ styles.Btn } 
                titleStyle= {{ color: "white" }}
                title='Change password'
                onPress={handleSubmit(onSubmit)}
            />
        </ModalWithX>
    );
}
const CheckTokenModal = (props) => {
    const tokenForm = useForm();
    const state = props.state;

    const checkCode = async (params) => {
        await props.onSubmit(state.resetPassword.id, params.token);
    }

    return (
        <ModalWithX
            animationIn='slideInLeft'
            animationOut='slideOutRight'
            animationInTiming={300}
            animationOutTiming={300}
            isVisible={props.modal === 1}
            style={{flex:1}}
            deviceWidth={Dimensions.get('window').width}
            deviceHeight={Dimensions.get('window').height}
            onRequestClose={() => props.setModal(0)}
        >
            <Text h3>Check Token</Text>
            <InputControl
                keyboardType='numeric'
                control={tokenForm.control}
                trigger={tokenForm.trigger}
                name="token"
                leftIcon={{type: 'font-awesome-5', name: 'envelope'}}
                rules={{
                    required: "You must specify a Token",
                    pattern: {
                        value: /^(\d{5})?$/,
                        message: 'Token is 5 digits.'
                    }
                }}
            />
            {props.state.errorMessage ? <Text style={styles.errorMessage}>{props.state.errorMessage}</Text> : null}
            <View style={{flexDirection: 'row', marginTop: 10, justifyContent: 'space-between', alignItems: 'center'}}>
                <Button 
                    disabled={props.dataState.isLoading || props.dataState.countdown > 0}
                    loading={props.dataState.isLoading}
                    buttonStyle={ styles.Btn } 
                    titleStyle= {{ color: "white" }}
                    title={props.dataState.countdown > 0 ? "Resend token (" + props.dataState.countdown + ")" : "Resend token"}
                    onPress={props.onResent}
                />
                <Button 
                    disabled={!tokenForm.formState.isValid || tokenForm.formState.isSubmitting}
                    loading={tokenForm.formState.isSubmitting}
                    buttonStyle={ styles.Btn } 
                    titleStyle= {{ color: "white" }}
                    title="Reset Password"
                    type="solid"
                    onPress={tokenForm.handleSubmit(checkCode)}
                />
            </View>
        </ModalWithX>
    );
}
const ForgotScreen = (props) => {
    const { control, trigger, handleSubmit, formState, setValue } = useForm();
    const isScreenMounted = React.useRef(true);
    const { state, resetPasswordRequest, checkToken, changePassword, resetDone } = React.useContext(AuthContext);
    const [dataState, setDataState] = React.useState({
        isLoading: false,
        countdown: 0
    });

    const [modal, setModal] = React.useState(0); // 0 - nothing, 1 - check token, 2 - change password.

    const onSubmit = async (props) => {
        setDataState({...dataState, isLoading:true});
        await resetPasswordRequest(props);
        setDataState({...dataState, isLoading:false, countdown: 30});
    }

    React.useEffect(() => {
        if(dataState.countdown > 0)
            setTimeout(() => setDataState({...dataState, countdown: dataState.countdown-1}), 1000);
    });

    React.useEffect(() => {
        isScreenMounted.current = true;

        if(state.resetPassword.success) {
            const AsyncAlert = (title, message, buttons, options={}) => {
                return new Promise((resolve, reject) => {
                    Alert.alert(
                        title,
                        message,
                        buttons.map((value) => {return {text: value.text, onPress: value.onPress ? value.onPress : () => resolve(value.resolve ? value.resolve : null)}}),
                        options
                    );
                });
            }
    
            AsyncAlert('Sucees', 'Password chaned sucessfully.', [{text: 'OK'}])
            .finally(() => {
                setModal(0);
                props.navigation.navigate('Login');
                resetDone();
            });
        } else if(state.resetPassword.id && !state.resetPassword.tokenFound && modal !== 1) {
            if(isScreenMounted.current)
                setModal(1);
        } else if(state.resetPassword.id && state.resetPassword.tokenFound && modal !== 2) {
            setModal(0);
            setTimeout(() => setModal(2), 500);
        }
        return () => {
            isScreenMounted.current = false;
        }
    }, [state]);

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
                    pattern: patterns.emailPattern
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
            {state.errorMessage && !state.resetPassword.id ? 
                <Text style={styles.errorMessage}>{state.errorMessage}</Text>
            : 
            state.resetPassword.message ? <Text style={styles.message}>{state.resetPassword.message}</Text> : null}
            <Button 
                disabled={!formState.isDirty || !formState.isValid || dataState.isLoading || dataState.countdown > 0}
                loading={dataState.isLoading}
                buttonStyle={ styles.Btn } 
                titleStyle= {{ color: "white" }}
                title={dataState.countdown > 0 ? "Send token (" + dataState.countdown + ")" : "Send token"}
                type="solid"
                onPress={handleSubmit(onSubmit)}
            />
            <CheckTokenModal
                state={state} 
                dataState={dataState} 
                setDataState={setDataState}
                onSubmit={checkToken}
                modal={modal}
                setModal={setModal}
                onResent={handleSubmit(onSubmit)}
            />
            <ChangePasswordModal
                state={state} 
                dataState={dataState} 
                setDataState={setDataState}
                onSubmit={changePassword}
                modal={modal}
                setModal={setModal}
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
        borderRadius: 25,
        height: 50,
        width: 170,
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