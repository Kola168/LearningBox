const regeneratorRuntime = require('../lib/co/runtime')
const co = require('../lib/co/co')
const util = require('./util')
const _ = require('../lib/underscore/we-underscore')
const uploadFormId = require('./gfd-formid-upload')
const wxNav = require('./nav')
const logger = require('./logger')
import storage from './storage'
const common_util = require('./common_util')

export { regeneratorRuntime, co, util, _, uploadFormId, wxNav, storage, logger,common_util }
