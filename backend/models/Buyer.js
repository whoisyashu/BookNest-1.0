const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const buyerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        required: true,
        match: /.+\@.+\..+/
    },
    password:{
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    registrationDate:{
        type: Date,
        required: true,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    address: [
        {
            street:  { type: String, required: true },
            city:    { type: String, required: true },
            state:   { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, default: "India" },
            label:   { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
            isDefault: { type: Boolean, default: false }
        }
    ],
    isDeleted:{
        type: Boolean,
        default: false
    }
});

buyerSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

buyerSchema.pre('save', async function(next){
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

buyerSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Buyer', buyerSchema);