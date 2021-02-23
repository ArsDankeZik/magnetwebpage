
var conn = null;
var ready = null;

function initialize() {
    // Create own peer object with connection to shared PeerJS server
    peer = new Peer(null, {
        debug: 2
    });

    peer.on('open', function (id) {
        // Workaround for peer.reconnect deleting previous id
        if (peer.id === null) {
            console.log('Received null id from peer open');
            peer.id = lastPeerId;
        } else {
            lastPeerId = peer.id;
        }

        console.log('ID: ' + peer.id);
    });
    peer.on('connection', function (c) {
        // Allow only a single connection
        if (conn && conn.open) {
            c.on('open', function () {
                c.send("Already connected to another client");
                setTimeout(function () {
                    c.close();
                }, 500);
            });
            return;
        }

        conn = c;
        console.log("Connected to: " + conn.peer);
        ready();
    });
    peer.on('disconnected', function () {
        console.log('Connection lost. Please reconnect');

        // Workaround for peer.reconnect deleting previous id
        peer.id = lastPeerId;
        peer._lastServerId = lastPeerId;
        peer.reconnect();
    });
    peer.on('close', function () {
        conn = null;
        console.log('Connection destroyed');
    });
    peer.on('error', function (err) {
        console.log(err);
        alert('' + err);
    });
};


function join(id) {
    // Close old connection
    if (conn) {
        conn.close();
    }

    // Create connection to destination peer specified in the input field
    conn = peer.connect(id, {
        reliable: true
    });

    conn.on('open', function () {
        console.log("Connected to: " + conn.peer);

        // Check URL params for comamnds that should be sent immediately
        var command = getUrlParam("command");
        if (command)
            conn.send(command);
    });
    // Handle incoming data (messages only since this is the signal sender)
    conn.on('data', function (data) {
        console.log('Peer: ' + data);
    });
    conn.on('close', function () {
        console.log('Connection closed!');
    });
};

function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null)
        return null;
    else
        return results[1];
};

function ready() {
    conn.on('data', function (data) {
        console.log("Data recieved");
        switch (data) {
            case 'Go':
                addMessage(data);
                break;
            case 'Fade':
                addMessage(data);
                break;
            case 'Off':
                addMessage(data);
                break;
            case 'Reset':
                addMessage(data);
                break;
            default:
                addMessage(data);
                break;
        };
    });
    conn.on('close', function () {
        console.log("Connection reset\nAwaiting connection...");
        conn = null;
    });
}

function addMessage(msg) {
    var now = new Date();
    var h = now.getHours();
    var m = addZero(now.getMinutes());
    var s = addZero(now.getSeconds());

    if (h > 12)
        h -= 12;
    else if (h === 0)
        h = 12;

    function addZero(t) {
        if (t < 10)
            t = "0" + t;
        return t;
    };

    console.log(h + ":" + m + ":" + s + msg);
}

function signal(sigName) {
    if (conn && conn.open) {
        conn.send(sigName);
        console.log(sigName + " signal sent");
        addMessage(sigName);
    } else {
        console.log('Connection is closed');
    }
}


function chat(msg){
    if (conn && conn.open) {
        conn.send(msg);
        console.log("Sent: " + msg)
        addMessage(msg);
    } else {
        console.log('Connection is closed');
    }
}