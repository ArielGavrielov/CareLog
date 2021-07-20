import React, { useContext } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { Container } from "native-base";
import { Input, Image, Text, Button } from 'react-native-elements';
import { useForm, Controller } from "react-hook-form";
import { Context as AuthContext } from '../Context/AuthContext';
import { InputControl } from '../Components/InputControl';
import * as patterns from '../Components/Patterns';
 
const LoginScreen = ({navigation}) => {
  const { state, signin } = useContext(AuthContext)
  const { control, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => {
    console.log(data);
    signin(data);
  }
  
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("../assets/logo-197X69.png")} />
      <Text h2 style={ styles.headerText }>Welcome back</Text>
      <InputControl
            keyboardType='email-address'
            control={control}
            name="email"
            leftIcon={{type: 'font-awesome-5', name: 'envelope'}}
            rules={{
                required: "You must specify a email address",
                //pattern: patterns.emailPattern
            }}
        />
        <InputControl
                control={control}
                name="password"
                secureTextEntry
                leftIcon={{type: 'font-awesome-5', name: 'key'}}
                rules={{
                    minLength: {
                        value: 6,
                        message: "Password must have at least 8 characters"
                    },
                    maxLength: {
                        value: 32,
                        message: "Maximum password characters is 32."
                    },
                    required: "You must specify a password",
                    //pattern: patterns.passwordPattern
                }}
            />
      {state.errorMessage ? <Text>{state.errorMessage}</Text> : null}

      <Button 
        buttonStyle={ styles.loginBtn } 
        titleStyle= {{ color: "white" }}
        title="Sign in"
        type="solid"
        onPress={handleSubmit(onSubmit)}
      />
      <Button
        type="clear"
        title="Forgot Password?"
      />
      <Button
        type="clear"
        title="Sign up"
        onPress={() => navigation.navigate('Register')}
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
 
  inputView: {
    backgroundColor: "#FFC0CB",
    borderRadius: 30,
    width: "70%",
    height: 45,
    marginBottom: 20,
 
    alignItems: "center",
  },
 
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 20,
  },
 
  forgot_button: {
    height: 30,
  },
 
  loginBtn: {
    width: "80%",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    margin: 40,
    backgroundColor: "#FF1493",
    color: '#fff'
  },
});

export default LoginScreen;