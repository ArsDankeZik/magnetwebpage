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
        }
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
            console.log("Ready!");
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
                    time: '0:00:00'
                }
            }
        });

        onOffNode(getSingle('#form-post'), false);
        localStorage.setItem('room', room);
        localStorage.setItem('user', 1);
        changeURL(`${window.location.pathname}?r=${encodeURI(room)}`);
        getSingle('#magnetName').innerHTML = torrent.name;
    });
}

async function syncPlayer() {
    createPlayer();
    const client = cNewClient();
    
    getRoomInfo(localStorage.getItem('room')).then(roomInfoObj => {

        getSingle('#magnetName').innerHTML = roomInfoObj.torrent.name[0];
        client.add(roomInfoObj.torrent.magnetURI[0], async (torrent) => {
            print(torrent);
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

function createRoom(id, obj) {
    path.child(`rooms/${id}`).update(obj);
}

async function createUser(room) {
    const currentUser = parseInt(await getLastUserPerRoom(room)) + 1;
    print(currentUser);
    path.child(`/rooms/${room}/users/${currentUser}`).update({
        admin: false,
        paused: true,
        time: '0:00:00'
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