
function include(file) {
    var script  = document.createElement('script');
    script.src  = file;
    script.type = 'text/javascript';
    script.defer = true;
    document.getElementsByTagName('head').item(0).appendChild(script);
  }
    
include('background-scripts/VaccineNotifier.js');
include('background-scripts/SlotProcessor.js');

console.log("Extension is playing");
window.onload = function () {
    checkIfScriptAlreadyRunning();
    document.getElementById("submit").onclick = submitValue;
    document.getElementById("pin").onchange = validateInput;
    
}

function validateInput() {
    var pinCode = document.getElementById("pin").value;
    if(pinCode && pinCode.length==6) {
        document.getElementById("submit").disabled = false;
    } else {
        document.getElementById("submit").disabled = true;
    }
}

function submitValue() {
    var button = document.getElementById("submit").textContent;
    if(button == "Submit") {
        triggerSlotCheckingScript();
    } else {
        stopSlotCheckingScript();
    }

}

function triggerSlotCheckingScript() {
    var pinCode = document.getElementById("pin").value;
    if(pinCode && pinCode.length==6) {
        setAlarmListenerForSlots();
        storeOnLocalStorage(pinCode);
        getVaccineSlots(pinCode);
        loadRunningScriptView(pinCode);
    } else {
        alert("Invalid pincode");
    }
}

function stopSlotCheckingScript() {
    clearLocalStorage();
    document.getElementById("info").style.display="none";
    document.getElementById("title").style.display = "block";
    document.getElementById("submit").innerHTML = "Submit";
    document.getElementById("pin").value = "";
    document.getElementById("pin").disabled=false;
}

function checkIfScriptAlreadyRunning() {
    getFromLocalStorage('pincode').then((pin)=> {
        if(pin) {
            loadRunningScriptView(pin);
        } else {
            document.getElementById("info").style.display="none";
            console.log('No pin code saved');
        }
    });
}

function loadRunningScriptView(pin) {
    document.getElementById("info").style.display="block";
    document.getElementById("title").style.display = "none";
    document.getElementById("submit").innerHTML = "Stop";
    document.getElementById("pin").value = pin;
    document.getElementById("pin").disabled=true;
}

function storeOnLocalStorage(pin) {
    chrome.storage.local.set({'pincode': pin}, () => {
        if (chrome.runtime.lastError)
            console.log('Error setting');
    
        console.log('Stored name: ' + pin);
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






    
