import React from "react";
import {
	StyleSheet,
	SafeAreaView,
	Alert,
	Platform,
	Linking,
} from "react-native";
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
		Alert.alert("Yeni sürüm", "Uygulama için yeni sürüm mevcut", [
			{
				text: "Sonra güncelle",
				onPress: () => console.log("Canceled update"),
				style: "cancel",
			},
			{
				text: "Şimdi güncelle",
				onPress: () =>
					Linking.openURL(
						"https://apps.apple.com/tr/app/dtsanalpos/id6446242806?l=tr",
					),
			},
		]);
	}, [latestVersion]);

	const handleNavigationStateChange = async () => {
		const webViewScript = `(function() {window.ReactNativeWebView.postMessage(document.cookie);})();`;
		webViewRef.current?.injectJavaScript(webViewScript);
	};

	const handleWebViewError = () => {
		webViewRef.current?.injectJavaScript(`
		document.cookie.split(';').forEach(function(c) {
			document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
		});
		`);
		webViewRef.current?.injectJavaScript(`
		window.location.href = 'https://dtsanalpos.com';
		  `);
	};

	return (
		<>
			<SafeAreaView style={styles.container}>
				<StatusBar
					backgroundColor="#7256E9"
					hidden
					showHideTransition="slide"
					animated
				/>
				{cookieString && (
					<WebView
						ref={webViewRef}
						sharedCookiesEnabled={true}
						mixedContentMode="always"
						source={{ uri: "https://dtsanalpos.com" }}
						onMessage={handleWebViewLoad}
						onNavigationStateChange={handleNavigationStateChange}
						onShouldStartLoadWithRequest={() => true}
						injectedJavaScriptBeforeContentLoaded={setWebViewCookieString}
						onError={handleWebViewError}
					/>
				)}
			</SafeAreaView>
		</>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#7256E9",
	},
});

export default MyWebView;
