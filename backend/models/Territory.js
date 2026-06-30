const mongoose = require('mongoose')

const houseSchema = new mongoose.Schema({
  streetAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['unvisited', 'not_interested', 'no_answer', 'sold'],
    default: 'unvisited'
  },
  lastVisit: { type: Date }
})

const territorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  assignedRep: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['available', 'claimed', 'completed'],
    default: 'available'
  },
  houses: [houseSchema]
}, { timestamps: true })

module.exports = mongoose.model('Territory', territorySchema)
