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
    addEventHandlersToDOM();
    checkIfScriptAlreadyRunningAndLoadView();
}

function addEventHandlersToDOM() {
    document.getElementById("submit").onclick = onSubmitValue;
    Array.prototype.forEach.call(document.getElementsByClassName("radiobtn"), function(el) {
        el.addEventListener('click', handleAgeSelectEvent, false);
    });
}

function checkIfScriptAlreadyRunningAndLoadView() {
    getUserDataFromLocalStorage().then((data) => {
        if (data) {
            loadAlreadyRunningScriptView(data);
        } else {
            loadCheckVaccineSlotsView();      
        }
    });
}

function onSubmitValue() {
    let buttonText = document.getElementById("submit").textContent;
    if (buttonText == "Submit") {
        triggerSlotCheckingScript();
    } else {
        stopSlotCheckingScript();
    }
}

function triggerSlotCheckingScript() {
    let pinCode = document.getElementById("pin").value;
    let age = document.getElementById("18plus").checked == true ? 18 : 45;
    let userData = {pin:pinCode,age:age};
    if (pinCode && pinCode.length == 6) {
        setAlarmListenerForSlots();
        storeUserDataOnLocalStorage(userData);
        getVaccineSlots(userData);
        loadAlreadyRunningScriptView(userData);
    } else {
        alert("Invalid pincode");
    }
}

function stopSlotCheckingScript() {
    clearAlarmListenerForSlots();
    clearLocalStorage();
    loadCheckVaccineSlotsView();
}

function loadCheckVaccineSlotsView() {
    setDisplayStylesForHtmlElementsByClass("create","block");
    setDisplayStylesForHtmlElementsByClass("view","none");
    document.getElementById("submit").innerHTML = "Submit";
    document.getElementById("pin").value = "";
    document.getElementById("pin").disabled = false;
    setDisabledPropertyOfAgeGroupBtn(false);
    select18plusAgeRadioButton();
}

function loadAlreadyRunningScriptView(userData) {
    setDisplayStylesForHtmlElementsByClass("view","block");
    setDisplayStylesForHtmlElementsByClass("create","none");
    document.getElementById("submit").innerHTML = "Stop";
    document.getElementById("pin").value = userData.pin;
    document.getElementById("pin").disabled = true;
    setDisabledPropertyOfAgeGroupBtn(true);
    if(userData.age==45) {
        select45plusAgeRadioButton();
    } else {
        select18plusAgeRadioButton();
    }
}

function setDisplayStylesForHtmlElementsByClass(className,val) {
    Array.prototype.forEach.call(document.getElementsByClassName(className), function(element) {
        element.style.display=val;
    });
}

function storeUserDataOnLocalStorage(data) {
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
    chrome.alarms.clear("vaccineSlots");
}

function handleAgeSelectEvent(clickevent) {
    if(clickevent.target.id=="18plus") {
        document.getElementById("45plus").checked = false;
    } else {
        document.getElementById("18plus").checked = false;
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

function setDisabledPropertyOfAgeGroupBtn(isDisable) {
    var radioBtns = document.getElementsByClassName("radiobtn");
    Array.prototype.forEach.call(radioBtns, function(radioBtn) {
        radioBtn.disabled = isDisable;
    });
}