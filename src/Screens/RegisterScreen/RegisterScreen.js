import React from "react";
import { Text, View, Input, Button, Alert } from "native-base";
import { useForm, Controller } from "react-hook-form";

export default function App() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);

  return (
    <View style={{flex:1, alignItems: "center", justifyContent: "center",}}>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            onBlur={onBlur}
            onChangeText={value => onChange(value)}
            value={value}
          />
        )}
        name="firstName"
        rules={{ required: true }}
        defaultValue=""
      />
      {errors.firstName && <Text>This is required.</Text>}

      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            onBlur={onBlur}
            onChangeText={value => onChange(value)}
            value={value}
          />
        )}
        name="lastName"
        defaultValue=""
        rules={{ required: true }}
      />
      {errors.lastName && <Text>This is required.</Text>}

      <Button onPress={handleSubmit(onSubmit)}>Submit</Button>
    </View>
  );
}

