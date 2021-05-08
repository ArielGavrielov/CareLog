import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { Input, Image, Text, Button, Icon } from 'react-native-elements';
import { useForm, Controller } from "react-hook-form";
import { Context as AuthContext } from '../../Context/AuthContext';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { emailValidator } from '../../Components/Validator';

const RegisterScreen = ({navigation}) => {
  const { state, signup, clearErrorMessage } = useContext(AuthContext);
  const { control, handleSubmit, formState: { errors } } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {},
    resolver: undefined,
    context: AuthContext,
    criteriaMode: "firstError",
    shouldFocusError: true,
    shouldUnregister: false,
  });
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [birthdate, setBirthdate] = useState();
  console.log(errors);
  useEffect(() => {
    clearErrorMessage();
  }, []);

  const onSubmit = (data) => {
    if(data.password != data.confirmPassword) return console.log("Need to handle this.");
    delete data.confirmPassword;
    //data.birthdate = new Date();
    //data.birthdate.setDate(birthdate.getDate());
    data.birthdate = dateToString(birthdate);
    console.log(errors);
    signup(data);
  }

  const dateToString = (date) => {
    var day,mon,year;
    day = date.getDate();
    mon = date.getMonth()+1;
    year = date.getFullYear();
    if(day < 10) day = '0'+day;
    if(mon < 10) mon = '0'+mon;
    return day+'/'+mon+'/'+year;
  };
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("../../assets/logo-197X69.png")} />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              leftIcon={{type: 'font-awesome-5', name: 'user-tie'}}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              placeholder="First name"
            />
          )}
          name="first_name"
          rules={{ required: true }}
          defaultValue=""
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              style={{width: 100}}
              leftIcon={{type: 'feather', name: 'mail'}}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              placeholder="Last name"
            />
          )}
          name="last_name"
          rules={{ required: true }}
          defaultValue=""
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              leftIcon={{type: 'feather', name: 'mail'}}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              placeholder="Email"
            />
          )}
          name="email"
          rules={{ 
            required: "Email is required",
            validate: (value) => {
              if(!emailValidator(value))
                return "Please enter valid email.";
            }
          }}
          defaultValue=""
        />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              leftIcon={{type: 'feather', name: 'mail'}}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              placeholder="Phone number"
            />
          )}
          name="phone"
          rules={{ required: true }}
          defaultValue=""
        />
            <TouchableWithoutFeedback activeOpacity={10}  style={{flexDirection:'row'}} onPress={() => setDatePickerVisibility(true)}>
              <Input 
              leftIcon={<Icon onPress={() => setDatePickerVisibility(true)} type='feather' name='calendar' ></Icon>}
                disabled 
                value={birthdate ? 'Birth date: ' + dateToString(birthdate) : 'Birth date' } 
              />
            </TouchableWithoutFeedback>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              maximumDate={new Date()}
              minimumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 120))}
              mode="date"
              headerTextIOS="Enter birth date"
              date={birthdate}
              onConfirm={(date) => {
                setBirthdate(date);
                setDatePickerVisibility(false);
              }}
              onCancel={() => setDatePickerVisibility(false)}
            />
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              leftIcon={{type: 'feather', name: 'mail'}}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              secureTextEntry
              autoCorrect={false}
              autoCapitalize='none'
              placeholder="Password"
            />
          )}
          name="password"
          rules={{ required: true }}
          defaultValue=""
        />
       <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              leftIcon={{type: 'feather', name: 'mail'}}
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              value={value}
              secureTextEntry
              autoCorrect={false}
              autoCapitalize='none'
              placeholder="Confirm password"
            />
          )}
          name="confirmPassword"
          rules={{ required: true }}
          defaultValue=""
        />
        
        {state.errorMessage ? <Text>{state.errorMessage}</Text> : null}
      <Button 
        buttonStyle={ styles.loginBtn } 
        titleStyle= {{ color: "white" }}
        title="Sign up"
        type="solid"
        onPress={handleSubmit(onSubmit)}
      />
      <Button
        type="clear"
        title="Sign in"
        onPress={() => navigation.navigate('Login')}
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
    marginBottom: 40,
    width: 150,
    height: 50
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

export default RegisterScreen;