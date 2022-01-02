import * as SecureStore from 'expo-secure-store';


export default class Token {
    saveToken(accessToken, refreshToken, validTo) {
        validTo = validTo.toString();
        SecureStore.setItemAsync('accessToken', accessToken);
        SecureStore.setItemAsync('refreshToken', refreshToken);
        SecureStore.setItemAsync('validTo', validTo);
    }

    saveContentToken(accessToken, validTo) {
        validTo = validTo.toString();
        SecureStore.setItemAsync('contentAccessToken', accessToken);
        SecureStore.setItemAsync('contentValidTo', validTo);
    }

    saveMainServerUrl(url) {
        SecureStore.setItemAsync('mainServerUrl', url);
    }

    getMainServerUrl() {
        return SecureStore.getItemAsync('mainServerUrl');
    }


    async isMainTokenValid() {
        const validTo = await SecureStore.getItemAsync('validTo');
        const now = new Date().getTime() / 1000;
        return parseInt(validTo) > now;
    }

    async isContentTokenValid(validTo) {
        if (validTo == undefined) {
            validTo = await SecureStore.getItemAsync('contentValidTo');
        }
        const now = new Date().getTime() / 1000;
        return parseInt(validTo) > now;
    }


    validateMainToken() {
        return new Promise((resolve, reject) => {
            const accessToken = SecureStore.getItemAsync('accessToken');
            const refreshToken = SecureStore.getItemAsync('refreshToken');
            const validTo = SecureStore.getItemAsync('validTo');
    
            if (accessToken && refreshToken && validTo) {
                this.isMainTokenValid().then(valid => {
                    if (valid) {
                        resolve(accessToken);
                    } else {
                        console.log("Token expired");
                        // TODO: Refresh token
                        reject('Token expired');
                    }
                });
            } else {
                console.log("No token");
                reject('No token');
            }
        });
    }

    validateContentToken() {
        return new Promise((resolve, reject) => {
            Promise.all([
                SecureStore.getItemAsync('contentAccessToken'),
                SecureStore.getItemAsync('contentValidTo')
            ]).then(([accessToken, validTo]) => {
                if (accessToken && validTo) {
                    if (this.isContentTokenValid(validTo)) {
                        resolve(accessToken);
                    } else {
                        // TODO: Refresh token
                        reject('Token expired');
                    }
                } else {
                    reject('No token');
                }
            });
    

        });
    }
}