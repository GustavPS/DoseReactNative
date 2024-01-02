
import React, { useEffect, useState} from 'react';
import { View, Text, StyleSheet, TVEventHandler, TouchableOpacity } from 'react-native';

export default LongPressOverlay = (props, ref) => {
        const title = 'Long press to add to favorites';
        const [visible, setVisible] = useState(false);
        
        tvEventHandler = new TVEventHandler();
        

        useEffect(() => {
            enableTvEventHandler();
        }, []);

        const enableTvEventHandler = () => {
            console.log('[LONGPRESS] Enabled longpress event handler');
            tvEventHandler.enable(this, (_cmp, event) => {
                console.log(event);
                if (event.eventKeyAction === 1) {
                    if (event && event.eventType === 'longSelect') {
                        console.log('[LONGPRESS] Long press detected');
                        //setVisible(true);
                    } 
                }
            });
        };

        return (
            <>
                {visible && 
                    <View style={styles.container}>
                            <View>
                                    <Text style={styles.title}>{title}</Text>
                            </View>
                    </View>
                }
            </>


        );
};

    /**
     * Enable the tv event handlers (button presses)
     */


const styles = StyleSheet.create({
        container: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 100,
        },
        title: {
                fontSize: 20,
                textAlign: 'center',
                color: 'white',
                textTransform: 'uppercase',
                marginTop: 5,
                marginBottom: 5
        }
})