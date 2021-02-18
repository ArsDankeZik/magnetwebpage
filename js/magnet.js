let t = null;
        getSingle('#form-post').addEventListener('submit', (e) => {
            e.preventDefault();
        });

        getSingle('#f-input').addEventListener('keydown', (e) => {
            if (e.key == 'Enter') {
                createPlayer();
                cCreate(cNewClient(), e.target.value.trim());
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
                    language: 'es',
                }
            });
        }

        function cDelete(client) {
            client.destroy();
        }

        function cNewClient() {
            return new WebTorrent();
        }

        function cCreate(client, torrentId) {
            client.add(torrentId, (torrent) => {
                t = torrent;

                torrent.files.forEach(element => {
                    if(element.name.endsWith('.srt')){
                        // print(element.name);
                        print(element.path);

                        let langName = element.path[element.path.indexOf('.')+1] + "" + element.path[element.path.indexOf('.')-1];
                        // print(langName);
                        let caption = create('track');
                        caption.setAttribute('kind', 'captions');
                        caption.setAttribute('src', element.path);
                        caption.setAttribute('srclang', langName);
                        caption.setAttribute('default', '');

                        getSingle('#player').appendChild(caption);
                    }
                });

                let file = torrent.files.find((file) => {
                    return file.name.endsWith('.mp4')
                });

                file.renderTo('video', {
                    autoplay: false,
                    muted: true
                }, function callback() {
                    console.log("ready to play!");
                });

            });
        }