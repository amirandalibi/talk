const mongoose = require('../services/mongoose');
const Schema = mongoose.Schema;

const PERMISSIONS = [
  'ADMIN'
];

/**
 * The Mongo schema for a Tag.
 * @type {Schema}
 */
const TagSchema = new Schema({
  id: {
    type: String,
    unique: true,
    default: 'STAFF'
  },
  public: Boolean,
  text: {
    type: Schema.Types.Mixed,
    default:  null
  },
  permissions: [{
    type: String,
    enum: PERMISSIONS,
    default: 'ADMIN'
  }],
  models: [String],

  // Additional metadata stored on the field.
  metadata: Schema.Types.Mixed
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

const MODERATION_OPTIONS = [
  'PRE',
  'POST'
];

/**
 * SettingSchema manages application settings that get used on front and backend.
 * @type {Schema}
 */
const SettingSchema = new Schema({
  id: {
    type: String,
    default: '1'
  },
  moderation: {
    type: String,
    enum: MODERATION_OPTIONS,
    default: 'POST'
  },
  infoBoxEnable: {
    type: Boolean,
    default: false
  },
  customCssUrl: {
    type: String,
    default: ''
  },
  infoBoxContent: {
    type: String,
    default: ''
  },
  questionBoxEnable: {
    type: Boolean,
    default: false
  },
  questionBoxContent: {
    type: String,
    default: ''
  },
  premodLinksEnable: {
    type: Boolean,
    default: false
  },
  organizationName: {
    type: String
  },
  autoCloseStream: {
    type: Boolean,
    default: false
  },
  closedTimeout: {
    type: Number,

    // Two weeks default expiry.
    default: 60 * 60 * 24 * 7 * 2
  },
  closedMessage: {
    type: String,
    default: 'Expired'
  },
  wordlist: {
    banned: {
      type: Array,
      default: []
    },
    suspect: {
      type: Array,
      default: []
    }
  },
  charCount: {
    type: Number,
    default: 5000
  },
  charCountEnable: {
    type: Boolean,
    default: false
  },
  requireEmailConfirmation: {
    type: Boolean,
    default: false
  },
  domains: {
    whitelist: {
      type: Array,
      default: ['localhost']
    }
  },
  tags: [TagSchema]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

/**
 * Merges two settings objects.
 */
SettingSchema.method('merge', function(src) {
  SettingSchema.eachPath((path) => {

    // Exclude internal fields...
    if (['id', '_id', '__v', 'created_at', 'updated_at'].includes(path)) {
      return;
    }

    // If the source object contains the path, shallow copy it.
    if (path in src) {
      this[path] = src[path];
    }
  });
});

/**
 * The Mongo Mongoose object.
 */
const Setting = mongoose.model('Setting', SettingSchema);

module.exports = Setting;
module.exports.MODERATION_OPTIONS = MODERATION_OPTIONS;
