const print = io => console.log(io);
const error = error => console.error(error);
const warn = warn => console.warn(warn);
const count = title => console.count(title);
const clear = () => console.clear();
const timeStart = title => console.time(title);
const timeEnd = title => console.timeEnd(title);
const replaceUrl = (title, url) => url.replace('query', title);
const resetContainer = (id, list) => removeChildsNode(id, list);
const getMulti = (query) => document.querySelectorAll(query);
const getSingle = (query) => document.querySelector(query);
const create = (type) => document.createElement(type);
const txt = (text) => document.createTextNode(text);
const has = (obj, prop) => obj.hasOwnProperty(prop);
const changeURL = (url) => window.history.pushState("Test", "API", url);
const toBit = (value) => typeof (value) === 'number' ? value.toString(2) : value.split('').map((char) => char.charCodeAt(0).toString(2)).join('');
const listener = (e) => JSON.parse(fmt('{"%": "%"}', [e.key, e.keyCode]));
const eql = (str_1, str_2) => typeof (str_1) == 'string' ? str_1.toLowerCase() == str_2.toLowerCase() : str_1 == str_2;
const searchIsEmpty = () => document.location.search.length == 0;
const nodeListToArray = (nodeList) => Array.from(nodeList);
const sleep = m => new Promise(r => setTimeout(r, m)); // use await sleep(3000);
const redirTo = (to) => document.location.href = to;
const typeSizes = {
    "undefined": () => 0,
    "boolean": () => 4,
    "number": () => 8,
    "string": item => 2 * item.length,
    "object": item => !item ? 0 : Object
        .keys(item)
        .reduce((total, key) => sizeOf(key) + sizeOf(item[key]) + total, 0)
};

const sizeOf = value => typeSizes[typeof value](value);

const range = (start, end) => {
    let aux = [];
    for (let i = start; i < end; i++) aux.push(i);
    return aux;
}

//generateIntervalString(somenode, 'Esto es una prueba', 100);
const generateIntervalString = (node, str, interval) => {
    if (!node) {
        warn('Element passed is not a valid element!');
        return;
    }

    try {
        const maxInterval = str.length;
        node.innerText = '';

        let increment = 0;

        const doThing = () => {
            str.length == increment ? clearInterval(ival) : node.innerHTML += str[increment];
            increment++;
        };

        let ival = setInterval(doThing, interval);
    } catch (e) {
        warn('Something went wrong!\n' + e.message);
    }
}

function similarity(a, b) {
    try {
        let equivalency = 0;
        let minLength = (a.length > b.length) ? b.length : a.length;
        let maxLength = (a.length < b.length) ? b.length : a.length;
        for (let i = 0; i < minLength; i++) a[i] == b[i] ? equivalency++ : 0;

        return ((equivalency / maxLength) * 100);
    } catch (e) {
        warn('Can\'t process similarity!');
    }
}

let arr = {
    //Ex01: arr.removeAt([1, 2, 3], 0) ----> [2, 3]
    //Ex02: arr.removeAt([1, 2, 3, 4], [0, 2]) ----> [2, 4]
    removeAt: function (arr, index) {
        return Array.isArray(index) ? arr.filter((i, pos) => !index.includes(pos)) : arr.filter((i, pos) => ![index].includes(pos))
    },
    //Ex: arr.find([1, 2, 3, 99, 11, 21, 1], 1) ----> [0, 6]
    find: function (arr, search) {
        return (Array.isArray(arr) && arr.includes(search)) ? arr.map((i, pos) => i == search ? pos : null).filter(x => x != null) : []
    }
}


const numberAcotation = (n) => {
    if (!n.toString().includes('+') || !n.toString().length > 14) {
        const len = n.toString().length;
        if (len < 4) return n;
        return fmt('%k', [n.toString().substring(0, len - 3)]);
    }

    return -1;
}

/* document.body.appendChild( 
        await createDOMElement('a', 'Go to home', {
            class: 'link', 
            target: '_blank', 
            id: 'title-link', 
            href: window.location.pathname
        }, {
            click: (e) => fmt('You have clicked on this link: %', [e.currentTarget.href], true)
        }) 
    );
*/
const createDOMElement = (tag, text, attributes, evts) => {
    return new Promise(resolve => {
        var e = create(tag);

        if (text) e.appendChild(txt(text));

        for (var a in attributes) e.setAttribute(a, attributes[a]);
        for (var evt in evts) e.addEventListener(evt, evts[evt]);

        resolve(e);
    });
}

const getJSONUrl = (str) => {
    return new Promise(resolve => {
        let aux = {};
        if (typeof (str) === 'string' && str.length > 1) {
            const URL_OBJECT = new URL(str) ? new URL(str) : null;
            for (const i of new URLSearchParams(URL_OBJECT.search)) {
                aux[i[0]] = i[1];
            }
        }
        resolve(aux);
    });
};

const fmt = (text, items, on = false, term = '%') => {
    if (items.length > 0) {
        items.forEach(x => {
            if (text.includes('%20') && term == '%') {
                error('You\'re using encoded string with the replacement term of %');
                warn('Consider changing the term or use another function and not fmt()');
                return;
            }
            text = text.replace(term, x);
        });
        on ? print(text) : null;
        return text;
    }
    return;
};

/*
node: Single node
save: Multiple nodes for delete exception
*/
function removeChildsNode(node, save) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
    save && (save.length > 0) ? save.forEach(x => node.appendChild(x)) : null;
}

const selectIndexFromURL = (value, node) => {
    for (let i of node.options) {
        if (i.value == value) {
            node.options[i.index].selected = true;
            return;
        }
    }
}

/**
 * ----------------------------------------------------------------
 */

function ajaxPost(value) {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(this.responseText));
            }
        };
        xhttp.open("POST", "test.php", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(value);
    });
}

function ajaxGET(value){
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                resolve(this.responseText);
            }
        };
        xhttp.open("GET", encodeURI(value), true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send();
    });
}

function md5(d) {
    return rstr2hex(binl2rstr(binl_md5(rstr2binl(d), 8 * d.length)))
}

function rstr2hex(d) {
    for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) _ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
    return f
}

function rstr2binl(d) {
    for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
    for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
    return _
}

function binl2rstr(d) {
    for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
    return _
}

function binl_md5(d, _) {
    d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
    for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
        var h = m,
            t = f,
            g = r,
            e = i;
        f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e)
    }
    return Array(m, f, r, i)
}

function md5_cmn(d, _, m, f, r, i) {
    return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m)
}

function md5_ff(d, _, m, f, r, i, n) {
    return md5_cmn(_ & m | ~_ & f, d, _, r, i, n)
}

function md5_gg(d, _, m, f, r, i, n) {
    return md5_cmn(_ & f | m & ~f, d, _, r, i, n)
}

function md5_hh(d, _, m, f, r, i, n) {
    return md5_cmn(_ ^ m ^ f, d, _, r, i, n)
}

function md5_ii(d, _, m, f, r, i, n) {
    return md5_cmn(m ^ (_ | ~f), d, _, r, i, n)
}

function safe_add(d, _) {
    var m = (65535 & d) + (65535 & _);
    return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m
}

function bit_rol(d, _) {
    return d << _ | d >>> 32 - _
}