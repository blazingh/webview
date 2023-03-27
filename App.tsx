import React from "react";
import { StyleSheet, SafeAreaView, Text, Alert, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import * as Application from "expo-application";
import { useEffect } from "react";

const MyWebView = () => {
	const webViewRef = React.useRef<WebView>(null);
	const [cookieString, setCookieString] = React.useState<any>(null);
	const [latestVersion, setLatestVersion] = React.useState<any>(null);

	const handleWebViewLoad = (event: WebViewMessageEvent) => {
		AsyncStorage.setItem("cookies", event.nativeEvent.data);
	};

	const setWebViewCookie = async () => {
		const injectedJavaScript = `document.cookie = '${cookieString}';  true;`;
		webViewRef.current?.injectJavaScript(injectedJavaScript);
	};

	const setWebViewCookieString = `(${setWebViewCookie.toString()})();`;

	const getData = async () => {
		const value = await AsyncStorage.getItem("cookies");
		if (value) setCookieString(value);
		else setCookieString("empty");
	};

	React.useEffect(() => {
		getData();

		if (Platform.OS === "ios") {
			fetch("https://betaapi.dtsanalpos.com/latest-ios-version")
				.then((response) => response.json())
				.then((json) => {
					setLatestVersion(json.result.version);
				})
				.catch((error) => console.error(error));
		}
	}, []);

	useEffect(() => {
		if (!latestVersion) return;
		if (latestVersion === Application.nativeApplicationVersion) return;
		Alert.alert("New Version", "A new Version of the app is avaible", [
			{
				text: "Update Later",
				onPress: () => console.log("Cancel Pressed"),
				style: "cancel",
			},
			{ text: "Update", onPress: () => console.log("OK Pressed") },
		]);
	}, [latestVersion]);

	const handleNavigationStateChange = async () => {
		const webViewScript = `(function() {window.ReactNativeWebView.postMessage(document.cookie);})();`;
		webViewRef.current?.injectJavaScript(webViewScript);
	};

	return (
		<>
			<StatusBar backgroundColor="#7256E9" />
			<Text>{Application.nativeApplicationVersion}</Text>
			<Text>{latestVersion}</Text>
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
