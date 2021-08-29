import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Keyboard } from 'react-native';
import { Image, Text, Button, SocialIcon } from 'react-native-elements';
import { useForm, Controller } from 'react-hook-form';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import * as patterns from '../Components/Patterns';
import { InputControl, DateInputControl } from '../Components/InputControl';
import { Context as AuthContext } from '../Context/AuthContext';

const SignupScreen = () => {
    const { state, signup } = React.useContext(AuthContext);
    const { control, handleSubmit, watch, trigger, formState } = useForm();
    const onSubmit = (data) => {
        signup({...data, phone: data.phonenumber});
    }

    return (
    <View >
        <View style={{alignItems: "center",justifyContent: "center"}}>
            <Image style={styles.image} source={require("../assets/logo-197X69.png")} />
            <Text h3 style={styles.headerText}>Create account</Text>
        </View>
        <ScrollView contentContainerStyle={{alignItems: "center",justifyContent: "center"}}>
        <View style={{flexDirection: "row"}}>
            <InputControl
                containerStyle={{flex:1}}
                control={control}
                trigger={trigger}
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
                trigger={trigger}
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
            trigger={trigger}
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
                containerStyle={{flex:1}}
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
        </View>
        <InputControl
            keyboardType='phone-pad'
            control={control}
            trigger={trigger}
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
            trigger={trigger}
            name="Birth date"
            rules={{
                validate:(v) => {return !Number.isNaN(Date.parse(v)) ? true : 'Invalid date!';},
                required: "You must specify a birth date",
                //pattern: patterns.birthdatePattern,
            }}
        />
        <Controller
            control={control}
            name="policy"
            render={({
                field: { onChange, value=false },
                fieldState: { error }
                }) => (
                    <View style={{alignSelf:'flex-start', marginTop: 10, marginBottom: 10}}>
                        <View style={{flexDirection:'row'}}>
                            <BouncyCheckbox
                                text='I agree with privacy policy'
                                fillColor='pink'
                                style={{
                                    marginStart: 7
                                }}
                                iconStyle={{
                                    borderColor: 'pink'
                                }}
                                textStyle={{
                                    textDecorationLine: "none"
                                }}
                                isChecked={value}
                                onPress={(isChecked) => {
                                    onChange(isChecked);
                                    trigger("policy");
                                }}
                            />
                        </View>
                        {error ? <Text style={{color:'red', fontSize:12, marginLeft:15}}>{error.message}</Text> : null}
                    </View>
                )
            }
            rules={{
                validate: value => value == false ? 'You must accept terms and conditions' : true
            }}
        />
        <Button
            buttonStyle={ styles.registerBtn } 
            titleStyle= {{ color: "white", padding: 10 }}
            title="Sign up"
            type="solid"
            onPress={handleSubmit(onSubmit, (errors) => console.log(errors))}
        />
        </ScrollView>
        <View style={{flexDirection: 'row', alignItems: 'center', margin:20}}>
            <View style={{flex: 1, height: 1, backgroundColor: 'pink'}} />
            <View>
                <Text style={{width: 50, textAlign: 'center'}}>OR</Text>
            </View>
            <View style={{flex: 1, height: 1, backgroundColor: 'pink'}} />
        </View>

        <View style={{flexDirection:'row', alignItems: "center", justifyContent: "center"}}>
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
    },
    registerBtn: {
        borderRadius: 25,
        height: 50,
        width: 100,
        backgroundColor: "pink",
        color: '#fff'
    }
});
export default SignupScreen;