import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image, Text, Button, SocialIcon } from 'react-native-elements';
import { CheckBox, Body } from 'native-base';
import { useForm, Controller } from 'react-hook-form';
import * as patterns from '../../Components/Patterns';
import { InputControl, DateInputControl } from '../../Components/InputControl';

const SignupScreen = () => {
    const { control, handleSubmit, watch } = useForm();
    const onSubmit = (data) => console.log(data);

    const [chosenDate, setDate] = useState(new Date());
    return (
    <View style={{flex:1,alignItems: "center",justifyContent: "center"}}>
        <Image style={styles.image} source={require("../../assets/logo-197X69.png")} />
        <Text h3 style={styles.headerText}>Create account</Text>
        <View style={{flexDirection: "row"}}>
            <InputControl
                containerStyle={{flex:1}}
                control={control}
                name="First Name"
                rules={{
                    required: "You must specify a first name",
                    minLength: {
                        value: 2,
                        message: "First name must have at least 2 characters"
                    },
                    pattern: patterns.firstnamePattern
                }}
            />
            <InputControl
                containerStyle={{flex:1}}
                control={control}
                name="Last Name"
                rules={{
                    required: "You must specify a last name",
                    minLength: {
                        value: 2,
                        message: "Last name must have at least 2 characters"
                    },
                    pattern: patterns.lastnamePattern
                }}
            />
        </View>
        <InputControl
            keyboardType='email-address'
            control={control}
            name="Email"
            leftIcon={{type: 'font-awesome-5', name: 'envelope'}}
            rules={{
                required: "You must specify a email address",
                pattern: patterns.emailPattern
            }}
        />
        <View style={{flexDirection: "row"}}>
            <InputControl
                containerStyle={{flex:1}}
                control={control}
                name="Password"
                secureTextEntry
                leftIcon={{type: 'font-awesome-5', name: 'key'}}
                rules={{
                    minLength: {
                        value: 8,
                        message: "Password must have at least 8 characters"
                    },
                    maxLength: {
                        value: 32,
                        message: "Maximum password characters is 32."
                    },
                    required: "You must specify a password",
                    pattern: patterns.passwordPattern
                }}
            />
            <InputControl
                containerStyle={{flex:1}}
                control={control}
                name="Repeat password"
                secureTextEntry
                leftIcon={{type: 'font-awesome-5', name: 'redo-alt'}}
                rules={{
                    required: "You must repeat the password",
                    validate: value => value === watch("Password") || "The passwords do not match"
                }}
            />
        </View>
        <InputControl
            keyboardType='phone-pad'
            control={control}
            name="Phone number"
            leftIcon={{type: 'font-awesome-5', name: 'mobile-alt'}}
            rules={{
                required: "You must specify a phone number",
                pattern: patterns.phonePattern
            }}
        />
        <DateInputControl
            leftIcon={{type: 'font-awesome-5', name: 'calendar-minus'}}
            control={control}
            name="Birth date"
            rules={{
                required: "You must specify a birth date",
                pattern: patterns.birthdatePattern
            }}
        />
        <Controller
            control={control}
            name="test"
            render={({
                field: { onChange, value=false },
                fieldState: { error }
                }) => (
                    <View style={{alignSelf:'flex-start', marginTop: 10, marginBottom: 10}}>
                        <View style={{flexDirection:'row'}}>
                            <CheckBox
                            color='pink'
                                checked={value}
                                onPress={() => onChange(!value)}
                            />
                            <Text style={{marginLeft:20}}>I agree with privacy policy</Text>
                        </View>
                        {error ? <Text style={{color:'red', fontSize:12, marginLeft:15}}>{error.message}</Text> : null}
                    </View>
                )
            }
            rules={{
                validate: value => value == false && 'You must accept terms and conditions'
            }}
        />
        <Button title='Sign up' onPress={handleSubmit(onSubmit)} titleStyle={{color:"white"}} buttonStyle={{backgroundColor: "#FF1481"}} />
        <View style={{flexDirection: 'row', alignItems: 'center', margin:20}}>
            <View style={{flex: 1, height: 1, backgroundColor: 'pink'}} />
            <View>
                <Text style={{width: 50, textAlign: 'center'}}>OR</Text>
            </View>
            <View style={{flex: 1, height: 1, backgroundColor: 'pink'}} />
        </View>

        <View style={{flexDirection:'row'}}>
            <SocialIcon
                title='Facebook'
                type='facebook'
                button
                on
                style={{width:"30%"}}
            />
            <SocialIcon
                title='Google'
                type='google'
                button
                on
                style={{width:"30%"}}
            />
        </View>
    </View>
)};

const styles = StyleSheet.create({
    image: {
        width: 150,
        height: 50
    },
    headerText: {
        marginBottom: 40
    }
});
export default SignupScreen;