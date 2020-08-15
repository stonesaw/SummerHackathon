// Client ID and API key from the Developer Console
var CLIENT_ID = ENV_CLIENT_ID;
var API_KEY = ENV_API_KEY;

var TODO_CALENDAR_ID;
// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events";

var signoutButton = document.getElementById('signout_button');

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // // Listen for sign-in state changes.
        // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // // Handle the initial sign-in state.
        // updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        // authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;

        //initToDoCalendar();
    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
// function updateSigninStatus(isSignedIn) {
//     if (isSignedIn) {
//         authorizeButton.style.display = 'none';
//         signoutButton.style.display = 'block';
//     } else {
//         authorizeButton.style.display = 'block';
//         signoutButton.style.display = 'none';
//     }
// }

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {

    gapi.auth2.getAuthInstance().signOut().then(function (res) {
        location.href = "../../index.html";
    });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}


/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then(function (response) {
        var events = response.result.items;
        appendPre('Upcoming events:');
        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                appendPre(event.summary + ' (' + when + ')')
            }
        } else {
            appendPre('No upcoming events found.');
        }
    });
}

//送信ボタン仮
function submit() {
    var eventTitle = document.getElementById("eventTitle").value;
    var startTime = timeToISOString(document.getElementById("startTime").value);
    var endTime = timeToISOString(document.getElementById("endTime").value);
    if (eventTitle != "" && startTime != "" && endTime != "") {
        insertEvent(eventTitle, startTime, endTime);
    }
    else {
        alert("項目がたりません")
    }

}

function timeToISOString(time) {
    const words = time.split(" ");
    return words[0] + "T" + words[1] + "+09:00";

}

//ToDo出力（仮)
function printToDoList() {
    listToDoEvents().then(function (responce) {
        if (responce.length > 0) {
            for (var i in responce) {
                var when = responce[i].start.dateTime;
                if (!when) {
                    when = responce[i].start.date;
                }
                appendPre(responce[i].summary + ' (' + when + ')')
            }
        }
        else {
            appendPre("Nothing ToDo")
        }
    });
}

//ToDo_Hackathonのイベントを取得
function listToDoEvents() {
    return gapi.client.calendar.events.list({
        'calendarId': TODO_CALENDAR_ID
    }).then(function (response2) {
        var events = response2.result.items;
        return events;
    });
}

//ToDo_HackathonカレンダーのカレンダーIDを取得する。ない場合作成する
function initToDoCalendar() {
    gapi.client.calendar.calendarList.list({}).then(function (response) {
        var flag = true;
        for (var temp in response.result.items) {
            appendPre(response.result.items[temp].summary);
            if (response.result.items[temp].summary == "ToDo_Hackathon") {
                TODO_CALENDAR_ID = response.result.items[temp].id;
                flag = false;
                break
            }
        }
        if (flag) {
            if (confirm("ToDoカレンダーが見つかりませんでした。新しく作成してよろしいですか？")) {
                gapi.client.calendar.calendars.insert({
                    "resource": {
                        "summary": "ToDo_Hackathon"
                    }
                }).then(function (response) {
                    respoTODO_CALENDAR_ID = nse.id;
                });
            }
            else {
            }
        }
    });
}

///カレンダーにイベントを追加する
function insertEvent(eventTitle, startTime, endTime) {
    var event = {
        "summary": eventTitle,
        "start": {
            "dateTime": startTime
        },
        "end": {
            "dateTime": endTime
        }
    };
    var request = gapi.client.calendar.events.insert({
        'calendarId': TODO_CALENDAR_ID,
        'resource': event
    });
    request.execute(function (event) {
        appendPre('Event created: ' + event.summary);
    });
}