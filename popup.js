function include(file) {
    var script = document.createElement('script');
    script.src = file;
    script.type = 'text/javascript';
    script.defer = true;
    document.getElementsByTagName('head').item(0).appendChild(script);
}

include('background-scripts/VaccineNotifier.js');
include('background-scripts/SlotProcessor.js');

console.log("Extension is playing");
window.onload = function() {
    checkIfScriptAlreadyRunning();
    document.getElementById("submit").onclick = submitValue;
    Array.prototype.forEach.call(document.getElementsByClassName("radiobtn"), function(el) {
        el.addEventListener('click', handleAgeSelectEvent, false);
    });

}

function submitValue() {
    var button = document.getElementById("submit").textContent;
    if (button == "Submit") {
        triggerSlotCheckingScript();
        disableAgeGroupBtn();
    } else {
        stopSlotCheckingScript();
        enableAgeGroupBtn();
    }

}

function handleAgeSelectEvent(el) {
    if(el.target.id=="18plus") {
        document.getElementById("45plus").checked = false;
    } else {
        document.getElementById("18plus").checked = false;
    }
}

function triggerSlotCheckingScript() {
    let pinCode = document.getElementById("pin").value;
    let age = document.getElementById("18plus").checked == true ? 18 : 45;
    let userData = {pin:pinCode,age:age};
    if (pinCode && pinCode.length == 6) {
        setAlarmListenerForSlots();
        storeOnLocalStorage(userData);
        getVaccineSlots(userData);
        loadRunningScriptView(userData);
    } else {
        alert("Invalid pincode");
    }
}

function stopSlotCheckingScript() {
    clearLocalStorage();
    setStylesForHtmlElementsByClass("create","display","block");
    setStylesForHtmlElementsByClass("view","display","none");
    document.getElementById("submit").innerHTML = "Submit";
    document.getElementById("pin").value = "";
    document.getElementById("pin").disabled = false;
    select18plusAgeRadioButton();
}

function checkIfScriptAlreadyRunning() {
    getUserDataFromLocalStorage().then((data) => {
        if (data) {
            loadRunningScriptView(data);
        } else {
            select18plusAgeRadioButton();
            document.getElementById("info").style.display = "none";
            console.log('No pin code saved');
        }
    });
}

function loadRunningScriptView(userData) {
    setStylesForHtmlElementsByClass("view","display","block");
    setStylesForHtmlElementsByClass("create","display","none");
    document.getElementById("submit").innerHTML = "Stop";
    document.getElementById("pin").value = userData.pin;
    document.getElementById("pin").disabled = true;
    disableAgeGroupBtn();
    if(userData.age==45) {
        select45plusAgeRadioButton();
    } else {
        select18plusAgeRadioButton();
    }
}

function select18plusAgeRadioButton() {
    document.getElementById("18plus").checked = true;
    document.getElementById("45plus").checked = false;
}

function select45plusAgeRadioButton() {
    document.getElementById("18plus").checked = false;
    document.getElementById("45plus").checked = true;
}

function setStylesForHtmlElementsByClass(className,cssprop,val) {
    Array.prototype.forEach.call(document.getElementsByClassName(className), function(el) {
        el.style[cssprop]=val;
    });
}

function storeOnLocalStorage(data) {
    chrome.storage.local.set({ 'userData': data }, () => {
        if (chrome.runtime.lastError)
            console.log('Error setting');

        console.log('Stored name: ' , data);
    });
}

function clearLocalStorage() {
    chrome.storage.local.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    })
}

function setAlarmListenerForSlots() {
    console.log('Triggering the alarm for slots...');
    chrome.alarms.create('vaccineSlots', { periodInMinutes: 1 });
}

function clearAlarmListenerForSlots() {
    console.log('Clearing the alarm for slots...');
    chrome.alarms.clear("fetch");
}

function enableAgeGroupBtn() {
    var radioBtns = document.getElementsByClassName("radiobtn");
    Array.prototype.forEach.call(radioBtns, function(radioBtn) {
        radioBtn.disabled = false;
    });
}

function disableAgeGroupBtn() {
    var radioBtns = document.getElementsByClassName("radiobtn");
    Array.prototype.forEach.call(radioBtns, function(radioBtn) {
        radioBtn.disabled = true;
    });
}