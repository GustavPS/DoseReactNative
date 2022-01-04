import * as SecureStore from 'expo-secure-store';

import { Mutex } from 'async-mutex';
const mutex = new Mutex();

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

    async isMainTokenStored() {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const validTo = await SecureStore.getItemAsync('validTo');
        return accessToken && refreshToken && validTo;
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

    refreshMainToken() {
        return new Promise((resolve, reject) => {
            Promise.all([
                SecureStore.getItemAsync('accessToken'),
                SecureStore.getItemAsync('refreshToken'),
                SecureStore.getItemAsync('validTo'),
                SecureStore.getItemAsync('mainServerUrl')
            ]).then(([accessToken, refreshToken, validTo, mainServerUrl]) => {
                if (refreshToken && accessToken && validTo && mainServerUrl) {
                    const url = `${mainServerUrl}/api/auth/refreshToken`;
                    const data = {
                        refreshToken: refreshToken,
                        token: accessToken
                    };
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    }).then(response => {
                        response.json().then(json => {
                            if (json.status == 'success') {
                                this.saveToken(json.token, json.refreshToken, json.validTo);
                                console.log('Main token refreshed!');
                                resolve(json.token);
                            } else {
                                reject(json.message);
                            }
                        }).catch(err => {
                            console.log(err);
                            reject(err);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('No token');
                }
            }).catch(err => {
                console.log(`Couldn't load tokens: ${err}`);
                reject(err);
            });

        });
    }

    refreshContentToken() {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.validateMainToken(),
                SecureStore.getItemAsync('contentServerUrl')
            ]).then(([token, contentServerUrl]) => {
                const url = `${contentServerUrl}/api/auth/validate`
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: token
                    })
                }).then(result => {
                    result.json().then(data => {
                        this.saveContentToken(data.token, data.validTo);
                        resolve(data.token);
                    }).catch(err => {
                        reject(err);
                    });
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                console.log(err);
                reject(err);
            });


        });
    }

    validateMainToken() {
        return new Promise((resolve, reject) => {
            Promise.all([
                SecureStore.getItemAsync('accessToken'),
                SecureStore.getItemAsync('refreshToken'),
                SecureStore.getItemAsync('validTo')
            ]).then(([accessToken, refreshToken, validTo]) => {
                if (accessToken && refreshToken && validTo) {
                    this.isMainTokenValid().then(valid => {
                        if (valid) {
                            resolve(accessToken);
                        } else {
                            this.refreshMainToken().then(token => {
                                resolve(token);
                            }).catch(err => {
                                console.log(err);
                                console.log("Refreshing main token failed");
                                reject(err);
                            });
                        }
                    });
                } else {
                    console.log("No token");
                    reject('No token');
                }
            }).catch(err => {
                console.log(`Couldn't load tokens: ${err}`);
                reject("No token");
            });
        });
    }

    validateContentToken() {
        return new Promise((resolve, reject) => {
            mutex.acquire().then(async (release) => {
                Promise.all([
                    SecureStore.getItemAsync('contentAccessToken'),
                    SecureStore.getItemAsync('contentValidTo')
                ]).then(([accessToken, validTo]) => {
                    if (accessToken && validTo) {
                        this.isContentTokenValid(validTo).then(valid => {
                            if (valid) {
                                release();
                                resolve(accessToken);
                            } else {
                                this.refreshContentToken().then(token => {
                                    console.log("Content token refreshed!");
                                    release();
                                    resolve(token);
                                }).catch(err => {
                                    console.log(err);
                                    console.log("Refreshing content token failed");
                                    release();
                                    reject(err);
                                });
                            }
                        });
                    } else {
                        release();
                        reject('No token');
                    }
                });
            });
        });
    }
}