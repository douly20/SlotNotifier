class VaccineNotifier{

     constructor(msg) {
        chrome.notifications.create(
            'id001',
            {
                type:'basic',
                iconUrl:"notify.png",
                title : "Vaccine slots available",
                message: msg,
                priority:2,
                requireInteraction:true,
                buttons:[{
                    title:'Check Details'
                        },
                        {
                            title:'Ok'
                        }
                ],
                isClickable: true
                
            },
            function() {
                console.log(chrome.runtime.lastError);
            }
        );
        this.audioNotification();
        this.addListener();
        
     }

     audioNotification(){
        var yourSound = new Audio('goes-without-saying-608.mp3');
        yourSound.play();
    }

    addListener() {
        chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
            if (btnIdx === 0) {
                window.open('https://www.cowin.gov.in/home');
            }
        });
    }

}
