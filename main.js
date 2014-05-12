// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


var hostName = "com.google.chrome.node.sample",
	port,
	requestTime,
	elements = {
		connectButton: 0,
		disconnectButton: 0,
		sendButton: 0,
		postButton: 0,
		inputText: 0,
		response: 0
	},
	now = function(){
		var n = new Date(),
			fmt2 = function(n){return (n < 10 ? '0' : '') + n;},
			fmt3 = function(n){return (n < 100 ? '0' : '') + (n < 10 ? '0' : '') + n;};
		return "<span class='time'>"
			+ fmt2(n.getHours())
			+ ':' + fmt2(n.getMinutes())
			+ ':' + fmt2(n.getSeconds())
			+ ':' + fmt3(n.getMilliseconds())
			+ '</span> ';
	},
	appendMessage = function(text) {
		elements.response.innerHTML += "<p>" + now() + text + "</p>";
	},
	swapClassNames = function(element, addClassName, removeClassName){
		var classNames = element.className.split(/\s+/),
			removeIndex = classNames.indexOf(removeClassName);
		if (classNames.indexOf(addClassName) === -1){
			classNames.push(addClassName);
		}
		if (removeIndex !== -1){
			classNames.splice(removeIndex, 1);
		}
		element.className = classNames.join(' ');
	},
	showElement = function(element, state){
		swapClassNames(element, state ? 'show' : 'hide', state ? 'hide' : 'show');
	},
	updateUiState = function() {
		var isConnected = !!port;
		showElement(elements.connectButton, !isConnected);
		showElement(elements.disconnectButton, isConnected);
		showElement(elements.sendButton, true);
		showElement(elements.postButton, isConnected);
		elements.inputText.focus();
	},
	postMessage = function() {
		var value = elements.inputText.value,
			message = {"post": value};
		if (value){
			appendMessage("Posting message: <b>" + JSON.stringify(message) + "</b>");
			requestTime = new Date();
			port.postMessage(message);
			elements.inputText.value = '';
			elements.inputText.focus();
		}
	},
	sendNativeCallback = function(response){
		var delta = new Date().getTime() - requestTime.getTime();
		if (arguments.length === 0){
			appendMessage("Failed to connect: <b>" + chrome.runtime.lastError.message + '</b>' + ' (' + delta + 'ms)');
		}else{
			appendMessage("Response message: <b>" + JSON.stringify(response) + "</b>" + ' (' + delta + 'ms)');
		}
	},
	sendNativeMessage = function(){
		var value = elements.inputText.value,
			message = {"send": value};
		if (value){
			appendMessage("Sending message: <b>" + JSON.stringify(message) + "</b>");
			requestTime = new Date();
			chrome.runtime.sendNativeMessage(hostName, message, sendNativeCallback);
			elements.inputText.value = '';
			elements.inputText.focus();
		}
	},
	sendOnEnter = function(e){
		var key = e.keyCode || e.which;
		if (key === 13){
			port ? postMessage() : sendNativeMessage();
		}
	},
	onNativeMessage = function(message) {
		var delta = new Date().getTime() - requestTime.getTime();
		console.log(message);
		appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>" + ' (' + delta + 'ms)');
	},
	onDisconnected = function() {
		var delta = new Date().getTime() - requestTime.getTime();
		console.dir(chrome.runtime.lastError);
		appendMessage("Failed to connect: <b>" + chrome.runtime.lastError.message + '</b>' + ' (' + delta + 'ms)');
		port = null;
		updateUiState();
	}
	connect = function() {
		if (!port){
			appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
			requestTime = new Date();
			port = chrome.extension.connectNative(hostName);
			var delta = new Date().getTime() - requestTime.getTime();

			port.onMessage.addListener(onNativeMessage);
			port.onDisconnect.addListener(onDisconnected);

			appendMessage("Completed connecting to native messaging host <b>" + hostName + "</b>" + ' (' + delta + 'ms)');
			sendNativeMessage("Hi");

			updateUiState();
		}
	},
	disconnect = function(){
		if (port){
			appendMessage('Disconnecting from native messaging host <b>' + hostName + '</b>');
			port.disconnect();
			port = null;
			updateUiState();
		}
	},
	resolveElements = function(elements){
		for (var p in elements){
			if (elements.hasOwnProperty(p)){
				elements[p] = document.getElementById(p);
			}
		}
		return elements;
	},
	loadMe = function () {
		resolveElements(elements);
		elements.connectButtonParent = elements.connectButton.parentNode;
		elements.inputTextParent = elements.inputText.parentNode;

		elements.connectButton.addEventListener('click', connect);
		elements.disconnectButton.addEventListener('click', disconnect);
		elements.postButton.addEventListener('click', postMessage);
		elements.sendButton.addEventListener('click', sendNativeMessage);
		elements.inputText.addEventListener('keypress', sendOnEnter);

		updateUiState();
	},
	init = function(){
		document.addEventListener('DOMContentLoaded', loadMe);
	};

init();
