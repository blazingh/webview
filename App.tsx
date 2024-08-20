import React from "react";
import {
	StyleSheet,
	SafeAreaView,
	View,
	ActivityIndicator,
	ImageBackground,
} from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "react-native";
const spalshscrenn = require("./assets/splash.jpg");

const MyWebView = () => {
	const webViewRef = React.useRef<WebView>(null);
	const [cookieString, setCookieString] = React.useState<any>(null);

	const [loaded, setLoaded] = React.useState<boolean>(false);

	const [visibleLoading, setVisibleLoading] = React.useState<boolean>(false);

	const setWebViewCookie = async () => {
		const injectedJavaScript = `
		(function() {
		document.cookie = '${cookieString}';
		localStorage.setItem('cookiePopupClosed', 'true')
		;})();
		`;
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
	}, []);

	const handleNavigationStateChange = async (navState: any) => {
		const webViewScript = `(function() {window.ReactNativeWebView.postMessage(document.cookie);})();`;
		webViewRef.current?.injectJavaScript(webViewScript);
	};

	const handleOnLoad = () => {
		setLocalStorage();
	};

	const handleOnLoadEnd = () => {
		setVisibleLoading(false);
		setLocalStorage();
		setLoaded(true);
	};

	const setLocalStorage = () => {
		const myData = {
			key: "cookiePopupClosed",
			value: "true",
		};

		const jsCode = `
		(function() {localStorage.setItem('${myData.key}', '${myData.value}');})();
    `;

		webViewRef.current?.injectJavaScript(jsCode);
	};

	const handleWebViewError = () => {
		webViewRef.current?.injectJavaScript(`
		(function() {
		window.location.href = 'https://dtsanalpos.com';
		document.cookie.split(';').forEach(function(c) {
			document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
		})
		;})();
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
						<View style={loaded ? styles.loading : styles.loadingNoBg}>
							<ActivityIndicator size="large" color="#0000ff" />
						</View>
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
							source={{ uri: "https://distedavim.com" }}
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
	loadingNoBg: {
		height: "100%",
		width: "100%",
		position: "absolute",
		top: 0,
		left: 0,
		backgroundColor: "rgba(0,0,0,0)",
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
