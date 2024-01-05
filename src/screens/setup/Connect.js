import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Layout } from '../../components/setup/Layout';
import Token from '../../lib/Token';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const Connect = ({ navigation }) => {
    const textInputRef = useRef();
    const token = new Token();

    const [code, setCode] = React.useState('');
    const [error, setError] = React.useState('');

    const resetError = () => {
        setError('');
    };

    const saveTokens = async (data) => {
        try {
            await AsyncStorage.setItem('Tokens', JSON.stringify(data));
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    const onSubmit = async () => {
        resetError();
        const mainServer = await token.getMainServerUrl();
        const url = `${mainServer}/api/auth/tv/registerCode?code=${code}`;
        fetch(url).then(result => {
            result.json().then(data => {
                if (data.status == "success") {
                    token.saveToken(data.token, data.refreshToken, data.validTo);
                    navigation.navigate('ContentServer');
                } else {
                    setError(data.message);
                }
            }).catch(err => {
                // Could not parse response
                setError(err.message);
            });
        }).catch(err => {
            // Could not connect to server
            setError(err.message);
        })
    };

    return (
        <Layout title="Main Server" description="Enter the connect code">
            <TouchableHighlight
                onPress={() => {
                    textInputRef.current.focus();
                }}
                onFocus={() => {
                    textInputRef.current.focus();
                }}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Enter connect code"
                    ref={textInputRef}
                    onChangeText={(text) => {
                        setCode(text);
                    }}
                />
            </TouchableHighlight>
            <Button
                title="Submit"
                onPress={onSubmit}
            />
            <Text style={styles.error}>{error}</Text>
        </Layout>

    );
};

const styles = StyleSheet.create({
    about: {
        marginTop: 32,
        marginLeft: 32,
        marginRight: 32
    },
    aboutTitle: {
        color: Colors.lighter,
        fontSize: 24
    },
    aboutDescription: {
        color: Colors.lighter,
        fontSize: 12
    },

    input: {
        height: 40,
        width: 300,
        margin: 12,
        borderWidth: 1,
        borderColor: '#ababab',
        borderRadius: 5,
        padding: 5,
        color: Colors.lighter
    },
    error: {
        color: 'red',
        fontSize: 12,
    },

    veritcalDivider: {
        width: 1,
        height: '100%',
        backgroundColor: "#ababab",
    }
})