import React, { useState } from 'react';
import { Card, ListItem, Button, Icon, CheckBox, Text } from 'react-native-elements';


const List = ({title, items}) => {
    const [values, setValues] = useState(items);
    console.log(values);
    return (
        <Card>
            <Card.Title>{title}</Card.Title>
            <Card.Divider color = '#FFC0CB'/>
            {
                items.map((item, i) => (
                    <ListItem key={i} bottomDivider>
                        <ListItem.Content>
                            <ListItem.CheckBox 
                                title={item.title}
                                checked={item.checked}
                                onPress={
                                    () => {
                                        item.checked = !item.checked;
                                        setValues({...values, items})
                                    }
                                } 
                            />
                        </ListItem.Content>
                        <ListItem.Chevron />
                    </ListItem>
                ))
            }
        </Card>
    );
}

export default List;