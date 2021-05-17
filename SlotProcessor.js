var slotData = '';
var reset = false;
async function getVaccineSlots(pinCode) {
    console.log("Preparing to call get vaccine slots");
    var todayDate = (new Date()).toLocaleDateString().replaceAll("/","-");
    var api = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pinCode}&date=${todayDate}`;  
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(api, requestOptions)
    .then(response => response.text())
    .then(result => processVaccineData(result))
    .catch(error => console.log('error', error));
    // await new Promise(resolve => setTimeout(resolve, 30000));
    
}

chrome.alarms.onAlarm.addListener((alarm) => {
    console.log(alarm.name); // refresh
    getFromLocalStorage('pincode').then((pin)=> {
        console.log('pin received s',pin);
        if(pin) {
            getVaccineSlots(pin);
        } else {
            console.log('No pin code saved');
        }
    });
    
  });

function processVaccineData(data) {
    let availableSlots=[];
    let centersMap = new Map();
    data = JSON.parse(data);
    if(data && data.centers) {
    for(let center of data.centers) {
        if(center && center.sessions) {
            for(let session of center.sessions) {
                if(session!=null && session['min_age_limit']==18 && session['available_capacity'] > 0) {
                    availableSlots.push({address:center.address,slots:session['available_capacity'],vaccine:session.vaccine,date:session.date});
                }
            }
            if(availableSlots.length!=0) {
                totalSlots = availableSlots.reduce(getSum,0);
                centersMap.set(center.name,{slots:parseInt(totalSlots),value:availableSlots});
                availableSlots=[];
            }
        }
    }
    notifyUser(centersMap);
    }
}

function notifyUser(centersMap) {
    console.log(centersMap);
    //send notifications only if data available or if data has changed since previous notification
    if(centersMap.size>0 && compareIfSlotDataHasChanged(centersMap)) {
        var centreList = "\n";
        centersMap.forEach((b,a)=>centreList+=a+" : "+b.slots+"\n");
        var msg = 'Vaccine Slots Are Currently Available In '+centersMap.size+' CENTERS :'+centreList;
        var s = new VaccineNotifier(msg);
    }
   
}

function compareIfSlotDataHasChanged(data) {
    var isChange = true;
    if(slotData && slotData.size==data.size) {
        isChange = !isDataOfAllKeysSame(slotData,data);
    }
    slotData = data;
    return isChange;
}

function isDataOfAllKeysSame(oldMap,newMap) {
    for(var[key,val] of newMap) {
        if(!oldMap.has(key) || !isCentresDataSame(oldMap.get(key),val))
            return false;
    }
    return true;
}

function isCentresDataSame(oldObj,newObj) {
    if(oldObj.value.length != newObj.value.length)
    return true;
    for(let i=0;i<newObj.length;i++) {
        if(oldObj.value[i].date!=newObj.value[i].date || oldObj.value[i].slots!==newObj.value[i].slots )
          return false;
    }
    return true;
}

function getSum(total, num) {
    return total + num.slots;
}

async function getFromLocalStorage(key) {
    return new Promise((resolve,reject)=>{
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError)
                reject('Error getting');
        
            console.log('Retrieved name: ', result.pincode);
            resolve(result.pincode);
        });
    }); 
}