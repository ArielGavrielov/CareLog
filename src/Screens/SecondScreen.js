import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AddIcon, Button } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as DocumentPicker from 'expo-document-picker';

const upload = async () => {
  let resolve = await DocumentPicker.getDocumentAsync();
  console.log(resolve.uri);
  if(resolve.type != 'success') return;
}
const SecondScreen = ({navigation}) => {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Files Screen</Text>
          <TouchableOpacity style={style.addBottun}  onPress={() => upload()}>
            <AddIcon />
          </TouchableOpacity>
          <Button  backgroundColor= "#FFC0CB" onPress={() => navigation.goBack()}>Go Back</Button>
        </View> 
      );
}

const style = StyleSheet.create({
  addBottun: {
    height: 50,
    width: 50,
    borderRadius:50,
    backgroundColor: "#FFC0CB",
    alignItems:'center',
    justifyContent:'center',
  }
})

export default SecondScreen;