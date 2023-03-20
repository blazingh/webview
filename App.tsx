import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";

const MyWebView = () => {
	const webViewRef = React.useRef<WebView>(null);
	const [cookieString, setCookieString] = React.useState<any>(null);

	const handleWebViewLoad = (event: WebViewMessageEvent) => {
		AsyncStorage.setItem("cookies", event.nativeEvent.data);
	};

	const setWebViewCookie = async () => {
		const injectedJavaScript = `document.cookie = '${cookieString}';  true;`;
		webViewRef.current?.injectJavaScript(injectedJavaScript);
	};

	const setWebViewCookieString = `(${setWebViewCookie.toString()})();`;

	const getData = async () => {
		// await AsyncStorage.setItem("cookies", "");
		const value = await AsyncStorage.getItem("cookies");
		if (value) setCookieString(value);
		else setCookieString("empty");
	};

	React.useEffect(() => {
		getData();
		AsyncStorage.setItem("cookies", "");
	}, []);

	const handleNavigationStateChange = async () => {
		const webViewScript = `(function() {window.ReactNativeWebView.postMessage(document.cookie);})();`;
		webViewRef.current?.injectJavaScript(webViewScript);
	};

	return (
		<>
			<StatusBar backgroundColor="#7256E9" />
			<SafeAreaView style={styles.container}>
				{cookieString && (
					<WebView
						sharedCookiesEnabled={true}
						mixedContentMode="always"
						ref={webViewRef}
						source={{ uri: "https://dtsanalpos.com/payment" }}
						onMessage={handleWebViewLoad}
						onNavigationStateChange={handleNavigationStateChange}
						onShouldStartLoadWithRequest={() => true}
						injectedJavaScriptBeforeContentLoaded={setWebViewCookieString}
					/>
				)}
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default MyWebView;
