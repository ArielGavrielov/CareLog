import React from 'react';
import Modal from 'react-native-modal';
import { View } from 'react-native';
import { Button } from 'react-native-elements';

const ModalWithX = (params) => {
    return (
    <Modal {...params}>
        <View style={{backgroundColor:"white", justifyContent: 'center', alignItems: 'center', padding: 10, borderRadius: 10, minHeight: 30}}>
            <Button
                buttonStyle={{backgroundColor: '#ff0000', borderRadius: 25, width: 25, height: 25, padding: 1, margin: 1}}
                containerStyle={{position: 'absolute', top: 0, right: 0}}
                onPress={() => params.onRequestClose()}
                icon={{name: 'x', type: 'feather', color: 'white', size: 14}}
                iconPosition='left'
            />
            {params.children}
        </View>
    </Modal>)
}

export default ModalWithX;