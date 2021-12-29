import React, { useEffect, useRef } from 'react';
import { Button, TextInput, View, Text, StyleSheet, TouchableHighlight, FlatList } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ContentServerButton } from '../../components/ContentServerButton';
import { Layout } from '../../components/setup/Layout';
import { MainServer } from '../../lib/MainServer';
import {ContentServer} from '../../lib/ContentServer';

export const ContentServerSetup = ({ navigation }) => {

    const [servers, setServers] = React.useState([]);
    const [error, setError] = React.useState('');
    const mainServer = new MainServer();
    const contentServer = new ContentServer();

    useEffect(() => {
        mainServer.initialize().then(() => {
            setError("")
            mainServer.getContentServers().then(result => {
                setServers(result);
            }).catch(err => {
                console.log(err);
                setError(err.message);
            });
        });
    }, []);

    const selectServer = (id) => {
        for (const server of servers) {
            if (server.server_id == id) {
                contentServer.requestAccessToServer(server.server_ip).then(result => {
                    if (result.status == "success") {
                        contentServer.saveContentServer(result.token, result.validTo, server.server_id, server.server_ip);
                        navigation.navigate('Main');
                    } else {
                        setError(result.error);
                    }
                }).catch(err => {
                    console.log("error")
                    console.log(err);
                    setError(err.message);
                });
                break;
            }
        }
    }

    const renderItem = ({ item }) => {
        return (
            <ContentServerButton
                server_name={item.server_name}
                server_ip={item.server_ip}
                id={item.server_id}
                onSelect={(id) => {
                    selectServer(id);
                }}
            />
        );
    };

    const resetError = () => {
        setError('');
    };

    return (
        <Layout title="Content Server" description="Please choose a content server">
            <FlatList
                data={servers}
                renderItem={renderItem}
                keyExtractor={item => item.server_id}
            />
            
            <Text style={styles.error}>{error}</Text>
        </Layout>

    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#191919',
        marginVertical: 8,
        marginHorizontal: 16,
        paddingHorizontal: 30,
        paddingVertical: 5,
        borderRadius: 10
    },
    itemTitle: {
        fontSize: 20,
        color: 'white'
    },
    itemIp: {
        fontSize: 12,
        color: 'whitesmoke'
    },
    error: {
        color: 'red',
        marginLeft: 32,
        marginRight: 32,
        marginTop: 32
    }
})