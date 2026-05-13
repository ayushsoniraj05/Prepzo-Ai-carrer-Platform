import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, displayName, emails, photos } = profile;
          const email = emails[0].value;
          const avatar = photos[0]?.value;

          // 1. Check if user with this googleId exists
          let user = await User.findOne({ googleId: id });

          if (user) {
            return done(null, user);
          }

          // 2. Check if user with this email exists (link account)
          user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            user.googleId = id;
            if (!user.avatar) user.avatar = avatar;
            await user.save();
            return done(null, user);
          }

          // 3. Create new user
          user = await User.create({
            fullName: displayName,
            email: email.toLowerCase(),
            googleId: id,
            avatar: avatar,
            isEmailVerified: true,
            accountStatus: 'active',
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth credentials missing. Google Login will be disabled.');
}


// Serialize/Deserialize (not used for JWT but needed by passport)
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

export default passport;
