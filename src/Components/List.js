import React, { useState } from 'react';
import { Card, ListItem, Button, Icon, CheckBox, Text } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';


const List = ({title, items}) => {
    const [values, setValues] = useState(items);
    console.log(values);
    return (
        <Card>
            <Card.Title>{title}</Card.Title>
            <Card.Divider color = '#FFC0CB'/>
            <ScrollView nestedScrollEnabled = {true} style={{height: 100}}>
            {
                items.map((item, i) => (
                    <CheckBox 
                        key={i}
                        title={item.title}
                        checked={item.checked}
                        onPress={
                            () => {
                                item.checked = !item.checked;
                                setValues({...values, items})
                            }
                        } 
                    />
                ))
            }
            </ScrollView>
        </Card>
    );
}

export default List;