import React, { useRef, useEffect} from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Layout } from '../../components/setup/Layout';
import Token from '../../lib/Token';
import QRCode from 'react-native-qrcode-svg';

export const MainServer = ({ navigation }) => {
    const textInputRef = useRef();

    const [url, setUrl] = React.useState('');
    const [error, setError] = React.useState('');
    const [code, setCode] = React.useState('A54FB33Z');
    let startedInterval = false;

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

    const newCode = () => {
        const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        let result = '';
        const charactersLength = characters.length;
        for ( let i = 0; i < 8; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        setCode(result.toUpperCase())
    }

    useEffect(() => {
        if (!startedInterval) {
            setInterval(() => newCode(), 2000);
            startedInterval = true;
        }

    }, [startedInterval]);


    return (
        <Layout title="Main Server" description="Enter the url of the main server">
            <View style={styles.header}>
                <Text style={{ color: 'white', fontSize: 24}}>Login to choose your content server!</Text>
            </View>
            <View style={styles.wrapper}>
                <View style={styles.inner}>
                    <Text style={styles.text}>1. Go to <Text style={styles.linkText}>https://app.doose.media/connect</Text></Text>
                    <Text style={styles.text}>2. Enter code <Text style={styles.codeText}>{code}</Text> to authorize this device</Text>
                </View>
                <View style={styles.inner}>
                    <View  style={styles.textContainer}>
                        <Text style={styles.text}>Scan QRcode to login!</Text>
                    </View>
                    <View style={{ borderColor: 'white', borderWidth: 5}}>
                        <QRCode
                            value={`https://app.doose.media/connect?code=${code}`}
                        />
                    </View>
                </View>
            </View>
            <View style={styles.mainServerButton}>
                <Button

                    title="Other main server"
                    onPress={onSubmit}
                />
            </View>
        
            <Text style={styles.error}>{error}</Text>
        </Layout>

    );
};

const styles = StyleSheet.create({
    header: {
        marginTop: 50,
        position: 'absolute',
        top: 0,
    },
    wrapper: {
        flex:1,
        display: 'flex',
        flexDirection: 'row',
    },
    inner: {
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        marginBottom: 10,
        width: 140
    },
    text: {
        color: 'white'
    },
    linkText: {
        color: 'blue'
    },
    codeText: {
        color: 'orange',
        textDecorationLine: 'underline' 
    },
    mainServerButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        margin: 10
    }
})