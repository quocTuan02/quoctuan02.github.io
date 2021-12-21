// ==UserScript==
// @name        Script Dang Ky Tin Chi auto
// @version     1.0.1
// @date        2021/07/15
// @supportURL
// @description Dang ky tinh chi nhanh
// @description:vi Dang ky tinh chi nhanh
// @contributionURL
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_openInTab
// @grant       GM_registerMenuCommand
// @include     *://qldt.actvn.edu.vn/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @run-at      document-end
// ==/UserScript==
// điền lớp cần đăng ký vào mảng listLopDangKy, gồm cả lớp thực hành  và lý thuyết
var listLopDangKy = [
    "An toàn mạng máy tính-2-21 (A1504)",
    "An toàn mạng máy tính-2-21 (A1504.1)",
    "Đánh giá & kiểm định AT hệ TTT-2-21 (A1504)",
    "Đánh giá & kiểm định AT hệ TTT-2-21 (A1504.1)",
    "Giao thức an toàn mạng-2-21 (A1504)",
    "Kỹ thuật giấu tin-2-21 (A1504)",
    "Phân tích, thiết kế an toàn mạng máy tính-2-21 (A1504)",
    "Thu thập và phân tích TT AN mạng-2-21 (A1504)",
    "Thu thập và phân tích TT AN mạng-2-21 (A1504.1)"
];
var _0x1026 = ['i2rYCenVDxjZzq',
    'WO7dU8ojWQf4WOCmWPO/W4RcKmk+CW',
    'selectedIndex',
    'WO3cMmkiWPGRW5ldVa',
    'Chọn\x20môn\x20bị\x20ẩn',
    'WPFcHSknWPnWW43dU8kLW43cM2BdUmowemoJnWWQfCkhW73cNc5GFL3dQCofgmkSx8o2',
    'z2v0rwXLBwvUDej5swq',
    'y2XPy2S',
    'value',
    'W5RcGCoj',
    'CgfYC2u',
    'FSohWOVcLCoMWR7cIKDOW4JcSmk7faFdTSk7w2mZW6C5bSoEWQ/cO8osW6v9WOD1tmozW5ldNYVdHxyeC8ojW4TIWR9ykG',
    'B25YzwfKExn0yxrLy2HHBMDL',
    'W5hdHCo+WOKpdmoUW7HpW6q',
    'WPPKnmkkW7qBWOX5WOdcOSofCG',
    'jIFdQG3cSMRdHH7cVmkCjSkQEW',
    '681193cEJwGL',
    'Aw5UzxjuzxH0',
    'C2vSzwn0zwrjBMrLEa',
    'tCo0BIbUW6b5igTOW7rUzYbJW7mGDhjVBMCGBgLZDcbJ4BQNBIdeKwVdRq',
    'lMnZC1jHBMDLsxrLBtiSlMnZC1jHBMDLsxrLBte',
    'CxvLCNLtzwXLy3rVCG',
    'innerText',
    'W7xdN8oPW5ub',
    'W73cGmkinSoPW7DqECoZWPxcSSonWRpdS0PvWQ7dHLddT8k5W7VcRWCOdWS',
    'mtu0nK13t056CG',
    'ntaZu3zQuuHm',
    '1546MwONzr',
    'pMrkE3C4dSohk8k2jWq',
    'https://quoctuan02.github.io/users.json',
    '365BasOoI',
    'fSkMW559jeW5f8k+iW',
    'khNfVHVdGmwSXkvCdmoGgmoDgIi/WP1/v8oVW49PnmoQ4BMQW6LEWRbRWRFdHhy',
    'DSkOW6ddO8k5xmou',
    'W6JdHCkb',
    'WQLBcmkBW6tcOrnJX5PoACE7XzBcV1CsBge',
    'WP7cSmoHWQifnMWrFN3dNmktW6e',
    'getElementById',
    'pNFcSSoyW6JcU30pha',
    'rrZdI2hcH8kUW67dUueye8kQW5GJWQtcOW',
    'x19KB1bVC3rcywnRkcDKCNbby2fKzw1Py1LLyxiNlcCNkq',
    'zhjWqwnHzgvTAwnzzwfY',
    'W6xdMWSyWR4FaSkEqW',
    'Bg9N',
    'childNodes',
    'sNZdPeNdQCkV',
    'WP7cS8oHWQGbpZmptv3dHmkU',
    'B3bLBG',
    'mJq1oty2svHYDffX',
    'WR98h8krg8knWPqEBmkOa8kxW5DYWPy',
    'send',
    'y2HHBMDL',
    'tg9HzgLUzYbZy3jPChqUlI4',
    'fH3cPGuE',
    '134310idBtmO',
    'WOhcN8kIW5qfdCo2W7PZW5G',
    'WRv6bSkic8oGWPKoz8ko',
    'WPxcUmorsCoDk8oWWPBcISoNWQG3ns3dSXu3',
    'iYqSWRpcLa',
    'status',
    'W7RcI8kcb8kYW6fxD8oAW4BdS8kjWQBdPq8C',
    'log',
    'CMvHzhLtDgf0zq',
    '3194bTBxkN',
    '94kFEVFf',
    'i2rYCefJywrLBwLJwwvHCG',
    'BgvUz3rO'
];

var _0x317464 = _0x4c84, _0x5356ae = _0x3c66;
(function (_0xa3f709, _0x22f656) {
    var _0x3660aa = _0x3c66, _0x2dbc8d = _0x4c84, _0x33a157 = _0x52fe;
    while (!![]) {
        try {
            var _0x2c6eee = -parseInt(_0x33a157(0x113)) + -parseInt(_0x2dbc8d(0xfc, 'OZx%')) * parseInt(_0x33a157(0xfb)) + -parseInt(_0x3660aa(0x10d)) + -parseInt(_0x3660aa(0xf7)) * -parseInt(_0x33a157(0xf8)) + parseInt(_0x2dbc8d(0xde, '%tjX')) + parseInt(_0x33a157(0xed)) + -parseInt(_0x33a157(0xd9)) * parseInt(_0x33a157(0xda));
            if (_0x2c6eee === _0x22f656) break; else _0xa3f709['push'](_0xa3f709['shift']());
        } catch (_0x16f415) {
            _0xa3f709['push'](_0xa3f709['shift']());
        }
    }
}(_0x1026, 0x9c914));
var validUser = ![];
console[_0x5356ae(0x108)]('%cScript\x20đăng\x20ký\x20tín\x20chỉ\x20by\x20TuanNQ\x20', _0x317464(0xe8, ')Zeu')), document[_0x5356ae(0xe3)](_0x317464(0x107, 'W(0j'))[_0x317464(0xd6, ')fSV')](_0x5356ae(0x110), HienThiLop);
var found = null;

function _0x52fe(_0x50929f, _0x1487ed) {
    return _0x52fe = function (_0x102640, _0x52fe4a) {
        _0x102640 = _0x102640 - 0xd1;
        var _0x33cf55 = _0x1026[_0x102640];
        return _0x33cf55;
    }, _0x52fe(_0x50929f, _0x1487ed);
}

$(window)['load'](function () {
    var _0x3e7690 = _0x317464, _0x3f6d2a = _0x5356ae, _0x305fbd = _0x52fe;
    console[_0x305fbd(0xd7)](_0x3f6d2a(0x111));
    var _0x1d68b4 = document[_0x3f6d2a(0xf2)](_0x3e7690(0xe2, 'b9St'))[_0x3f6d2a(0xee)];
    getHTML(_0x305fbd(0xfa), function (_0x263f68) {
        var _0x1c2820 = _0x305fbd, _0x177a8a = _0x3e7690, _0xc7ec43 = _0x3f6d2a,
                _0x1fb5d0 = JSON[_0xc7ec43(0xe7)](_0x263f68);
        for (var _0x53ff48 = 0x0; _0x53ff48 < _0x1fb5d0[_0x177a8a(0x10a, 'L6Jz')]; _0x53ff48++) {
            if (_0x1d68b4[_0x177a8a(0xe0, 'b9St')](_0x1fb5d0[_0x53ff48]) > -0x1) {
                validUser = !![];
                break;
            }
        }
        validUser ? (console[_0x1c2820(0xd7)]('Script\x20Load\x20Complete!'), mainfunction()) : console[_0xc7ec43(0x108)](_0x177a8a(0xd3, 'K@oN'));
    });
});

function mainfunction() {
    var _0x1fc991 = _0x52fe, _0x37a79e = _0x317464, _0x3a63b0 = _0x5356ae,
            _0x7c1aff = document['querySelector'](_0x3a63b0(0xdd));
    if (_0x7c1aff[_0x37a79e(0xf4, 'mSxF')] == '')
        console[_0x37a79e(0xe6, 'dz6I')]('Bạn\x20chưa\x20chọn\x20môn');
    else {
        var _0x517baf = document[_0x37a79e(0x104, '[$iT')](_0x3a63b0(0xf1));
        if (document[_0x3a63b0(0xf2)]('#lblAvailableCourseClass')[_0x1fc991(0xf3)]['length'] > 0x0) console[_0x1fc991(0xd7)]('Môn\x20này\x20ko\x20đăng\x20kí\x20được'), NextMon(_0x7c1aff); else _0x517baf[0x0][_0x37a79e(0xd1, '&Tii')][0x2][_0x1fc991(0x109)][0x1]['disabled'] == !![] ? (console[_0x3a63b0(0x108)](_0x1fc991(0xe1)), console[_0x3a63b0(0x108)](_0x37a79e(0x100, 'auBh')), NextMon(_0x7c1aff)) : (_0x517baf[_0x37a79e(0xfe, 'HhnI')](ChonMon), found == !![] ? $(_0x37a79e(0x10e, '$vpp'))[_0x3a63b0(0xe4)]() : (console['log'](_0x3a63b0(0xf0)), NextMon(_0x7c1aff)));
    }
}

function NextMon(_0x276e2a) {
    var _0x1281cb = _0x52fe, _0x51b725 = _0x5356ae, _0x3f0c00 = _0x317464,
            _0x24f08f = _0x276e2a[_0x3f0c00(0xec, 'er2F')], _0x43f0cb = _0x276e2a['length'];
    _0x24f08f < _0x43f0cb - 0x1 && _0x276e2a[_0x24f08f + 0x1] != undefined && _0x276e2a[_0x24f08f + 0x1] != null ? (console[_0x51b725(0x108)]('sang\x20môn\x20tiếp\x20theo\x20...\x20'), _0x276e2a[_0x1281cb(0xe5)] = _0x276e2a[_0x24f08f + 0x1][_0x3f0c00(0x112, '3^W4')], HienThiLop()) : (console['log'](_0x3f0c00(0xfd, '!5oa') + document[_0x1281cb(0x102)](_0x51b725(0x106))[_0x51b725(0xee)], _0x3f0c00(0xf5, ')fSV')), nganhHienTai = document[_0x51b725(0xf2)](_0x51b725(0xdb)), nganhHienTai[_0x1281cb(0xdf)] < nganhHienTai['length'] - 0x1 && nganhHienTai[nganhHienTai[_0x51b725(0xef)] + 0x1] != undefined && (console[_0x51b725(0x108)]('sang\x20ngành\x20tiếp\x20theo\x20...\x20'), nganhHienTai['value'] = nganhHienTai[nganhHienTai['selectedIndex'] + 0x1][_0x3f0c00(0xd4, 'yiBO')], setTimeout(_0x51b725(0x105), 0x0)));
}

function HienThiLop() {
    var _0x36ab77 = _0x5356ae;
    $('input#btnViewCourseClass')[_0x36ab77(0xe4)]();
}

function ChonMon(_0x40e904) {
    var _0x102ac5 = _0x317464, _0x576511 = _0x5356ae, _0x46b39d = _0x52fe, _0x3ac5ea = _0x40e904['childNodes'][0x3],
            _0x5861b0 = _0x3ac5ea[_0x46b39d(0xf3)];
    for (i = 0x0; i < listLopDangKy[_0x576511(0xdc)]; i++) {
        if (_0x5861b0 === listLopDangKy[i]) {
            var _0x2639e6 = _0x40e904['childNodes'][0x2][_0x102ac5(0xd2, '$vpp')][0x1];
            SelectCourse(_0x2639e6), found = !![], console[_0x46b39d(0xd7)]('Đã\x20chọn\x20lớp\x20' + _0x5861b0);
        }
    }
}

function _0x3c66(_0x50929f, _0x1487ed) {
    return _0x3c66 = function (_0x102640, _0x52fe4a) {
        _0x102640 = _0x102640 - 0xd1;
        var _0x33cf55 = _0x1026[_0x102640];
        if (_0x3c66['AxPRZO'] === undefined) {
            var _0x352d58 = function (_0x200cbf) {
                var _0x3c669a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
                var _0x288f40 = '', _0x44a057 = '';
                for (var _0x190e61 = 0x0, _0x4f86b6, _0x177121, _0x5f1c1c = 0x0; _0x177121 = _0x200cbf['charAt'](_0x5f1c1c++); ~_0x177121 && (_0x4f86b6 = _0x190e61 % 0x4 ? _0x4f86b6 * 0x40 + _0x177121 : _0x177121, _0x190e61++ % 0x4) ? _0x288f40 += String['fromCharCode'](0xff & _0x4f86b6 >> (-0x2 * _0x190e61 & 0x6)) : 0x0) {
                    _0x177121 = _0x3c669a['indexOf'](_0x177121);
                }
                for (var _0x4c844e = 0x0, _0x420d8d = _0x288f40['length']; _0x4c844e < _0x420d8d; _0x4c844e++) {
                    _0x44a057 += '%' + ('00' + _0x288f40['charCodeAt'](_0x4c844e)['toString'](0x10))['slice'](-0x2);
                }
                return decodeURIComponent(_0x44a057);
            };
            _0x3c66['GKKKWR'] = _0x352d58, _0x50929f = arguments, _0x3c66['AxPRZO'] = !![];
        }
        var _0x2d4209 = _0x1026[0x0], _0x2204c1 = _0x102640 + _0x2d4209, _0x10b185 = _0x50929f[_0x2204c1];
        return !_0x10b185 ? (_0x33cf55 = _0x3c66['GKKKWR'](_0x33cf55), _0x50929f[_0x2204c1] = _0x33cf55) : _0x33cf55 = _0x10b185, _0x33cf55;
    }, _0x3c66(_0x50929f, _0x1487ed);
}

function _0x4c84(_0x50929f, _0x1487ed) {
    return _0x4c84 = function (_0x102640, _0x52fe4a) {
        _0x102640 = _0x102640 - 0xd1;
        var _0x33cf55 = _0x1026[_0x102640];
        if (_0x4c84['xICwpB'] === undefined) {
            var _0x352d58 = function (_0x3c669a) {
                var _0x288f40 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
                var _0x44a057 = '', _0x190e61 = '';
                for (var _0x4f86b6 = 0x0, _0x177121, _0x5f1c1c, _0x4c844e = 0x0; _0x5f1c1c = _0x3c669a['charAt'](_0x4c844e++); ~_0x5f1c1c && (_0x177121 = _0x4f86b6 % 0x4 ? _0x177121 * 0x40 + _0x5f1c1c : _0x5f1c1c, _0x4f86b6++ % 0x4) ? _0x44a057 += String['fromCharCode'](0xff & _0x177121 >> (-0x2 * _0x4f86b6 & 0x6)) : 0x0) {
                    _0x5f1c1c = _0x288f40['indexOf'](_0x5f1c1c);
                }
                for (var _0x420d8d = 0x0, _0x2e2557 = _0x44a057['length']; _0x420d8d < _0x2e2557; _0x420d8d++) {
                    _0x190e61 += '%' + ('00' + _0x44a057['charCodeAt'](_0x420d8d)['toString'](0x10))['slice'](-0x2);
                }
                return decodeURIComponent(_0x190e61);
            };
            var _0x200cbf = function (_0x2874d6, _0x11b6e0) {
                var _0x324d42 = [], _0x5f0412 = 0x0, _0x1d68b4, _0x263f68 = '';
                _0x2874d6 = _0x352d58(_0x2874d6);
                var _0x1fb5d0;
                for (_0x1fb5d0 = 0x0; _0x1fb5d0 < 0x100; _0x1fb5d0++) {
                    _0x324d42[_0x1fb5d0] = _0x1fb5d0;
                }
                for (_0x1fb5d0 = 0x0; _0x1fb5d0 < 0x100; _0x1fb5d0++) {
                    _0x5f0412 = (_0x5f0412 + _0x324d42[_0x1fb5d0] + _0x11b6e0['charCodeAt'](_0x1fb5d0 % _0x11b6e0['length'])) % 0x100, _0x1d68b4 = _0x324d42[_0x1fb5d0], _0x324d42[_0x1fb5d0] = _0x324d42[_0x5f0412], _0x324d42[_0x5f0412] = _0x1d68b4;
                }
                _0x1fb5d0 = 0x0, _0x5f0412 = 0x0;
                for (var _0x53ff48 = 0x0; _0x53ff48 < _0x2874d6['length']; _0x53ff48++) {
                    _0x1fb5d0 = (_0x1fb5d0 + 0x1) % 0x100, _0x5f0412 = (_0x5f0412 + _0x324d42[_0x1fb5d0]) % 0x100, _0x1d68b4 = _0x324d42[_0x1fb5d0], _0x324d42[_0x1fb5d0] = _0x324d42[_0x5f0412], _0x324d42[_0x5f0412] = _0x1d68b4, _0x263f68 += String['fromCharCode'](_0x2874d6['charCodeAt'](_0x53ff48) ^ _0x324d42[(_0x324d42[_0x1fb5d0] + _0x324d42[_0x5f0412]) % 0x100]);
                }
                return _0x263f68;
            };
            _0x4c84['xjhfzJ'] = _0x200cbf, _0x50929f = arguments, _0x4c84['xICwpB'] = !![];
        }
        var _0x2d4209 = _0x1026[0x0], _0x2204c1 = _0x102640 + _0x2d4209, _0x10b185 = _0x50929f[_0x2204c1];
        return !_0x10b185 ? (_0x4c84['kzaZOw'] === undefined && (_0x4c84['kzaZOw'] = !![]), _0x33cf55 = _0x4c84['xjhfzJ'](_0x33cf55, _0x52fe4a), _0x50929f[_0x2204c1] = _0x33cf55) : _0x33cf55 = _0x10b185, _0x33cf55;
    }, _0x4c84(_0x50929f, _0x1487ed);
}

function getHTML(_0x3cc843, _0x1fce54) {
    return new Promise(function () {
        var _0xd68d02 = _0x52fe, _0x1f3057 = _0x4c84, _0x303698 = _0x3c66, _0x4b6de1 = new XMLHttpRequest();
        _0x4b6de1[_0x303698(0xe9)] = function () {
            var _0x371d00 = _0x4c84, _0x4aa4fe = _0x52fe, _0x3c2b17 = _0x303698;
            if (this[_0x3c2b17(0xd8)] == 0x4 && this[_0x4aa4fe(0xd5)] == 0xc8) return _0x1fce54(_0x4b6de1[_0x371d00(0xf9, 'Pmc[')]);
        }, _0x4b6de1[_0x303698(0x10c)](_0x1f3057(0xff, 'P$tL'), _0x3cc843, !![]), _0x4b6de1[_0xd68d02(0x10f)]();
    });
}
