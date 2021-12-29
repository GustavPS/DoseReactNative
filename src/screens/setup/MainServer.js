import React, { useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Layout } from '../../components/setup/Layout';
import Token from '../../lib/Token';

export const MainServer = ({ navigation }) => {
    const textInputRef = useRef();

    const [url, setUrl] = React.useState('');
    const [error, setError] = React.useState('');

    const resetError = () => {
        setError('');
    };

    const saveUrl = async (url) => {
        const token = new Token();
        token.saveMainServerUrl(url);
    };

    const onSubmit = () => {
        const _url = `${url}/api/ping`;
        fetch(_url).then(async (result) => {
            resetError();
            saveUrl(url);
            navigation.navigate('Connect');
        }).catch(err => {
            console.log(err);
            setError(err.message);
        });
    };

    return (
        <Layout title="Main Server" description="Enter the url of the main server">
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
                    placeholder="Enter URL"
                    ref={textInputRef}
                    onChangeText={(text) => {
                        setUrl(text);
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