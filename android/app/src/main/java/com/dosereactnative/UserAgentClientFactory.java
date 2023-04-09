package com.dosereactnative;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import okhttp3.OkHttpClient;

public class UserAgentClientFactory implements OkHttpClientFactory {
  public OkHttpClient createNewNetworkModuleClient() {
    return new OkHttpClient.Builder()
      .cookieJar(new ReactCookieJarContainer())
      .addInterceptor(new UserAgentInterceptor())
      .build();
  }
}
