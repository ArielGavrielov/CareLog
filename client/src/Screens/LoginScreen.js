import * as React from "react";
import {
  StyleSheet,
  View
} from "react-native";

import { Image, Text, Button } from 'react-native-elements';
import { useForm } from "react-hook-form";
import { Context as AuthContext } from '../Context/AuthContext';
import { InputControl } from '../Components/InputControl';
import * as patterns from '../Components/Patterns';

const LoginScreen = ({navigation}) => {
  const { state, signin, clearErrorMessage } = React.useContext(AuthContext);
  const { control, handleSubmit, trigger, formState, getValues } = useForm();
  const isMounted = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async data => {
    try {
      setIsLoading(true);
      await signin(data);
    } finally {
      if(isMounted.current) {
        setIsLoading(false);
      }
    }
  }

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      clearErrorMessage();
      isMounted.current = false;
    }
  }, []);
  
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("../assets/logo-197X69.png")} />
      <Text h4 style={ styles.headerText }>Welcome back</Text>
      <InputControl
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
        <InputControl
                control={control}
                trigger={trigger}
                name="password"
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
      {state.errorMessage ? <Text>{state.errorMessage}</Text> : null}

      <Button 
        disabled={!formState.isDirty || !formState.isValid || isLoading}
        buttonStyle={ styles.loginBtn } 
        titleStyle= {{ color: "white" }}
        loading={isLoading}
        title="Sign in"
        type="solid"
        onPress={handleSubmit(onSubmit)}
      />
      <Button
        type="clear"
        title="Forgot Password?"
        onPress={() => navigation.navigate('Forgot', {email: getValues('email')})}
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