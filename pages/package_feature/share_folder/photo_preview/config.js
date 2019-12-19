var config = {
    aliCloud: {
        _5inch: {
            key: 'pic_in5',
            name: '5寸',
            width: 1092,
            height: 1560,
            rotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/rotate,90/resize,m_fill,h_285,w_200/quality,Q_85/format,jpg',
            noRotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/resize,m_fill,h_285,w_200/quality,Q_85/format,jpg'
        },
        _6inch: {
            key: 'pic_in6',
            name: '6寸',
            width: 1300,
            height: 1950,
            rotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/rotate,90/resize,m_fill,h_300,w_200/quality,Q_85/format,jpg',
            noRotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/resize,m_fill,h_300,w_200/quality,Q_85/format,jpg'
        },
        _7inch: {
            key: 'pic_in7',
            name: '7寸',
            width: 1560,
            height: 2148,
            rotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/rotate,90/resize,m_fill,h_280,w_200/quality,Q_85/format,jpg',
            noRotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/resize,m_fill,h_280,w_200/quality,Q_85/format,jpg'
        },
        _a4: {
            key: 'pic_a4',
            name: 'A4',
            width: 2520,
            height: 3564,
            rotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/rotate,90/resize,m_fill,h_282,w_200/quality,Q_85/format,jpg',
            noRotateMin: '?x-oss-process=image/resize,h_800/auto-orient,1/resize,m_fill,h_282,w_200/quality,Q_85/format,jpg'
        },
    },
    huaweiCloud: {
        _5inch: {
            key: 'pic_in5',
            name: '5寸',
            width: 1092,
            height: 1560,
            noRotateMin: '/resize,h_800/resize,m_fill,h_285,w_200/quality,Q_85/format,jpg'
        },
        _6inch: {
            key: 'pic_in6',
            name: '6寸',
            width: 1300,
            height: 1950,
            noRotateMin: '/resize,h_800/resize,m_fill,h_300,w_200/quality,Q_85/format,jpg',
        },
        _7inch: {
            key: 'pic_in7',
            name: '7寸',
            width: 1560,
            height: 2148,
            noRotateMin: '/resize,h_800/resize,m_fill,h_280,w_200/quality,Q_85/format,jpg'
        },
        _a4: {
            key: 'pic_a4',
            name: 'A4',
            width: 2520,
            height: 3564,
            noRotateMin: '/resize,h_800/resize,m_fill,h_282,w_200/quality,Q_85/format,jpg'
        },
    }
}

export default config