const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      console.log('🔐 Google login attempt:', email);
      
      // Check if user exists
      let user = await User.findOne({ email });
      
      if (user) {
        // Existing user - mark as returning user
        if (!user.googleId) {
          user.googleId = profile.id;
          user.isVerified = true;
          await user.save();
        }
        
        console.log('✅ Existing user logged in:', user.email);
        
        // Mark as existing user (for login notification)
        user.isNewUser = false;
        
        return done(null, user);
      }
      
      // Create new user
      user = await User.create({
        name: profile.displayName,
        email: email,
        googleId: profile.id,
        isVerified: true,
        avatar: profile.photos[0]?.value,
        isAdmin: false,
        password: require('crypto').randomBytes(32).toString('hex') // Random password for Google users
      });
      
      console.log('✅ New Google user created:', user.email);
      
      // Mark as new user (for welcome email)
      user.isNewUser = true;
      
      done(null, user);
      
    } catch (error) {
      console.error('❌ Google auth error:', error);
      done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
