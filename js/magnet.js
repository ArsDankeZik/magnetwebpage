let t = null;
onOffNode(getSingle('#deleteButton'), false);

const announceList = [
    ['udp://tracker.leechers-paradise.org:6969'],
    ['udp://tracker.coppersurfer.tk:6969'],
    ['udp://tracker.opentrackr.org:1337'],
    ['udp://explodie.org:6969'],
    ['udp://tracker.empire-js.us:1337'],
    ['wss://tracker.btorrent.xyz'],
    ['wss://tracker.openwebtorrent.com']
];

const optionalExTrackers = [
    'wss://ws.peer.ooo:443/announce',
    'wss://video.blender.org:443/tracker/socket',
    'wss://tube.privacytools.io:443/tracker/socket',
    'wss://tracker.sloppyta.co:443/announce',
    'wss://tracker.files.fm:7073/announce',
    'wss://peertube.cpy.re:443/tracker/socket',
    'wss://open.tube:443/tracker/socket',
    'wss://hub.bugout.link:443/announce',
    'ws://tracker.sloppyta.co:80/announce',
    'ws://tracker.files.fm:7072/announce',
    'ws://tracker.btsync.cf:6969/announce',
    'ws://hub.bugout.link:80/announce',
];

(async () => {
    if (!searchIsEmpty()) {
        let searchParams = await getJSONUrl(document.location.href);
        if (has(searchParams, 'r')) {
            fmt('You are in room %', [searchParams.r], true);
            localStorage.setItem('room', searchParams.r);
            if (!localStorage.getItem('user'))
                localStorage.setItem('user', await createUser(searchParams.r));

            onOffNode(getSingle('#form-post'), false);

            if (parseInt(localStorage.getItem('user')) == 1) {
                onOffNode(getSingle('#deleteButton'), true);
                getSingle('#deleteButton').addEventListener('click', (e) => {
                    removeRoom(searchParams.r);
                });
            }

            syncPlayer();
        }
    }
})();

function onOffNode(node, bool) {
    bool ? node.style.display = 'block' : node.style.display = 'none';
}

getSingle('#form-post').addEventListener('submit', (e) => {
    e.preventDefault();
});

getSingle('#f-input').addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        createPlayer();
        try {
            cCreate(cNewClient(), e.target.value.trim());
        } catch (error) {}
        e.target.value = '';
    }
});

function createPlayer() {
    removeChildsNode(getSingle('#videoContainer'));

    let pl = create('video');
    pl.setAttribute('class', 'mt-3');
    pl.id = 'player';
    pl.crossorigin = "anonymous";
    pl.setAttribute('controls', '');
    getSingle('#videoContainer').appendChild(pl);

    const room = localStorage.getItem('room');
    const user = localStorage.getItem('user');
    let player = null;

    if (parseInt(user) != 1) {
        player = new Plyr('#player', {
            debug: false,
            captions: {
                active: true,
                update: true,
            },
            clickToPlay: false,
            controls: [
                'progress', // The progress bar and scrubber for playback and buffering
                'current-time', // The current time of playback
                'duration', // The full duration of the media
                'mute', // Toggle mute
                'volume', // Volume control
                'captions', // Toggle captions
                'pip', // Picture-in-picture (currently Safari only)
                'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
                'fullscreen', // Toggle fullscreen
            ]
        });
    } else {
        player = new Plyr('#player', {
            debug: false,
            captions: {
                active: true,
                update: true,
            },
            controls: [
                'play-large', // The large play button in the center
                'play', // Play/pause playback
                'progress', // The progress bar and scrubber for playback and buffering
                'current-time', // The current time of playback
                'duration', // The full duration of the media
                'mute', // Toggle mute
                'volume', // Volume control
                'captions', // Toggle captions
                'pip', // Picture-in-picture (currently Safari only)
                'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
                'fullscreen', // Toggle fullscreen
            ]
        });
    }

    player.on('ready', e => {
        player.poster = 'src/movietime.jpg';
    });

    player.on('seeked', e => {
        print(e.detail.plyr.currentTime);

        if (parseInt(localStorage.getItem('user')) == 1) {
            getUsers().then(nr => {
                const _nr = parseInt(nr);
                for (let i = 1; i < _nr + 1; i++) {
                    path.child(`rooms/${room}/users/${i}/`).update({
                        paused: true,
                        time: [e.detail.plyr.currentTime]
                    });
                }
            });
        }
    });

    player.on('playing', e => {
        if (parseInt(localStorage.getItem('user')) == 1) {
            getUsers().then(nr => {
                const _nr = parseInt(nr);
                for (let i = 1; i < _nr + 1; i++) {
                    path.child(`rooms/${room}/users/${i}/`).update({
                        paused: false,
                        time: [e.detail.plyr.currentTime]
                    });
                }
            });
        }
    });

    player.on('pause', e => {
        if (parseInt(localStorage.getItem('user')) == 1) {
            getUsers().then(nr => {
                const _nr = parseInt(nr);
                for (let i = 1; i < _nr + 1; i++) {
                    path.child(`rooms/${room}/users/${i}/`).update({
                        paused: true,
                        time: [e.detail.plyr.currentTime]
                    });
                }
            });
        }
    });

    // player.on('timeupdate', e => {
    //     timeUpdate(room, user, e.detail.plyr.currentTime);
    // });

    // LA QUE FUNCIONA
    getUsers().then(nr => {
        for (let i = 0; i < parseInt(nr); i++) {
            path.child(`rooms/${localStorage.getItem('room')}/users/`).on('child_changed', snap => {
                path.child(`rooms/${localStorage.getItem('room')}/users/${i+1}`).once('value', snap => {
                    if (parseInt(localStorage.getItem('user')) != 1) {
                        print('The value is: ' + snap.val().paused);
                        if (snap.val().paused) {
                            print('Pause');
                            getSingle('#player').pause();
                            getSingle('#player').currentTime = snap.val().time;
                        } else {
                            print('Play');
                            getSingle('#player').play();
                            getSingle('#player').currentTime = snap.val().time;
                        }
                    }
                });
            })
        }
    });

    // DESARROLLO
    // getUsers().then(nr => {
    //     const defRoom = parseInt(localStorage.getItem('room'));
    //     const defUser = parseInt(localStorage.getItem('user'));

    //     path.child(`rooms/${defRoom}/users/`).limitToFirst(1).on('child_changed', snap => {
    //         const detonant = parseInt(snap.key);
    //         for (let i = 0; i < parseInt(nr); i++) {
    //             path.child(`rooms/${defRoom}/users/${i+1}`).once('value', snap => {
    //                 if (defUser != detonant) {
    //                     print('The value is: ' + snap.val().paused);
    //                     if (snap.val().paused) {
    //                         print('Pause');
    //                         getSingle('#player').pause();
    //                         getSingle('#player').currentTime = snap.val().time;
    //                     } else {
    //                         print('Play');
    //                         getSingle('#player').play();
    //                         getSingle('#player').currentTime = snap.val().time;
    //                     }
    //                 }
    //             });
    //         }
    //     })

    // });

    path.child(`rooms/${localStorage.getItem('room')}/users/`).once('value', snap => {
        getSingle('#numViewers').innerHTML = 'subs: ' + snap.numChildren();
    });
    // let langName = 'es';
    // let caption = create('track');
    // caption.setAttribute('kind', 'captions');
    // caption.setAttribute('src', 'https://gist.githubusercontent.com/samdutton/ca37f3adaf4e23679957b8083e061177/raw/e19399fbccbc069a2af4266e5120ae6bad62699a/sample.vtt');
    // caption.setAttribute('srclang', langName);
    // caption.setAttribute('default', '');

    // getSingle('#player').appendChild(caption);
}

function getUsers() {
    return new Promise(resolve => {
        path.child(`rooms/${localStorage.getItem('room')}/users/`).once('value', snap => {
            resolve(snap.numChildren());
        });
    });
}

function cNewClient() {
    return new WebTorrent();
}

async function cCreate(client, torrentId) {
    client.add(torrentId, async (torrent) => {
        t = torrent;

        let file = torrent.files.find((file) => {
            return file.name.endsWith('.mp4') || file.name.endsWith('.mkv');
        });

        file.renderTo('video', {
            autoplay: false,
            muted: true
        }, function callback() {
            // console.log("Ready!");
        });

        announceList.forEach(tracker => torrent.announce.push(tracker[0]));
        optionalExTrackers.forEach(tracker => torrent.announce.push(tracker));

        const room = (parseInt(await getLastRoom()) + 1);
        const user = (parseInt(localStorage.getItem('user')));

        createRoom(room, {
            torrent: {
                magnetURI: [torrentId],
                name: [torrent.name]
            },
            users: {
                1: {
                    admin: true,
                    paused: true,
                    time: '0'
                }
            }
        });

        onOffNode(getSingle('#form-post'), false);
        localStorage.setItem('room', room);
        localStorage.setItem('user', 1);
        changeURL(`${window.location.pathname}?r=${encodeURI(room)}`);
        getSingle('#magnetName').innerHTML = torrent.name;
        if (user != 1) {
            onOffNode(getSingle('#deleteButton'), true);
            getSingle('#deleteButton').addEventListener('click', (e) => {
                removeRoom(searchParams.r);
            });
        }
    });

    client.on('torrent', (torrent) => {
        print('Torrent is ready to be used!');

        path.child(`rooms/${localStorage.getItem('room')}/users/`).once('value', snap => {
            getSingle('#numViewers').innerHTML = 'subs: ' + snap.numChildren();
        });
    });

    client.on('error', function (err) {});
}

async function syncPlayer() {
    // path.child(`rooms/${localStorage.getItem('room')}/users/`).limitToFirst(1).on('child_changed', snap => {
    //     print(snap.val());
    //     print(snap.key);
    //     print(Object.keys(snap.val()));
    // });

    const client = cNewClient();

    getRoomInfo(localStorage.getItem('room')).then(roomInfoObj => {

        getSingle('#magnetName').innerHTML = roomInfoObj.torrent.name[0];
        client.add(roomInfoObj.torrent.magnetURI[0], async (torrent) => {
            t = torrent;

            let file = torrent.files.find((file) => {
                return file.name.endsWith('.mp4') || file.name.endsWith('.mkv');
            });

            announceList.forEach(tracker => torrent.announce.push(tracker[0]));
            optionalExTrackers.forEach(tracker => torrent.announce.push(tracker));
            createPlayer();

            file.renderTo('video', {
                autoplay: false,
                muted: true
            }, function callback() {
                console.log("Ready!");
            });
        });

        client.on('torrent', (torrent) => {
            print('Torrent is ready to be used!');
        });

        client.on('error', function (err) {});

    });
}

// function checkDiffTime(t1, t2) {
//     let maior = t1 > t2 ? t1 : t2;
//     let minor = t1 < t2 ? t1 : t2;

//     return (maior - minor) >= 1.3 ? true : false;
// }

function getLastRoom() {
    return new Promise((resolve) =>
        path.child('/rooms')
        .once('value', v => resolve(Object.keys(v.val()).pop()))
    );
}

function getLastUserPerRoom(room) {
    return new Promise((resolve) =>
        path.child(`/rooms/${room}/users`).once('value', v => resolve(Object.keys(v.val()).pop())));
}

function getNumberOfUsers(room) {
    return new Promise((resolve) =>
        path.child(`/rooms/${room}/users/`).once('value', v => resolve(v.numChildren())));
}

function createRoom(id, obj) {
    path.child(`rooms/${id}`).update(obj);
}

async function createUser(room) {
    const currentUser = parseInt(await getLastUserPerRoom(room)) + 1;
    print(currentUser);
    path.child(`/rooms/${room}/users/${currentUser}`).update({
        admin: false,
        paused: true,
        time: '0'
    });

    return currentUser;
}

function getRoomInfo(room) {
    return new Promise(resolve => {
        path.child(`/rooms/${room}/`).once('value', v => {
            resolve(v.val());
        });
    });
}

/**
 * 
 * @param {int} origin /origin room 
 * @param {int} to / target room 
 * @param {boolean} overwrite / If target room exists overwrite it
 */
function moveRoomTo(origin, to, overwrite) {
    path.child(`/rooms/`).once('value', async snap => {
        if (snap.child(to).exists()) {
            print('The room exists!');
            return false;
        } else {
            let nob = await getRoomInfo(origin);
            path.child(`/rooms/${to}/`).update(nob);
            path.child(`/rooms/${origin}/`).set({});

            window.location.replace(window.location.pathname + '?r=' + to);
            return true;
        }
    });
}

function removeRoom(room) {
    print('Deleting room: ' + room);
    path.child(`/rooms/`).once('value', async snap => {
        if (snap.child(room).exists()) {
            path.child(`/rooms/${room}/`).set({});
            window.location.replace(window.location.pathname);
        } else print('That room doesn\'t exist');
    });
}