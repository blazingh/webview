import React from "react";
import {
	StyleSheet,
	SafeAreaView,
	Alert,
	Platform,
	Linking,
	View,
	ActivityIndicator,
	TouchableOpacity,
	Text,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import * as Application from "expo-application";
import { useEffect } from "react";
import { Svg, Path } from "react-native-svg";

const MyWebView = () => {
	const webViewRef = React.useRef<WebView>(null);
	const [cookieString, setCookieString] = React.useState<any>(null);
	const [latestVersion, setLatestVersion] = React.useState<any>(null);

	const [visibleLoading, setVisibleLoading] = React.useState<boolean>(false);

	const [backButtonVisible, setBackButtonVsisble] =
		React.useState<boolean>(false);

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

	console.log(backButtonVisible);

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

	const handleNavigationStateChange = async (navState: any) => {
		const webViewScript = `(function() {window.ReactNativeWebView.postMessage(document.cookie);})();`;
		webViewRef.current?.injectJavaScript(webViewScript);

		// if (navState.url.includes("dtsanalpos.com")) setBackButtonVsisble(true);
		// else setBackButtonVsisble(false);
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
				{visibleLoading && (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color="#0000ff" />
					</View>
				)}
				{backButtonVisible && (
					<TouchableOpacity
						style={{ position: "absolute", top: 25, left: 2, zIndex: 100 }}
						onPress={() => {
							webViewRef.current?.goBack();
						}}
					>
						<Svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							stroke="#000000"
							strokeWidth=".2"
						>
							<Path
								fill="#ffffff"
								d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
							/>
						</Svg>
					</TouchableOpacity>
				)}
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
						onLoadStart={() => setVisibleLoading(true)}
						onLoadEnd={() => setVisibleLoading(false)}
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
		position: "relative",
	},
	loading: {
		height: "100%",
		width: "100%",
		position: "absolute",
		top: 0,
		left: 0,
		backgroundColor: "rgba(0,0,0,0.2)",
		zIndex: 10,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default MyWebView;
