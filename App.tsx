import React, { Component } from "react";
import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function MyWeb() {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<WebView source={{ uri: "https://betaapi.dtsanalpos.com/payment" }} />
		</SafeAreaView>
	);
}
