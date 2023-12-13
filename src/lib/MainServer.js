import AsyncStorage from '@react-native-async-storage/async-storage';
import Token from './Token';

export class MainServer {
    constructor() {
        this.token = new Token();
    }

    getMainServerUrl() {
        return AsyncStorage.getItem('mainServerUrl');
    }

    async initialize() {
        this.url = await this.getMainServerUrl();
        return true;
    }

    getContentServers() {
        return new Promise((resolve, reject) => {
            this.token.validateMainToken().then(token => {
                fetch(`${this.url}/api/servers/getServers?token=${token}`).then(result => {
                    result.json().then(data => {
                        resolve(data.servers);
                    }).catch(err => {
                        reject(err);
                    });
                });
            }).catch(err => {
                reject(err);
            })
        });

    }
}