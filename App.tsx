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
	ImageBackground,
	Text,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
import * as Application from "expo-application";
import { useEffect } from "react";
import { Svg, Path } from "react-native-svg";
import spalshscrenn from "./assets/splash.jpg";

const MyWebView = () => {
	const webViewRef = React.useRef<WebView>(null);
	const [cookieString, setCookieString] = React.useState<any>(null);
	const [latestVersion, setLatestVersion] = React.useState<any>(null);

	const [visibleLoading, setVisibleLoading] = React.useState<boolean>(false);

	const [backButtonVisible, setBackButtonVsisble] =
		React.useState<boolean>(true);

	const handleOnMessage = (event: WebViewMessageEvent) => {
		if (event.nativeEvent.data === "INIT_NFC") {
			// NFC is ready to be used
			console.log("NFC is ready to be used");
		}
		AsyncStorage.setItem("cookies", event.nativeEvent.data);
	};

	const setWebViewCookie = async () => {
		const injectedJavaScript = `document.cookie = '${cookieString}';  true;`;
		webViewRef.current?.injectJavaScript(injectedJavaScript);
		const jsCode = `localStorage.setItem('cookiePopupClosed', 'true');`;
		webViewRef.current?.injectJavaScript(jsCode);
	};

	const handleNfc = (data: any) => {
		// handle NFC data here
		console.log("NFC data:", data);
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

	const handleNavigationStateChange = async (navState: any) => {
		const webViewScript = `(function() {window.ReactNativeWebView.postMessage(document.cookie);})();`;
		webViewRef.current?.injectJavaScript(webViewScript);

		// if (navState.url.includes("dtsanalpos.com")) setBackButtonVsisble(true);
		// else setBackButtonVsisble(false);
	};

	const handleOnLoad = () => {
		setLocalStorage();
	};

	const handleOnLoadEnd = () => {
		setVisibleLoading(false);
		injectNfcScript();
	};

	const injectNfcScript = () => {
		const jsCode = `
		// Find the NFC button element
		const nfcButton = document.getElementById('nfc-mobile-btn');
		
		// Create a new button element
		const button = document.createElement('button');
		
		// Set the button text and attributes
		button.innerHTML = 'Scan Card With NFC';
		button.setAttribute('type', 'button');
		
		// Add a click event listener to the button
		button.addEventListener('click', () => {
		  // Send a message back to the app
		  window.ReactNativeWebView.postMessage('INIT_NFC');
		});
		
		// Add the button to the NFC button div
		nfcButton.appendChild(button);
	  `;

		// Inject the JavaScript code into the WebView
		webViewRef.current?.injectJavaScript(jsCode);
	};

	const setLocalStorage = () => {
		const myData = {
			key: "cookiePopupClosed",
			value: "true",
		};

		const jsCode = `
      localStorage.setItem('${myData.key}', '${myData.value}');
    `;

		webViewRef.current?.injectJavaScript(jsCode);
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
				<ImageBackground
					source={spalshscrenn}
					style={styles.image}
					resizeMethod="scale"
					resizeMode="contain"
				>
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
							style={{
								backgroundColor: "transparent",
							}}
							ref={webViewRef}
							sharedCookiesEnabled={true}
							mixedContentMode="always"
							source={{ uri: "https://betaapi.dtsanalpos.com" }}
							onMessage={handleOnMessage}
							onNavigationStateChange={handleNavigationStateChange}
							onShouldStartLoadWithRequest={() => true}
							injectedJavaScriptBeforeContentLoaded={setWebViewCookieString}
							onError={handleWebViewError}
							onLoadStart={() => setVisibleLoading(true)}
							onLoadEnd={() => handleOnLoadEnd()}
							onLoad={() => handleOnLoad()}
						/>
					)}
				</ImageBackground>
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
	image: {
		flex: 1,
		resizeMode: "contain",
		justifyContent: "center",
	},
});

export default MyWebView;
