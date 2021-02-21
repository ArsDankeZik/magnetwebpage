let t = null;

(async () => {
    if (!searchIsEmpty()) {
        let searchParams = await getJSONUrl(document.location.href);
        if (has(searchParams, 'r')) {
            fmt('You are in room %', [searchParams.r], true);
            localStorage.setItem('room', searchParams.r);
            if (!localStorage.getItem('user'))
                localStorage.setItem('user', await createUser(searchParams.r));

            onOffNode(getSingle('#form-post'), false);
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
    pl.setAttribute('controls', '');
    getSingle('#videoContainer').appendChild(pl);

    const player = new Plyr('#player', {
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

    const room = localStorage.getItem('room');
    const user = localStorage.getItem('user');

    player.on('ready', e => {
        player.poster = 'src/movietime.jpg';
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

    getUsers().then(nr => {
        for (let i = 0; i < parseInt(nr); i++) {
            path.child(`rooms/${localStorage.getItem('room')}/users/`).on('child_changed', snap => {
                path.child(`rooms/${localStorage.getItem('room')}/users/${i+1}`).once('value', snap => {
                    if (parseInt(localStorage.getItem('user')) != 1) {
                        setTimeout(() => {
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
                            // snap.val().paused ? player.pause() : player.play();
                        }, 350);
                    }
                });
            })
        }
    });

    path.child(`rooms/${localStorage.getItem('room')}/users/`).once('value', snap => {
        getSingle('#numViewers').innerHTML = 'subs: ' + snap.numChildren();
    });
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
            return file.name.endsWith('.mp4')
        });

        file.renderTo('video', {
            autoplay: false,
            muted: true
        }, function callback() {
            // console.log("Ready!");
        });


        const room = (parseInt(await getLastRoom()) + 1);

        createRoom(room, {
            torrent: {
                magnetURI: [torrent.magnetURI],
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
    });

    client.on('torrent', (torrent) => {
        print('Torrent is ready to be used!');

        // getSingle('#player').autoplay = true;

        path.child(`rooms/${localStorage.getItem('room')}/users/`).once('value', snap => {
            getSingle('#numViewers').innerHTML = 'subs: ' + snap.numChildren();
            getSingle('#numViewers').innerHTML += '<br>Torrent ready to be played!';
        });
    });

    client.on('error', function (err) {});
}

async function syncPlayer() {
    createPlayer();
    const client = cNewClient();

    getRoomInfo(localStorage.getItem('room')).then(roomInfoObj => {

        getSingle('#magnetName').innerHTML = roomInfoObj.torrent.name[0];
        client.add(roomInfoObj.torrent.magnetURI[0], async (torrent) => {
            // print(torrent);
            t = torrent;

            let file = torrent.files.find((file) => {
                return file.name.endsWith('.mp4')
            });

            file.renderTo('video', {
                autoplay: false,
                muted: true
            }, function callback() {
                console.log("Ready!");
            });
        });

        client.on('torrent', (torrent) => {
            print('Torrent is ready to be used!');
            // print(torrent);
        });

        client.on('error', function (err) {});
    });
}

function checkDiffTime(t1, t2) {
    let maior = t1 > t2 ? t1 : t2;
    let minor = t1 < t2 ? t1 : t2;

    return (maior - minor) >= 1.3 ? true : false;
}

function play(room, user) {
    path.child(`rooms/${room}/users/${user}/`).update({
        paused: false
    });
}

function pause(room, user) {
    path.child(`rooms/${room}/users/${user}/`).update({
        paused: true
    });
}

function timeUpdate(room, user, time) {
    path.child(`rooms/${room}/users/${user}/`).update({
        time: [time]
    });
}

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